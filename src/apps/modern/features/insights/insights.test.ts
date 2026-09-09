import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { describe, expect, it } from 'vitest';

import type { ItemDto } from 'types/base/models/item-dto';

import {
    buildVelarisInsightsModel,
    getVelarisKnownPlayCount
} from './insights';

const item = (id: string, values: Partial<ItemDto>): ItemDto => ({
    Id: id,
    Name: id,
    ...values
} as ItemDto);

describe('Velaris Insights model', () => {
    const now = new Date('2026-09-09T12:00:00Z');

    it('uses server play counts with a played fallback', () => {
        expect(getVelarisKnownPlayCount(item('counted', {
            UserData: { Played: true, PlayCount: 3 }
        }))).toBe(3);
        expect(getVelarisKnownPlayCount(item('fallback', {
            UserData: { Played: true, PlayCount: 0 }
        }))).toBe(1);
        expect(getVelarisKnownPlayCount(item('unplayed', {
            UserData: { Played: false, PlayCount: 0 }
        }))).toBe(0);
    });

    it('builds personal totals from movies and episodes only', () => {
        const model = buildVelarisInsightsModel([
            item('movie', {
                Type: BaseItemKind.Movie,
                RunTimeTicks: 120 * 600_000_000,
                Genres: [ 'Drama' ],
                UserData: {
                    Played: true,
                    PlayCount: 2,
                    LastPlayedDate: '2026-09-08T20:00:00Z'
                }
            }),
            item('episode', {
                Type: BaseItemKind.Episode,
                SeriesId: 'series-a',
                SeriesName: 'Series A',
                RunTimeTicks: 45 * 600_000_000,
                Genres: [ 'Drama', 'Sci-Fi' ],
                UserData: {
                    Played: true,
                    PlayCount: 1,
                    LastPlayedDate: '2026-09-09T09:00:00Z'
                }
            }),
            item('ignored-series', {
                Type: BaseItemKind.Series,
                UserData: { Played: true, PlayCount: 4 }
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
        const first = item('same', {
            Type: BaseItemKind.Movie,
            UserData: {
                Played: true,
                PlayCount: 1,
                LastPlayedDate: '2026-09-01T10:00:00Z'
            }
        });
        const replacement = item('same', {
            Type: BaseItemKind.Movie,
            UserData: {
                Played: true,
                PlayCount: 2,
                LastPlayedDate: '2026-09-09T10:00:00Z'
            }
        });
        const other = item('other', {
            Type: BaseItemKind.Movie,
            UserData: {
                Played: true,
                PlayCount: 1,
                LastPlayedDate: '2026-09-08T10:00:00Z'
            }
        });

        const model = buildVelarisInsightsModel([ first, other, replacement ], now);
        expect(model.watchedTitles).toBe(2);
        expect(model.totalPlays).toBe(3);
        expect(model.recentItems.map(entry => entry.Id)).toEqual([ 'same', 'other' ]);
    });

    it('keeps old plays out of the 30-day activity count', () => {
        const model = buildVelarisInsightsModel([
            item('old', {
                Type: BaseItemKind.Movie,
                UserData: {
                    Played: true,
                    PlayCount: 1,
                    LastPlayedDate: '2026-07-01T10:00:00Z'
                }
            })
        ], now);

        expect(model.activeTitlesLast30Days).toBe(0);
        expect(model.recentItems).toHaveLength(1);
    });
});
