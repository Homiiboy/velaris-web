import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { describe, expect, it } from 'vitest';

import type { ItemDto } from 'types/base/models/item-dto';

import {
    buildSmartHomeGenreRows,
    buildSmartHomeRows,
    DEFAULT_SMART_HOME_PREFERENCES,
    getAvailableSmartHomeGenres,
    moveSmartHomeRow,
    sanitizeSmartHomePreferences,
    SMART_HOME_ROW_IDS,
    toggleSmartHomeRow
} from './smartHome';

const createItem = (id: string, overrides: Partial<ItemDto> = {}): ItemDto => ({
    Id: id,
    Name: id,
    Type: BaseItemKind.Movie,
    ...overrides
} as ItemDto);

describe('Smart Home preferences', () => {
    it('replaces removed sections with genre shelves for stored preferences', () => {
        const preferences = sanitizeSmartHomePreferences({
            order: [ 'tonight', 'because', 'genre-horror', 'short', 'unknown', 'genre-horror' ],
            disabled: [ 'unwatched', 'genre-action', 'invalid' ]
        });

        expect(preferences.order).toEqual([
            'because',
            'genre-horror',
            ...SMART_HOME_ROW_IDS.filter(id => id !== 'because' && id !== 'genre-horror')
        ]);
        expect(preferences.disabled).toEqual([ 'genre-action' ]);
    });

    it('moves rows without crossing list boundaries', () => {
        const moved = moveSmartHomeRow(DEFAULT_SMART_HOME_PREFERENCES, 'genre-scifi', -1);
        expect(moved.order.slice(0, 3)).toEqual([
            'continue',
            'genre-scifi',
            'because'
        ]);
        expect(moveSmartHomeRow(moved, 'continue', -1)).toBe(moved);
    });

    it('toggles genre row visibility deterministically', () => {
        const disabled = toggleSmartHomeRow(DEFAULT_SMART_HOME_PREFERENCES, 'genre-horror');
        expect(disabled.disabled).toEqual([ 'genre-horror' ]);
        expect(toggleSmartHomeRow(disabled, 'genre-horror').disabled).toEqual([]);
    });
});

describe('personalized recommendations', () => {
    it('retains the because-you-watched recommendation', () => {
        const watched = [ createItem('watched', { Name: 'Recent Space Film', Genres: [ 'Science Fiction' ] }) ];
        const candidates = [
            createItem('drama', { Genres: [ 'Drama' ] }),
            createItem('space', { Genres: [ 'Science Fiction' ] })
        ];

        const rows = buildSmartHomeRows(candidates, watched, DEFAULT_SMART_HOME_PREFERENCES);

        expect(rows.map(row => row.id)).toEqual([ 'because' ]);
        expect(rows[0]?.title).toContain('Recent Space Film');
        expect(rows[0]?.items[0]?.Id).toBe('space');
    });

    it('does not display old evening, short, or unwatched shelves', () => {
        const rows = buildSmartHomeRows([
            createItem('one', { Genres: [ 'Action' ] })
        ], [], DEFAULT_SMART_HOME_PREFERENCES);

        expect(rows).toHaveLength(0);
    });
});

describe('genre shelves', () => {
    it('maps actual localized genre names without inventing absent categories', () => {
        const sources = getAvailableSmartHomeGenres([
            'Science-Fiction',
            'Sci Fi',
            'Horror',
            'Komödie',
            'Unknown'
        ]);
        expect(sources.filter(source => source.id === 'genre-scifi')).toHaveLength(2);
        expect(sources.some(source => source.id === 'genre-horror')).toBe(true);
        expect(sources.some(source => source.id === 'genre-comedy')).toBe(true);
        expect(sources.some(source => source.id === 'genre-action')).toBe(false);
    });

    it('hides empty genres and categories containing only series', () => {
        const rows = buildSmartHomeGenreRows([
            { id: 'genre-horror', genre: 'Horror', items: [] },
            { id: 'genre-action', genre: 'Action', items: [
                createItem('show', { Type: BaseItemKind.Series })
            ] }
        ]);
        expect(rows).toEqual([]);
    });

    it('merges genre aliases and removes duplicate film IDs within a row', () => {
        const movie = createItem('space', { DateCreated: '2026-09-01T10:00:00Z' });
        const rows = buildSmartHomeGenreRows([
            { id: 'genre-scifi', genre: 'Sci-Fi', items: [ movie ] },
            { id: 'genre-scifi', genre: 'Science Fiction', items: [
                movie,
                createItem('new-space', { DateCreated: '2026-09-02T10:00:00Z' })
            ] }
        ]);
        expect(rows.map(row => row.id)).toEqual([ 'genre-scifi' ]);
        expect(rows[0].items.map(item => item.Id)).toEqual([ 'new-space', 'space' ]);
    });
});
