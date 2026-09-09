import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { describe, expect, it } from 'vitest';

import type { ItemDto } from 'types/base/models/item-dto';

import {
    buildVelarisReleaseHubModel,
    getVelarisReleaseDateKey,
    getVelarisReleaseWeekStartMs,
    isVelarisSeasonPremiere,
    shouldFetchNextVelarisReleasePage,
    type VelarisReleaseSourceItem
} from './releaseHub';

const source = (
    id: string,
    category: VelarisReleaseSourceItem['category'],
    values: Partial<ItemDto>
): VelarisReleaseSourceItem => ({
    category,
    item: {
        Id: id,
        Name: id,
        ...values
    } as ItemDto
});

describe('Velaris release calendar dates', () => {
    it('uses stable UTC date keys', () => {
        expect(getVelarisReleaseDateKey(new Date('2026-09-09T23:30:00Z'))).toBe('2026-09-09');
    });

    it('starts release weeks on Monday', () => {
        expect(new Date(getVelarisReleaseWeekStartMs(new Date('2026-09-09T10:00:00Z'))).toISOString())
            .toBe('2026-09-07T00:00:00.000Z');
        expect(new Date(getVelarisReleaseWeekStartMs(new Date('2026-09-13T10:00:00Z'))).toISOString())
            .toBe('2026-09-07T00:00:00.000Z');
    });
});

describe('Velaris release paging', () => {
    it('keeps paging while a full descending page is still inside the requested window', () => {
        const items = [
            { DateCreated: '2026-09-09T09:00:00Z' },
            { DateCreated: '2026-09-08T09:00:00Z' }
        ] as ItemDto[];

        expect(shouldFetchNextVelarisReleasePage(
            items,
            'DateCreated',
            Date.parse('2026-09-07T00:00:00Z'),
            2,
            10,
            2
        )).toBe(true);
    });

    it('stops after a descending page crosses the lower date boundary', () => {
        const items = [
            { PremiereDate: '2026-09-10T00:00:00Z' },
            { PremiereDate: '2026-09-01T00:00:00Z' }
        ] as ItemDto[];

        expect(shouldFetchNextVelarisReleasePage(
            items,
            'PremiereDate',
            Date.parse('2026-09-09T00:00:00Z'),
            2,
            100,
            2
        )).toBe(false);
    });

    it('treats premiere dates as calendar dates instead of timezone instants', () => {
        const items = [
            { PremiereDate: '2026-09-11T00:00:00+14:00' },
            { PremiereDate: '2026-09-10T00:00:00+14:00' }
        ] as ItemDto[];

        expect(shouldFetchNextVelarisReleasePage(
            items,
            'PremiereDate',
            Date.parse('2026-09-10T00:00:00Z'),
            2,
            10,
            2
        )).toBe(true);
    });

    it('stops on short pages and known total-count boundaries', () => {
        expect(shouldFetchNextVelarisReleasePage(
            [ { DateCreated: '2026-09-09T09:00:00Z' } ] as ItemDto[],
            'DateCreated',
            0,
            1,
            10,
            2
        )).toBe(false);

        expect(shouldFetchNextVelarisReleasePage(
            [
                { DateCreated: '2026-09-09T09:00:00Z' },
                { DateCreated: '2026-09-08T09:00:00Z' }
            ] as ItemDto[],
            'DateCreated',
            0,
            2,
            2,
            2
        )).toBe(false);
    });
});

describe('Velaris release hub model', () => {
    const now = new Date('2026-09-09T10:00:00Z');

    it('selects newly added series and episodes from the current week', () => {
        const model = buildVelarisReleaseHubModel([
            source('series-new', 'series', {
                Type: BaseItemKind.Series,
                DateCreated: '2026-09-08T12:00:00Z'
            }),
            source('episode-new', 'anime', {
                Type: BaseItemKind.Episode,
                DateCreated: '2026-09-09T08:00:00Z'
            }),
            source('episode-old', 'series', {
                Type: BaseItemKind.Episode,
                DateCreated: '2026-09-06T23:59:59Z'
            })
        ], [], now);

        expect(model.newThisWeek.map(entry => entry.item.Id)).toEqual([
            'episode-new',
            'series-new'
        ]);
        expect(model.newEpisodesThisWeek.map(entry => entry.item.Id)).toEqual([
            'episode-new'
        ]);
    });

    it('builds a chronological 28-day episode calendar', () => {
        const model = buildVelarisReleaseHubModel([], [
            source('tomorrow', 'series', {
                Type: BaseItemKind.Episode,
                PremiereDate: '2026-09-10T00:00:00Z',
                SeriesName: 'Beta',
                IndexNumber: 2,
                ParentIndexNumber: 1
            }),
            source('today', 'anime', {
                Type: BaseItemKind.Episode,
                PremiereDate: '2026-09-09T00:00:00Z',
                SeriesName: 'Alpha',
                IndexNumber: 4,
                ParentIndexNumber: 1
            }),
            source('too-late', 'series', {
                Type: BaseItemKind.Episode,
                PremiereDate: '2026-10-07T00:00:00Z'
            }),
            source('yesterday', 'series', {
                Type: BaseItemKind.Episode,
                PremiereDate: '2026-09-08T00:00:00Z'
            })
        ], now);

        expect(model.calendarDays.map(day => day.dateKey)).toEqual([
            '2026-09-09',
            '2026-09-10'
        ]);
        expect(model.calendarDays.flatMap(day => day.entries.map(entry => entry.item.Id))).toEqual([
            'today',
            'tomorrow'
        ]);
    });

    it('preserves the premiere calendar date when metadata carries an offset', () => {
        const model = buildVelarisReleaseHubModel([], [
            source('offset-release', 'series', {
                Type: BaseItemKind.Episode,
                PremiereDate: '2026-09-10T00:00:00+14:00',
                SeriesName: 'Offset Show',
                IndexNumber: 2,
                ParentIndexNumber: 1
            })
        ], now);

        expect(model.calendarDays.map(day => day.dateKey)).toEqual([ '2026-09-10' ]);
    });

    it('recognizes normal season premieres but not specials', () => {
        expect(isVelarisSeasonPremiere({
            Type: BaseItemKind.Episode,
            IndexNumber: 1,
            ParentIndexNumber: 2
        } as ItemDto)).toBe(true);

        expect(isVelarisSeasonPremiere({
            Type: BaseItemKind.Episode,
            IndexNumber: 1,
            ParentIndexNumber: 0
        } as ItemDto)).toBe(false);
    });

    it('prefers anime category when an item appears in overlapping libraries', () => {
        const model = buildVelarisReleaseHubModel([
            source('duplicate', 'series', {
                Type: BaseItemKind.Episode,
                DateCreated: '2026-09-09T08:00:00Z'
            }),
            source('duplicate', 'anime', {
                Type: BaseItemKind.Episode,
                DateCreated: '2026-09-09T08:00:00Z'
            })
        ], [], now);

        expect(model.newThisWeek).toHaveLength(1);
        expect(model.newThisWeek[0]?.category).toBe('anime');
    });

    it('ignores malformed dates instead of breaking the hub', () => {
        const model = buildVelarisReleaseHubModel([
            source('bad-created', 'series', {
                Type: BaseItemKind.Series,
                DateCreated: 'not-a-date'
            })
        ], [
            source('bad-premiere', 'anime', {
                Type: BaseItemKind.Episode,
                PremiereDate: 'not-a-date'
            }),
            source('invalid-calendar-date', 'series', {
                Type: BaseItemKind.Episode,
                PremiereDate: '2026-02-30T00:00:00Z'
            })
        ], now);

        expect(model.newThisWeek).toEqual([]);
        expect(model.calendarDays).toEqual([]);
    });
});
