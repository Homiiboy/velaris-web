import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';

import type { ItemDto } from 'types/base/models/item-dto';

export const SMART_HOME_GENRES = [
    { id: 'genre-scifi', title: 'Science-Fiction', aliases: [ 'Science Fiction', 'Sci-Fi', 'Sci Fi', 'Sciencefiction', 'SF' ] },
    { id: 'genre-horror', title: 'Horror', aliases: [ 'Horror' ] },
    { id: 'genre-action', title: 'Action', aliases: [ 'Action', 'Action & Adventure' ] },
    { id: 'genre-thriller', title: 'Thriller', aliases: [ 'Thriller', 'Suspense' ] },
    { id: 'genre-adventure', title: 'Abenteuer', aliases: [ 'Adventure', 'Abenteuer', 'Action & Adventure' ] },
    { id: 'genre-comedy', title: 'Komödie', aliases: [ 'Comedy', 'Komödie', 'Komodie' ] },
    { id: 'genre-drama', title: 'Drama', aliases: [ 'Drama' ] },
    { id: 'genre-fantasy', title: 'Fantasy', aliases: [ 'Fantasy', 'Fantastik' ] },
    { id: 'genre-animation', title: 'Animation', aliases: [ 'Animation', 'Anime', 'Animated' ] },
    { id: 'genre-crime', title: 'Krimi', aliases: [ 'Crime', 'Krimi', 'Kriminalfilm' ] },
    { id: 'genre-mystery', title: 'Mystery', aliases: [ 'Mystery', 'Mysterie' ] },
    { id: 'genre-romance', title: 'Romantik', aliases: [ 'Romance', 'Romantik', 'Liebesfilm' ] },
    { id: 'genre-documentary', title: 'Dokumentation', aliases: [ 'Documentary', 'Dokumentation', 'Dokumentarfilm' ] },
    { id: 'genre-family', title: 'Familie', aliases: [ 'Family', 'Familie', 'Familienfilm' ] },
    { id: 'genre-western', title: 'Western', aliases: [ 'Western' ] },
    { id: 'genre-war', title: 'Kriegsfilme', aliases: [ 'War', 'Krieg', 'Kriegsfilm' ] },
    { id: 'genre-music', title: 'Musik', aliases: [ 'Music', 'Musik', 'Musical' ] },
    { id: 'genre-history', title: 'Historie', aliases: [ 'History', 'Geschichte', 'Historie' ] }
] as const;

export type SmartHomeGenreRowId = typeof SMART_HOME_GENRES[number]['id'];
export type SmartHomeRowId = 'continue' | 'because' | SmartHomeGenreRowId;

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
    ...SMART_HOME_GENRES.map(genre => genre.id)
];

export const DEFAULT_SMART_HOME_PREFERENCES: SmartHomePreferences = {
    order: [ ...SMART_HOME_ROW_IDS ],
    disabled: []
};

export const SMART_HOME_ROW_LABELS = {
    continue: 'Weiterschauen',
    because: 'Für dich ausgewählt',
    ...Object.fromEntries(SMART_HOME_GENRES.map(genre => [ genre.id, genre.title ]))
} as Record<SmartHomeRowId, string>;

export const MAX_SMART_HOME_ROW_ITEMS = 12;

type RecommendationRowId = 'because';

export interface SmartHomeGenreSource {
    id: SmartHomeGenreRowId
    genre: string
}

export interface SmartHomeGenreResult extends SmartHomeGenreSource {
    items: ItemDto[]
}

/** Resolve real Jellyfin movie genres, including localized names and aliases. */
export const getAvailableSmartHomeGenres = (names: string[]): SmartHomeGenreSource[] => {
    const normalize = (value: string) => value.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]/g, '');
    const sources: SmartHomeGenreSource[] = [];

    for (const genre of SMART_HOME_GENRES) {
        const aliases = genre.aliases.map(normalize);
        for (const name of new Set(names)) {
            if (name && aliases.includes(normalize(name))) {
                sources.push({ id: genre.id, genre: name });
            }
        }
    }

    return sources;
};

/** A genre only appears once Jellyfin actually returns at least one movie. */
export const buildSmartHomeGenreRows = (sources: SmartHomeGenreResult[]): SmartHomeRow[] => (
    SMART_HOME_GENRES.flatMap<SmartHomeRow>(genre => {
        const seen = new Set<string>();
        const items = sources
            .filter(source => source.id === genre.id)
            .flatMap(source => source.items)
            .filter(item => {
                if (item.Type !== BaseItemKind.Movie || !item.Id || !item.Name || seen.has(item.Id)) {
                    return false;
                }
                seen.add(item.Id);
                return true;
            })
            .sort((a, b) => (b.DateCreated || '').localeCompare(a.DateCreated || ''))
            .slice(0, MAX_SMART_HOME_ROW_ITEMS);

        return items.length > 0 ? [ {
            id: genre.id,
            title: genre.title,
            subtitle: 'Filme aus deiner Mediathek.',
            items
        } ] : [];
    })
);

interface SmartHomeRowCandidateSet {
    title: string
    subtitle: string
    candidates: ItemDto[]
}

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
    limit = MAX_SMART_HOME_ROW_ITEMS
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

const buildCandidateSets = (
    candidates: ItemDto[],
    recentlyWatchedItems: ItemDto[],
    genreWeights: Map<string, number>
) => {
    const referenceTitle = recentlyWatchedItems.find(item => item.Name)?.Name;
    const personalizedCandidates = candidates
        .filter(item => getGenreScore(item, genreWeights) > 0)
        .sort(compareCandidates(genreWeights));

    return new Map<RecommendationRowId, SmartHomeRowCandidateSet>([
        [ 'because', {
            title: referenceTitle ? `Weil du „${referenceTitle}“ gesehen hast` : 'Für dich ausgewählt',
            subtitle: 'Passend zu deinen zuletzt gesehenen Genres.',
            candidates: personalizedCandidates
        } ]
    ]);
};

export const buildSmartHomeRows = (
    unplayedItems: ItemDto[],
    recentlyWatchedItems: ItemDto[],
    preferences: SmartHomePreferences
): SmartHomeRow[] => {
    const sanitizedPreferences = sanitizeSmartHomePreferences(preferences);
    const genreWeights = getGenreWeights(recentlyWatchedItems);
    const candidates = unplayedItems.filter(item => (
        item.Type === BaseItemKind.Movie || item.Type === BaseItemKind.Series
    ));
    const candidateSets = buildCandidateSets(candidates, recentlyWatchedItems, genreWeights);
    const used = new Set<string>();
    const rows: SmartHomeRow[] = [];

    for (const rowId of sanitizedPreferences.order) {
        if (rowId !== 'because' || sanitizedPreferences.disabled.includes(rowId)) continue;

        const candidateSet = candidateSets.get(rowId);
        if (!candidateSet) continue;

        const items = takeUnique(candidateSet.candidates, used);
        if (items.length === 0) continue;

        rows.push({
            id: rowId,
            title: candidateSet.title,
            subtitle: candidateSet.subtitle,
            items
        });
    }

    return rows;
};
