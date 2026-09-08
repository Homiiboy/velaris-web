import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';

import type { VelarisLibraryCategory } from 'apps/modern/utils/velarisNavigation';
import type { ItemDto } from 'types/base/models/item-dto';

export type DiscoveryContentKind = 'all' | 'movies' | 'series' | 'anime' | 'anime-movies';
export type DiscoveryWatchState = 'all' | 'unwatched' | 'watched';
export type DiscoveryRuntime = 'all' | 'short' | 'standard' | 'long';
export type DiscoverySmartListId = 'unwatched' | 'short' | 'top-rated' | 'recent';
export type DiscoveryItemCategory = Extract<VelarisLibraryCategory, 'movies' | 'series' | 'anime' | 'anime-movies'>;
export type DiscoveryCategoryMap = Record<string, DiscoveryItemCategory>;

export interface DiscoveryFilters {
    query: string
    contentKind: DiscoveryContentKind
    genre: string
    watchState: DiscoveryWatchState
    runtime: DiscoveryRuntime
    minYear?: number
    maxYear?: number
    minRating?: number
}

export interface VelarisCustomList {
    id: string
    name: string
    itemIds: string[]
    createdAt: string
}

export interface VelarisDiscoveryStore {
    version: 1
    watchlist: string[]
    customLists: VelarisCustomList[]
}

export interface DiscoverySmartList {
    id: DiscoverySmartListId
    name: string
    description: string
    items: ItemDto[]
}

export const DEFAULT_DISCOVERY_FILTERS: DiscoveryFilters = {
    query: '',
    contentKind: 'all',
    genre: '',
    watchState: 'all',
    runtime: 'all'
};

export const EMPTY_DISCOVERY_STORE: VelarisDiscoveryStore = {
    version: 1,
    watchlist: [],
    customLists: []
};

const TICKS_PER_MINUTE = 600000000;
const RECENT_WINDOW_DAYS = 45;
const MILLISECONDS_PER_DAY = 86400000;
const MAX_CUSTOM_LISTS = 50;
const MAX_LIST_ITEMS = 5000;
const MAX_LIST_NAME_LENGTH = 48;

const uniqueStrings = (value: unknown, limit = MAX_LIST_ITEMS): string[] => {
    if (!Array.isArray(value)) return [];

    return [ ...new Set(value.filter((entry): entry is string => (
        typeof entry === 'string' && Boolean(entry.trim())
    )).map(entry => entry.trim())) ].slice(0, limit);
};

const sanitizeListName = (value: unknown) => (
    typeof value === 'string' ? value.trim().slice(0, MAX_LIST_NAME_LENGTH) : ''
);

const sanitizeCustomLists = (value: unknown): VelarisCustomList[] => {
    if (!Array.isArray(value)) return [];

    const seen = new Set<string>();
    const lists: VelarisCustomList[] = [];

    value.some((candidate, index) => {
        if (lists.length >= MAX_CUSTOM_LISTS) return true;
        if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return false;

        const raw = candidate as Partial<VelarisCustomList>;
        const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : `list-${index + 1}`;
        const name = sanitizeListName(raw.name);
        if (!name || seen.has(id)) return false;

        seen.add(id);
        lists.push({
            id,
            name,
            itemIds: uniqueStrings(raw.itemIds),
            createdAt: typeof raw.createdAt === 'string' && raw.createdAt ? raw.createdAt : new Date(0).toISOString()
        });
        return false;
    });

    return lists;
};

export const sanitizeDiscoveryStore = (value: unknown): VelarisDiscoveryStore => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return { ...EMPTY_DISCOVERY_STORE };
    }

    const candidate = value as Partial<VelarisDiscoveryStore>;
    return {
        version: 1,
        watchlist: uniqueStrings(candidate.watchlist),
        customLists: sanitizeCustomLists(candidate.customLists)
    };
};

const createListId = (store: VelarisDiscoveryStore) => {
    const reserved = new Set(store.customLists.map(list => list.id));
    let index = store.customLists.length + 1;
    let id = `list-${index}`;

    while (reserved.has(id)) {
        index += 1;
        id = `list-${index}`;
    }

    return id;
};

export const createDiscoveryList = (
    store: VelarisDiscoveryStore,
    name: string,
    now = new Date()
): VelarisDiscoveryStore => {
    const cleanName = sanitizeListName(name);
    if (!cleanName || store.customLists.length >= MAX_CUSTOM_LISTS) return store;

    return {
        ...store,
        customLists: [
            ...store.customLists,
            {
                id: createListId(store),
                name: cleanName,
                itemIds: [],
                createdAt: now.toISOString()
            }
        ]
    };
};

export const renameDiscoveryList = (
    store: VelarisDiscoveryStore,
    listId: string,
    name: string
): VelarisDiscoveryStore => {
    const cleanName = sanitizeListName(name);
    if (!cleanName) return store;

    return {
        ...store,
        customLists: store.customLists.map(list => (
            list.id === listId ? { ...list, name: cleanName } : list
        ))
    };
};

export const removeDiscoveryList = (
    store: VelarisDiscoveryStore,
    listId: string
): VelarisDiscoveryStore => ({
    ...store,
    customLists: store.customLists.filter(list => list.id !== listId)
});

const toggleId = (ids: string[], itemId: string) => {
    if (ids.includes(itemId)) return ids.filter(id => id !== itemId);
    if (ids.length >= MAX_LIST_ITEMS) return ids;
    return [ ...ids, itemId ];
};

export const toggleDiscoveryWatchlistItem = (
    store: VelarisDiscoveryStore,
    itemId: string
): VelarisDiscoveryStore => itemId ? {
    ...store,
    watchlist: toggleId(store.watchlist, itemId)
} : store;

export const toggleDiscoveryCustomListItem = (
    store: VelarisDiscoveryStore,
    listId: string,
    itemId: string
): VelarisDiscoveryStore => {
    if (!itemId) return store;

    return {
        ...store,
        customLists: store.customLists.map(list => (
            list.id === listId ? { ...list, itemIds: toggleId(list.itemIds, itemId) } : list
        ))
    };
};

const normalize = (value: string | null | undefined) => (value || '').trim().toLocaleLowerCase();

export const getDiscoveryRuntimeMinutes = (item: ItemDto) => (
    item.RunTimeTicks && item.RunTimeTicks > 0 ? Math.round(item.RunTimeTicks / TICKS_PER_MINUTE) : undefined
);

export const resolveDiscoveryItemCategory = (
    item: ItemDto,
    libraryCategory: VelarisLibraryCategory
): DiscoveryItemCategory | undefined => {
    const isMovie = item.Type === BaseItemKind.Movie;
    const isSeries = item.Type === BaseItemKind.Series;
    if (!isMovie && !isSeries) return undefined;

    if (libraryCategory === 'anime' || libraryCategory === 'anime-movies') {
        return isMovie ? 'anime-movies' : 'anime';
    }

    return isMovie ? 'movies' : 'series';
};

const matchesContentKind = (
    item: ItemDto,
    contentKind: DiscoveryContentKind,
    category: DiscoveryItemCategory | undefined
) => {
    if (contentKind === 'movies') return item.Type === BaseItemKind.Movie;
    if (contentKind === 'series') return item.Type === BaseItemKind.Series;
    if (contentKind === 'anime') return category === 'anime';
    if (contentKind === 'anime-movies') return category === 'anime-movies';
    return item.Type === BaseItemKind.Movie || item.Type === BaseItemKind.Series;
};

const matchesWatchState = (item: ItemDto, watchState: DiscoveryWatchState) => {
    if (watchState === 'watched') return Boolean(item.UserData?.Played);
    if (watchState === 'unwatched') return !item.UserData?.Played;
    return true;
};

const matchesRuntime = (item: ItemDto, runtime: DiscoveryRuntime) => {
    if (runtime === 'all') return true;

    const minutes = getDiscoveryRuntimeMinutes(item);
    if (minutes == null) return false;
    if (runtime === 'short') return minutes <= 90;
    if (runtime === 'standard') return minutes > 90 && minutes <= 140;
    return minutes > 140;
};

const matchesQuery = (item: ItemDto, query: string) => {
    const cleanQuery = normalize(query);
    if (!cleanQuery) return true;

    return [ item.Name, item.OriginalTitle, ...(item.Genres || []) ]
        .some(value => normalize(value).includes(cleanQuery));
};

const isValidNumber = (value: number | undefined) => value == null || Number.isFinite(value);

export const filterDiscoveryItems = (
    items: ItemDto[],
    filters: DiscoveryFilters,
    categoryByItemId: DiscoveryCategoryMap = {}
) => items.filter(item => {
    const category = item.Id ? categoryByItemId[item.Id] : undefined;
    if (!matchesContentKind(item, filters.contentKind, category)) return false;
    if (!matchesWatchState(item, filters.watchState)) return false;
    if (!matchesRuntime(item, filters.runtime)) return false;
    if (!matchesQuery(item, filters.query)) return false;

    if (filters.genre && !(item.Genres || []).includes(filters.genre)) return false;
    if (isValidNumber(filters.minYear) && filters.minYear != null && (item.ProductionYear || 0) < filters.minYear) return false;
    if (isValidNumber(filters.maxYear) && filters.maxYear != null && (item.ProductionYear || Number.MAX_SAFE_INTEGER) > filters.maxYear) return false;
    if (isValidNumber(filters.minRating) && filters.minRating != null && (item.CommunityRating || 0) < filters.minRating) return false;

    return true;
});

const isRecent = (item: ItemDto, now: number) => {
    if (!item.DateCreated) return false;

    const createdAt = Date.parse(item.DateCreated);
    if (!Number.isFinite(createdAt)) return false;
    return createdAt <= now && now - createdAt <= RECENT_WINDOW_DAYS * MILLISECONDS_PER_DAY;
};

export const sortDiscoveryItems = (items: ItemDto[]) => [ ...items ].sort((a, b) => {
    const aCreated = a.DateCreated ? Date.parse(a.DateCreated) : Number.NaN;
    const bCreated = b.DateCreated ? Date.parse(b.DateCreated) : Number.NaN;
    const safeA = Number.isFinite(aCreated) ? aCreated : 0;
    const safeB = Number.isFinite(bCreated) ? bCreated : 0;
    if (safeA !== safeB) return safeB - safeA;
    return (a.SortName || a.Name || '').localeCompare(b.SortName || b.Name || '');
});

export const shouldFetchNextDiscoveryPage = (
    pageLength: number,
    nextStartIndex: number,
    totalRecordCount: number | null | undefined,
    pageSize: number
) => {
    if (pageLength === 0 || pageLength < pageSize) return false;
    return totalRecordCount == null || nextStartIndex < totalRecordCount;
};

export const buildDiscoverySmartLists = (
    items: ItemDto[],
    now = Date.now()
): DiscoverySmartList[] => {
    const lists: DiscoverySmartList[] = [
        {
            id: 'unwatched',
            name: 'Noch ungesehen',
            description: 'Titel, die auf dich warten.',
            items: items.filter(item => !item.UserData?.Played)
        },
        {
            id: 'short',
            name: '90 Minuten oder kürzer',
            description: 'Für einen kompakten Filmabend.',
            items: items.filter(item => {
                const minutes = getDiscoveryRuntimeMinutes(item);
                return item.Type === BaseItemKind.Movie && minutes != null && minutes <= 90;
            })
        },
        {
            id: 'top-rated',
            name: 'Top bewertet',
            description: 'Stark bewertete Titel aus deiner Mediathek.',
            items: items.filter(item => (item.CommunityRating || 0) >= 8)
        },
        {
            id: 'recent',
            name: 'Neu in deiner Mediathek',
            description: 'In den letzten Wochen hinzugefügt.',
            items: items.filter(item => isRecent(item, now))
        }
    ];

    return lists.filter(list => list.items.length > 0);
};

const normalizeRandomValue = (value: number) => {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(0.9999999999999999, value));
};

export const pickDiscoverySurprise = (
    items: ItemDto[],
    random = Math.random
) => {
    if (items.length === 0) return undefined;

    const safeRandom = normalizeRandomValue(random());
    return items[Math.floor(safeRandom * items.length)];
};

export const resolveDiscoveryListItems = (itemIds: string[], items: ItemDto[]) => {
    const byId = new Map(items.filter(item => item.Id).map(item => [ item.Id as string, item ]));
    return itemIds.map(itemId => byId.get(itemId)).filter((item): item is ItemDto => Boolean(item));
};
