import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';

import type { ItemDto } from 'types/base/models/item-dto';

export type SmartHomeRowId = 'continue' | 'because' | 'tonight' | 'short' | 'unwatched';

export interface SmartHomePreferences {
    order: SmartHomeRowId[]
    disabled: SmartHomeRowId[]
}

export interface SmartHomeRow {
    id: Exclude<SmartHomeRowId, 'continue'>
    title: string
    subtitle: string
    items: ItemDto[]
}

export const SMART_HOME_ROW_IDS: SmartHomeRowId[] = [
    'continue',
    'because',
    'tonight',
    'short',
    'unwatched'
];

export const DEFAULT_SMART_HOME_PREFERENCES: SmartHomePreferences = {
    order: [ ...SMART_HOME_ROW_IDS ],
    disabled: []
};

export const SMART_HOME_ROW_LABELS: Record<SmartHomeRowId, string> = {
    continue: 'Weiterschauen',
    because: 'Für dich ausgewählt',
    tonight: 'Für heute Abend',
    short: 'Kurz & gut',
    unwatched: 'Noch nicht gesehen'
};

const MAX_ROW_ITEMS = 12;
const TICKS_PER_MINUTE = 600000000;

const isSmartHomeRowId = (value: unknown): value is SmartHomeRowId => (
    typeof value === 'string' && SMART_HOME_ROW_IDS.includes(value as SmartHomeRowId)
);

export const sanitizeSmartHomePreferences = (value: unknown): SmartHomePreferences => {
    if (!value || typeof value !== 'object') {
        return {
            order: [ ...DEFAULT_SMART_HOME_PREFERENCES.order ],
            disabled: []
        };
    }

    const candidate = value as Partial<SmartHomePreferences>;
    const requestedOrder = Array.isArray(candidate.order) ? candidate.order.filter(isSmartHomeRowId) : [];
    const uniqueOrder = [ ...new Set(requestedOrder) ];
    const missingRows = SMART_HOME_ROW_IDS.filter(rowId => !uniqueOrder.includes(rowId));
    const disabled = Array.isArray(candidate.disabled) ?
        [ ...new Set(candidate.disabled.filter(isSmartHomeRowId)) ] :
        [];

    return {
        order: [ ...uniqueOrder, ...missingRows ],
        disabled
    };
};

export const moveSmartHomeRow = (
    preferences: SmartHomePreferences,
    rowId: SmartHomeRowId,
    direction: -1 | 1
): SmartHomePreferences => {
    const currentIndex = preferences.order.indexOf(rowId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= preferences.order.length) {
        return preferences;
    }

    const order = [ ...preferences.order ];
    [ order[currentIndex], order[nextIndex] ] = [ order[nextIndex], order[currentIndex] ];

    return { ...preferences, order };
};

export const toggleSmartHomeRow = (
    preferences: SmartHomePreferences,
    rowId: SmartHomeRowId
): SmartHomePreferences => ({
    ...preferences,
    disabled: preferences.disabled.includes(rowId) ?
        preferences.disabled.filter(id => id !== rowId) :
        [ ...preferences.disabled, rowId ]
});

const normalizeGenre = (value: string) => value.trim().toLocaleLowerCase();

const getGenres = (item: ItemDto) => (
    (item.Genres || []).map(normalizeGenre).filter(Boolean)
);

const getItemKey = (item: ItemDto) => item.Id || `${item.Type || 'Item'}:${item.Name || item.OriginalTitle || 'Unknown'}`;

const getRuntimeMinutes = (item: ItemDto) => (
    item.RunTimeTicks ? Math.round(item.RunTimeTicks / TICKS_PER_MINUTE) : undefined
);

const getGenreWeights = (watchedItems: ItemDto[]) => {
    const weights = new Map<string, number>();

    watchedItems.slice(0, 24).forEach((item, index) => {
        const recencyWeight = Math.max(1, 8 - Math.floor(index / 3));
        getGenres(item).forEach(genre => {
            weights.set(genre, (weights.get(genre) || 0) + recencyWeight);
        });
    });

    return weights;
};

const getGenreScore = (item: ItemDto, genreWeights: Map<string, number>) => (
    getGenres(item).reduce((score, genre) => score + (genreWeights.get(genre) || 0), 0)
);

const compareCandidates = (genreWeights: Map<string, number>) => (a: ItemDto, b: ItemDto) => {
    const scoreDifference = getGenreScore(b, genreWeights) - getGenreScore(a, genreWeights);
    if (scoreDifference !== 0) return scoreDifference;

    const ratingDifference = (b.CommunityRating || 0) - (a.CommunityRating || 0);
    if (ratingDifference !== 0) return ratingDifference;

    return (b.ProductionYear || 0) - (a.ProductionYear || 0);
};

const takeUnique = (
    items: ItemDto[],
    used: Set<string>,
    limit = MAX_ROW_ITEMS
) => {
    const selected: ItemDto[] = [];

    for (const item of items) {
        const key = getItemKey(item);
        if (!item.Id || !item.Name || used.has(key)) continue;

        selected.push(item);
        used.add(key);
        if (selected.length >= limit) break;
    }

    return selected;
};

export const buildSmartHomeRows = (
    unplayedItems: ItemDto[],
    recentlyWatchedItems: ItemDto[],
    preferences: SmartHomePreferences
): SmartHomeRow[] => {
    const sanitizedPreferences = sanitizeSmartHomePreferences(preferences);
    const genreWeights = getGenreWeights(recentlyWatchedItems);
    const compareByPreference = compareCandidates(genreWeights);
    const candidates = unplayedItems.filter(item => (
        item.Type === BaseItemKind.Movie || item.Type === BaseItemKind.Series
    ));
    const used = new Set<string>();
    const rows = new Map<Exclude<SmartHomeRowId, 'continue'>, SmartHomeRow>();

    const personalizedCandidates = candidates
        .filter(item => getGenreScore(item, genreWeights) > 0)
        .sort(compareByPreference);
    const becauseItems = takeUnique(personalizedCandidates, used);
    const referenceTitle = recentlyWatchedItems.find(item => item.Name)?.Name;
    if (becauseItems.length > 0) {
        rows.set('because', {
            id: 'because',
            title: referenceTitle ? `Weil du „${referenceTitle}“ gesehen hast` : 'Für dich ausgewählt',
            subtitle: 'Passend zu deinen zuletzt gesehenen Genres.',
            items: becauseItems
        });
    }

    const tonightCandidates = candidates
        .filter(item => {
            if (item.Type !== BaseItemKind.Movie) return false;
            const runtime = getRuntimeMinutes(item);
            return runtime != null && runtime >= 80 && runtime <= 150;
        })
        .sort(compareByPreference);
    const tonightItems = takeUnique(tonightCandidates, used);
    if (tonightItems.length > 0) {
        rows.set('tonight', {
            id: 'tonight',
            title: 'Für heute Abend',
            subtitle: 'Filme mit einer angenehmen Abend-Laufzeit.',
            items: tonightItems
        });
    }

    const shortCandidates = candidates
        .filter(item => {
            if (item.Type !== BaseItemKind.Movie) return false;
            const runtime = getRuntimeMinutes(item);
            return runtime != null && runtime >= 20 && runtime <= 100;
        })
        .sort(compareByPreference);
    const shortItems = takeUnique(shortCandidates, used);
    if (shortItems.length > 0) {
        rows.set('short', {
            id: 'short',
            title: 'Kurz & gut',
            subtitle: 'Filme bis ungefähr 100 Minuten.',
            items: shortItems
        });
    }

    const unwatchedItems = takeUnique([ ...candidates ].sort(compareByPreference), used);
    if (unwatchedItems.length > 0) {
        rows.set('unwatched', {
            id: 'unwatched',
            title: 'Noch nicht gesehen',
            subtitle: 'Ungesehene Titel aus deiner Mediathek.',
            items: unwatchedItems
        });
    }

    return sanitizedPreferences.order
        .filter((rowId): rowId is Exclude<SmartHomeRowId, 'continue'> => rowId !== 'continue')
        .filter(rowId => !sanitizedPreferences.disabled.includes(rowId))
        .map(rowId => rows.get(rowId))
        .filter((row): row is SmartHomeRow => Boolean(row));
};
