import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';

import type { ItemDto } from 'types/base/models/item-dto';

const TICKS_PER_MINUTE = 600_000_000;
const DAY_MS = 24 * 60 * 60 * 1000;
const INSIGHTS_ACTIVITY_DAYS = 30;
const INSIGHTS_RECENT_LIMIT = 12;
const INSIGHTS_TOP_LIMIT = 6;

export interface VelarisInsightBreakdown {
    name: string
    plays: number
    minutes: number
}

export interface VelarisSeriesInsight extends VelarisInsightBreakdown {
    id: string
    episodes: number
}

export interface VelarisInsightsModel {
    watchedTitles: number
    watchedMovies: number
    watchedEpisodes: number
    totalPlays: number
    rewatches: number
    estimatedWatchMinutes: number
    activeTitlesLast30Days: number
    topGenres: VelarisInsightBreakdown[]
    topSeries: VelarisSeriesInsight[]
    recentItems: ItemDto[]
}

const parseDateMs = (value: string | null | undefined) => {
    if (!value) return undefined;
    const valueMs = Date.parse(value);
    return Number.isFinite(valueMs) ? valueMs : undefined;
};

const getUserData = (item: ItemDto) => item.UserData;

export const getVelarisKnownPlayCount = (item: ItemDto) => {
    const userData = getUserData(item);
    const playCount = Number(userData?.PlayCount ?? item.PlayCount ?? 0);
    if (Number.isFinite(playCount) && playCount > 0) return Math.floor(playCount);
    return (userData?.Played ?? item.Played) ? 1 : 0;
};

const getLastPlayedMs = (item: ItemDto) => parseDateMs(
    getUserData(item)?.LastPlayedDate ?? item.LastPlayedDate
);

const getEstimatedMinutes = (item: ItemDto, plays: number) => {
    const runTimeTicks = Number(item.RunTimeTicks || 0);
    if (!Number.isFinite(runTimeTicks) || runTimeTicks <= 0 || plays <= 0) return 0;
    return runTimeTicks * plays / TICKS_PER_MINUTE;
};

const addBreakdownValue = (
    map: Map<string, VelarisInsightBreakdown>,
    name: string,
    plays: number,
    minutes: number
) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    const existing = map.get(cleanName) || { name: cleanName, plays: 0, minutes: 0 };
    existing.plays += plays;
    existing.minutes += minutes;
    map.set(cleanName, existing);
};

const sortBreakdowns = (left: VelarisInsightBreakdown, right: VelarisInsightBreakdown) => (
    right.plays - left.plays
    || right.minutes - left.minutes
    || left.name.localeCompare(right.name)
);

const sortSeries = (left: VelarisSeriesInsight, right: VelarisSeriesInsight) => (
    right.episodes - left.episodes
    || right.plays - left.plays
    || right.minutes - left.minutes
    || left.name.localeCompare(right.name)
);

export const buildVelarisInsightsModel = (
    inputItems: ItemDto[],
    now: Date | number = new Date()
): VelarisInsightsModel => {
    const nowMs = typeof now === 'number' ? now : now.getTime();
    const activityStartMs = nowMs - INSIGHTS_ACTIVITY_DAYS * DAY_MS;
    const byId = new Map<string, ItemDto>();

    inputItems.forEach((item, index) => {
        const key = item.Id || `anonymous:${index}`;
        const supported = item.Type === BaseItemKind.Movie || item.Type === BaseItemKind.Episode;
        if (supported && getVelarisKnownPlayCount(item) > 0) byId.set(key, item);
    });

    const items = [ ...byId.values() ];
    const genreMap = new Map<string, VelarisInsightBreakdown>();
    const seriesMap = new Map<string, VelarisSeriesInsight>();
    let watchedMovies = 0;
    let watchedEpisodes = 0;
    let totalPlays = 0;
    let estimatedWatchMinutes = 0;
    let activeTitlesLast30Days = 0;

    items.forEach(item => {
        const plays = getVelarisKnownPlayCount(item);
        const minutes = getEstimatedMinutes(item, plays);
        totalPlays += plays;
        estimatedWatchMinutes += minutes;

        if (item.Type === BaseItemKind.Movie) watchedMovies += 1;
        if (item.Type === BaseItemKind.Episode) watchedEpisodes += 1;

        const lastPlayedMs = getLastPlayedMs(item);
        if (lastPlayedMs != null && lastPlayedMs >= activityStartMs && lastPlayedMs <= nowMs) {
            activeTitlesLast30Days += 1;
        }

        [ ...new Set(item.Genres || []) ].forEach(genre => {
            if (genre) addBreakdownValue(genreMap, genre, plays, minutes);
        });

        if (item.Type === BaseItemKind.Episode) {
            const name = item.SeriesName?.trim();
            if (!name) return;

            const id = item.SeriesId || name;
            const existing = seriesMap.get(id) || {
                id,
                name,
                episodes: 0,
                plays: 0,
                minutes: 0
            };
            existing.episodes += 1;
            existing.plays += plays;
            existing.minutes += minutes;
            seriesMap.set(id, existing);
        }
    });

    const recentItems = items
        .map(item => ({ item, lastPlayedMs: getLastPlayedMs(item) || 0 }))
        .filter(entry => entry.lastPlayedMs > 0)
        .sort((left, right) => right.lastPlayedMs - left.lastPlayedMs)
        .slice(0, INSIGHTS_RECENT_LIMIT)
        .map(entry => entry.item);

    return {
        watchedTitles: items.length,
        watchedMovies,
        watchedEpisodes,
        totalPlays,
        rewatches: Math.max(0, totalPlays - items.length),
        estimatedWatchMinutes: Math.round(estimatedWatchMinutes),
        activeTitlesLast30Days,
        topGenres: [ ...genreMap.values() ].sort(sortBreakdowns).slice(0, INSIGHTS_TOP_LIMIT),
        topSeries: [ ...seriesMap.values() ].sort(sortSeries).slice(0, INSIGHTS_TOP_LIMIT),
        recentItems
    };
};
