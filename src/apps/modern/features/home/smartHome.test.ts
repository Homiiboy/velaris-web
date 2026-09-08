import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { describe, expect, it } from 'vitest';

import type { ItemDto } from 'types/base/models/item-dto';

import {
    buildSmartHomeRows,
    DEFAULT_SMART_HOME_PREFERENCES,
    moveSmartHomeRow,
    sanitizeSmartHomePreferences,
    toggleSmartHomeRow
} from './smartHome';

const TICKS_PER_MINUTE = 600000000;

const createItem = (id: string, overrides: Partial<ItemDto> = {}): ItemDto => ({
    Id: id,
    Name: id,
    Type: BaseItemKind.Movie,
    ...overrides
} as ItemDto);

describe('Smart Home preferences', () => {
    it('repairs missing and unknown row identifiers', () => {
        const preferences = sanitizeSmartHomePreferences({
            order: [ 'tonight', 'unknown', 'tonight' ],
            disabled: [ 'short', 'invalid' ]
        });

        expect(preferences.order).toEqual([
            'tonight',
            'continue',
            'because',
            'short',
            'unwatched'
        ]);
        expect(preferences.disabled).toEqual([ 'short' ]);
    });

    it('moves rows without crossing list boundaries', () => {
        const moved = moveSmartHomeRow(DEFAULT_SMART_HOME_PREFERENCES, 'tonight', -1);
        expect(moved.order).toEqual([
            'continue',
            'tonight',
            'because',
            'short',
            'unwatched'
        ]);

        expect(moveSmartHomeRow(moved, 'continue', -1)).toBe(moved);
    });

    it('toggles row visibility deterministically', () => {
        const disabled = toggleSmartHomeRow(DEFAULT_SMART_HOME_PREFERENCES, 'short');
        expect(disabled.disabled).toEqual([ 'short' ]);
        expect(toggleSmartHomeRow(disabled, 'short').disabled).toEqual([]);
    });
});

describe('buildSmartHomeRows', () => {
    it('prioritizes unwatched titles sharing genres with recent viewing', () => {
        const watched = [ createItem('watched', { Name: 'Recent Space Film', Genres: [ 'Science Fiction' ] }) ];
        const candidates = [
            createItem('drama', { Genres: [ 'Drama' ], RunTimeTicks: 125 * TICKS_PER_MINUTE }),
            createItem('space', { Genres: [ 'Science Fiction' ], RunTimeTicks: 125 * TICKS_PER_MINUTE })
        ];

        const rows = buildSmartHomeRows(candidates, watched, DEFAULT_SMART_HOME_PREFERENCES);
        const because = rows.find(row => row.id === 'because');

        expect(because?.title).toContain('Recent Space Film');
        expect(because?.items[0]?.Id).toBe('space');
    });

    it('places short movies in the short row and excludes long movies', () => {
        const candidates = [
            createItem('short', { RunTimeTicks: 88 * TICKS_PER_MINUTE }),
            createItem('long', { RunTimeTicks: 190 * TICKS_PER_MINUTE })
        ];
        const preferences = sanitizeSmartHomePreferences({
            order: [ 'short', 'unwatched', 'continue', 'because', 'tonight' ],
            disabled: []
        });

        const rows = buildSmartHomeRows(candidates, [], preferences);
        const short = rows.find(row => row.id === 'short');

        expect(short?.items.map(item => item.Id)).toEqual([ 'short' ]);
    });

    it('does not repeat the same media across recommendation rows', () => {
        const watched = [ createItem('watched', { Genres: [ 'Drama' ] }) ];
        const candidates = [
            createItem('one', { Genres: [ 'Drama' ], RunTimeTicks: 90 * TICKS_PER_MINUTE }),
            createItem('two', { Genres: [ 'Drama' ], RunTimeTicks: 95 * TICKS_PER_MINUTE }),
            createItem('three', { Genres: [ 'Comedy' ], RunTimeTicks: 180 * TICKS_PER_MINUTE })
        ];

        const rows = buildSmartHomeRows(candidates, watched, DEFAULT_SMART_HOME_PREFERENCES);
        const ids = rows.flatMap(row => row.items.map(item => item.Id));

        expect(new Set(ids).size).toBe(ids.length);
    });

    it('suppresses disabled and empty rows', () => {
        const preferences = sanitizeSmartHomePreferences({
            order: DEFAULT_SMART_HOME_PREFERENCES.order,
            disabled: [ 'unwatched' ]
        });
        const rows = buildSmartHomeRows([
            createItem('series', { Type: BaseItemKind.Series })
        ], [], preferences);

        expect(rows).toHaveLength(0);
    });
});
