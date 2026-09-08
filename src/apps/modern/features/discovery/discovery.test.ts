import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { describe, expect, it } from 'vitest';

import type { ItemDto } from 'types/base/models/item-dto';

import {
    buildDiscoverySmartLists,
    createDiscoveryList,
    EMPTY_DISCOVERY_STORE,
    filterDiscoveryItems,
    pickDiscoverySurprise,
    sanitizeDiscoveryStore,
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

    it('builds automatic lists from library metadata and user state', () => {
        const smartLists = buildDiscoverySmartLists(items, Date.parse('2026-09-08T00:00:00Z'));

        expect(smartLists.find(list => list.id === 'short')?.items.map(item => item.Id)).toEqual([ 'short' ]);
        expect(smartLists.find(list => list.id === 'top-rated')?.items.map(item => item.Id)).toEqual([ 'short', 'series' ]);
        expect(smartLists.find(list => list.id === 'recent')?.items.map(item => item.Id)).toEqual([ 'short' ]);
    });

    it('selects a deterministic surprise item when a random source is supplied', () => {
        expect(pickDiscoverySurprise(items, () => 0.5)?.Id).toBe('long');
        expect(pickDiscoverySurprise([], () => 0)).toBeUndefined();
    });
});
