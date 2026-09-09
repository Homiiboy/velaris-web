import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { describe, expect, it } from 'vitest';

import type { ItemDto } from 'types/base/models/item-dto';

import {
    buildVelarisInsightsModel,
    getVelarisKnownPlayCount
} from './insights';

const source = (id: string, values: Partial<ItemDto>): ItemDto => ({
    Id: id,
    Name: id,
    ...values
} as ItemDto);

const userData = (
    played: boolean,
    playCount: number,
    lastPlayedDate?: string
): NonNullable<ItemDto['UserData']> => ({
    Key: '',
    Played: played,
    PlayCount: playCount,
    LastPlayedDate: lastPlayedDate
});

describe('Velaris Insights model', () => {
    const now = new Date('2026-09-09T12:00:00Z');

    it('uses server play counts with a played fallback', () => {
        expect(getVelarisKnownPlayCount(source('counted', {
            UserData: userData(true, 3)
        }))).toBe(3);
        expect(getVelarisKnownPlayCount(source('fallback', {
            UserData: userData(true, 0)
        }))).toBe(1);
        expect(getVelarisKnownPlayCount(source('unplayed', {
            UserData: userData(false, 0)
        }))).toBe(0);
    });

    it('builds personal totals from movies and episodes only', () => {
        const model = buildVelarisInsightsModel([
            source('movie', {
                Type: BaseItemKind.Movie,
                RunTimeTicks: 120 * 600_000_000,
                Genres: [ 'Drama' ],
                UserData: userData(true, 2, '2026-09-08T20:00:00Z')
            }),
            source('episode', {
                Type: BaseItemKind.Episode,
                SeriesId: 'series-a',
                SeriesName: 'Series A',
                RunTimeTicks: 45 * 600_000_000,
                Genres: [ 'Drama', 'Sci-Fi' ],
                UserData: userData(true, 1, '2026-09-09T09:00:00Z')
            }),
            source('ignored-series', {
                Type: BaseItemKind.Series,
                UserData: userData(true, 4)
            })
        ], now);

        expect(model.watchedTitles).toBe(2);
        expect(model.watchedMovies).toBe(1);
        expect(model.watchedEpisodes).toBe(1);
        expect(model.totalPlays).toBe(3);
        expect(model.rewatches).toBe(1);
        expect(model.estimatedWatchMinutes).toBe(285);
        expect(model.activeTitlesLast30Days).toBe(2);
        expect(model.topGenres[0]).toMatchObject({ name: 'Drama', plays: 3 });
        expect(model.topSeries[0]).toMatchObject({
            id: 'series-a',
            name: 'Series A',
            episodes: 1,
            plays: 1
        });
    });

    it('deduplicates repeated items and sorts recent activity', () => {
        const first = source('same', {
            Type: BaseItemKind.Movie,
            UserData: userData(true, 1, '2026-09-01T10:00:00Z')
        });
        const replacement = source('same', {
            Type: BaseItemKind.Movie,
            UserData: userData(true, 2, '2026-09-09T10:00:00Z')
        });
        const other = source('other', {
            Type: BaseItemKind.Movie,
            UserData: userData(true, 1, '2026-09-08T10:00:00Z')
        });

        const model = buildVelarisInsightsModel([ first, other, replacement ], now);
        expect(model.watchedTitles).toBe(2);
        expect(model.totalPlays).toBe(3);
        expect(model.recentItems.map(entry => entry.Id)).toEqual([ 'same', 'other' ]);
    });

    it('keeps old plays out of the 30-day activity count', () => {
        const model = buildVelarisInsightsModel([
            source('old', {
                Type: BaseItemKind.Movie,
                UserData: userData(true, 1, '2026-07-01T10:00:00Z')
            })
        ], now);

        expect(model.activeTitlesLast30Days).toBe(0);
        expect(model.recentItems).toHaveLength(1);
    });
});
