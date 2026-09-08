import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { describe, expect, it } from 'vitest';

import type { ItemDto } from 'types/base/models/item-dto';

import {
    buildDiscoverySmartLists,
    createDiscoveryList,
    EMPTY_DISCOVERY_STORE,
    filterDiscoveryItems,
    pickDiscoverySurprise,
    resolveDiscoveryItemCategory,
    sanitizeDiscoveryStore,
    shouldFetchNextDiscoveryPage,
    sortDiscoveryItems,
    toggleDiscoveryCustomListItem,
    toggleDiscoveryWatchlistItem
} from './discovery';

const TICKS_PER_MINUTE = 600000000;

const createItem = (id: string, overrides: Partial<ItemDto> = {}): ItemDto => ({
    Id: id,
    Name: id,
    Type: BaseItemKind.Movie,
    ...overrides
} as ItemDto);

describe('Velaris Discovery store', () => {
    it('repairs malformed persisted lists and removes duplicate ids', () => {
        const store = sanitizeDiscoveryStore({
            version: 99,
            watchlist: [ 'one', 'one', null ],
            customLists: [
                { id: 'weekend', name: ' Weekend ', itemIds: [ 'one', 'one', 'two' ] },
                { id: 'weekend', name: 'Duplicate', itemIds: [] },
                { id: 'broken', name: '', itemIds: [] }
            ]
        });

        expect(store.version).toBe(1);
        expect(store.watchlist).toEqual([ 'one' ]);
        expect(store.customLists).toHaveLength(1);
        expect(store.customLists[0].name).toBe('Weekend');
        expect(store.customLists[0].itemIds).toEqual([ 'one', 'two' ]);
    });

    it('creates lists and toggles watchlist/custom-list membership', () => {
        let store = createDiscoveryList(EMPTY_DISCOVERY_STORE, 'Family Night', new Date('2026-09-08T10:00:00Z'));
        const listId = store.customLists[0].id;

        store = toggleDiscoveryWatchlistItem(store, 'movie');
        store = toggleDiscoveryCustomListItem(store, listId, 'movie');

        expect(store.watchlist).toEqual([ 'movie' ]);
        expect(store.customLists[0].itemIds).toEqual([ 'movie' ]);
        expect(toggleDiscoveryWatchlistItem(store, 'movie').watchlist).toEqual([]);
    });

    it('caps user-controlled list names defensively', () => {
        const store = createDiscoveryList(EMPTY_DISCOVERY_STORE, 'x'.repeat(100));
        expect(store.customLists[0].name).toHaveLength(48);
    });
});

describe('Velaris Discovery filtering and Smart Lists', () => {
    const items = [
        createItem('short', {
            Name: 'Short Adventure',
            Genres: [ 'Adventure' ],
            ProductionYear: 2024,
            CommunityRating: 8.2,
            RunTimeTicks: 88 * TICKS_PER_MINUTE,
            DateCreated: '2026-09-01T00:00:00Z'
        }),
        createItem('long', {
            Name: 'Long Drama',
            Genres: [ 'Drama' ],
            ProductionYear: 2019,
            CommunityRating: 7.1,
            RunTimeTicks: 180 * TICKS_PER_MINUTE,
            UserData: { Played: true } as ItemDto['UserData']
        }),
        createItem('series', {
            Name: 'Adventure Series',
            Type: BaseItemKind.Series,
            Genres: [ 'Adventure' ],
            ProductionYear: 2025,
            CommunityRating: 8.8
        })
    ];

    it('combines content, genre, watched, runtime, year and rating filters', () => {
        const filtered = filterDiscoveryItems(items, {
            query: 'adventure',
            contentKind: 'movies',
            genre: 'Adventure',
            watchState: 'unwatched',
            runtime: 'short',
            minYear: 2020,
            minRating: 8
        });

        expect(filtered.map(item => item.Id)).toEqual([ 'short' ]);
    });

    it('classifies anime series and anime movies from their library context', () => {
        const animeSeries = createItem('anime-series', { Type: BaseItemKind.Series });
        const animeMovie = createItem('anime-movie');
        const categories = {
            'anime-series': resolveDiscoveryItemCategory(animeSeries, 'anime'),
            'anime-movie': resolveDiscoveryItemCategory(animeMovie, 'anime')
        };

        expect(categories['anime-series']).toBe('anime');
        expect(categories['anime-movie']).toBe('anime-movies');
        expect(filterDiscoveryItems([ animeSeries, animeMovie ], {
            ...EMPTY_FILTERS,
            contentKind: 'anime'
        }, { 'anime-series': 'anime', 'anime-movie': 'anime-movies' }).map(item => item.Id)).toEqual([ 'anime-series' ]);
        expect(filterDiscoveryItems([ animeSeries, animeMovie ], {
            ...EMPTY_FILTERS,
            contentKind: 'anime-movies'
        }, { 'anime-series': 'anime', 'anime-movie': 'anime-movies' }).map(item => item.Id)).toEqual([ 'anime-movie' ]);
    });

    it('handles missing or invalid metadata without matching constrained filters', () => {
        const unknown = createItem('unknown', {
            Name: 'Unknown',
            DateCreated: 'not-a-date'
        });

        expect(filterDiscoveryItems([ unknown ], {
            ...EMPTY_FILTERS,
            runtime: 'short'
        })).toEqual([]);
        expect(filterDiscoveryItems([ unknown ], {
            ...EMPTY_FILTERS,
            minYear: 2020
        })).toEqual([]);
        expect(buildDiscoverySmartLists([ unknown ], Date.parse('2026-09-08T00:00:00Z'))
            .find(list => list.id === 'recent')).toBeUndefined();
    });

    it('builds automatic lists from library metadata and user state', () => {
        const smartLists = buildDiscoverySmartLists(items, Date.parse('2026-09-08T00:00:00Z'));

        expect(smartLists.find(list => list.id === 'short')?.items.map(item => item.Id)).toEqual([ 'short' ]);
        expect(smartLists.find(list => list.id === 'top-rated')?.items.map(item => item.Id)).toEqual([ 'short', 'series' ]);
        expect(smartLists.find(list => list.id === 'recent')?.items.map(item => item.Id)).toEqual([ 'short' ]);
    });

    it('sorts new media first while keeping invalid dates deterministic', () => {
        const sorted = sortDiscoveryItems([
            createItem('old', { DateCreated: '2025-01-01T00:00:00Z' }),
            createItem('unknown', { DateCreated: 'bad', SortName: 'A' }),
            createItem('new', { DateCreated: '2026-01-01T00:00:00Z' })
        ]);

        expect(sorted.map(item => item.Id)).toEqual([ 'new', 'old', 'unknown' ]);
    });

    it('selects a bounded deterministic surprise item', () => {
        expect(pickDiscoverySurprise(items, () => 0.5)?.Id).toBe('long');
        expect(pickDiscoverySurprise(items, () => 2)?.Id).toBe('series');
        expect(pickDiscoverySurprise(items, () => -1)?.Id).toBe('short');
        expect(pickDiscoverySurprise([], () => 0)).toBeUndefined();
    });
});

describe('Velaris Discovery paging', () => {
    it('continues full pages until the server total is reached', () => {
        expect(shouldFetchNextDiscoveryPage(250, 250, 700, 250)).toBe(true);
        expect(shouldFetchNextDiscoveryPage(250, 750, 700, 250)).toBe(false);
        expect(shouldFetchNextDiscoveryPage(100, 600, undefined, 250)).toBe(false);
        expect(shouldFetchNextDiscoveryPage(0, 0, undefined, 250)).toBe(false);
    });
});

const EMPTY_FILTERS = {
    query: '',
    contentKind: 'all' as const,
    genre: '',
    watchState: 'all' as const,
    runtime: 'all' as const
};
