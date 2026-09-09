import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';

import type { ItemDto } from 'types/base/models/item-dto';

export type VelarisReleaseCategory = 'series' | 'anime';
export type VelarisReleasePagingDateField = 'DateCreated' | 'PremiereDate';

export interface VelarisReleaseSourceItem {
    item: ItemDto
    category: VelarisReleaseCategory
}

export interface VelarisReleaseEntry extends VelarisReleaseSourceItem {
    dateKey: string
    releaseDateMs: number
    isSeasonPremiere: boolean
}

export interface VelarisReleaseDay {
    dateKey: string
    releaseDateMs: number
    entries: VelarisReleaseEntry[]
}

export interface VelarisReleaseHubModel {
    newThisWeek: VelarisReleaseSourceItem[]
    newEpisodesThisWeek: VelarisReleaseSourceItem[]
    seasonPremieres: VelarisReleaseEntry[]
    calendarDays: VelarisReleaseDay[]
}

export interface VelarisReleaseWindow {
    todayStartMs: number
    weekStartMs: number
    nextWeekStartMs: number
    calendarEndMs: number
}

const DAY_MS = 24 * 60 * 60 * 1000;
export const VELARIS_RELEASE_CALENDAR_DAYS_AHEAD = 28;

const parseDateMs = (value: string | null | undefined) => {
    if (!value) return undefined;
    const valueMs = Date.parse(value);
    return Number.isFinite(valueMs) ? valueMs : undefined;
};

const getUtcDayStartMs = (value: Date | number) => {
    const date = typeof value === 'number' ? new Date(value) : value;
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

export const getVelarisReleaseDateKey = (value: Date | number) => {
    const date = new Date(getUtcDayStartMs(value));
    return date.toISOString().slice(0, 10);
};

export const getVelarisReleaseWeekStartMs = (value: Date | number) => {
    const date = new Date(getUtcDayStartMs(value));
    const day = date.getUTCDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;
    return date.getTime() - daysSinceMonday * DAY_MS;
};

export const getVelarisReleaseWindow = (
    value: Date | number = new Date()
): VelarisReleaseWindow => {
    const nowMs = typeof value === 'number' ? value : value.getTime();
    const todayStartMs = getUtcDayStartMs(nowMs);
    const weekStartMs = getVelarisReleaseWeekStartMs(nowMs);

    return {
        todayStartMs,
        weekStartMs,
        nextWeekStartMs: weekStartMs + 7 * DAY_MS,
        calendarEndMs: todayStartMs + VELARIS_RELEASE_CALENDAR_DAYS_AHEAD * DAY_MS
    };
};

export const shouldFetchNextVelarisReleasePage = (
    items: ItemDto[],
    dateField: VelarisReleasePagingDateField,
    lowerBoundMs: number,
    startIndex: number,
    totalRecordCount: number | null | undefined,
    pageSize: number
) => {
    if (items.length === 0 || items.length < pageSize) return false;
    if (totalRecordCount != null && startIndex >= totalRecordCount) return false;

    const validDates = items
        .map(item => parseDateMs(item[dateField]))
        .filter((value): value is number => value != null);

    if (validDates.length === 0) return true;
    return Math.min(...validDates) >= lowerBoundMs;
};

export const isVelarisSeasonPremiere = (item: ItemDto) => (
    item.Type === BaseItemKind.Episode
    && item.IndexNumber === 1
    && item.ParentIndexNumber != null
    && item.ParentIndexNumber > 0
);

const getStableItemKey = (source: VelarisReleaseSourceItem) => (
    source.item.Id || `${source.category}:${source.item.Type || ''}:${source.item.Name || ''}`
);

const dedupeSources = (sources: VelarisReleaseSourceItem[]) => {
    const byId = new Map<string, VelarisReleaseSourceItem>();

    sources.forEach(source => {
        const key = getStableItemKey(source);
        const existing = byId.get(key);
        if (!existing || (existing.category === 'series' && source.category === 'anime')) {
            byId.set(key, source);
        }
    });

    return [ ...byId.values() ];
};

const sortNewItems = (left: VelarisReleaseSourceItem, right: VelarisReleaseSourceItem) => {
    const leftDate = parseDateMs(left.item.DateCreated) || 0;
    const rightDate = parseDateMs(right.item.DateCreated) || 0;
    return rightDate - leftDate
        || String(left.item.SeriesName || left.item.Name || '').localeCompare(
            String(right.item.SeriesName || right.item.Name || '')
        )
        || String(left.item.Id || '').localeCompare(String(right.item.Id || ''));
};

const sortReleaseEntries = (left: VelarisReleaseEntry, right: VelarisReleaseEntry) => (
    left.releaseDateMs - right.releaseDateMs
    || String(left.item.SeriesName || left.item.Name || '').localeCompare(
        String(right.item.SeriesName || right.item.Name || '')
    )
    || Number(left.item.ParentIndexNumber || 0) - Number(right.item.ParentIndexNumber || 0)
    || Number(left.item.IndexNumber || 0) - Number(right.item.IndexNumber || 0)
    || String(left.item.Id || '').localeCompare(String(right.item.Id || ''))
);

export const buildVelarisReleaseHubModel = (
    recentSources: VelarisReleaseSourceItem[],
    calendarSources: VelarisReleaseSourceItem[],
    now: Date | number = new Date()
): VelarisReleaseHubModel => {
    const {
        todayStartMs,
        weekStartMs,
        nextWeekStartMs,
        calendarEndMs
    } = getVelarisReleaseWindow(now);

    const newThisWeek = dedupeSources(recentSources)
        .filter(source => {
            const isSupportedType = source.item.Type === BaseItemKind.Series
                || source.item.Type === BaseItemKind.Episode;
            if (!isSupportedType) return false;

            const createdMs = parseDateMs(source.item.DateCreated);
            return createdMs != null && createdMs >= weekStartMs && createdMs < nextWeekStartMs;
        })
        .sort(sortNewItems);

    const newEpisodesThisWeek = newThisWeek.filter(
        source => source.item.Type === BaseItemKind.Episode
    );

    const calendarEntries = dedupeSources(calendarSources)
        .filter(source => source.item.Type === BaseItemKind.Episode)
        .map<VelarisReleaseEntry | null>(source => {
            const premiereDateMs = parseDateMs(source.item.PremiereDate);
            if (premiereDateMs == null) return null;

            const releaseDateMs = getUtcDayStartMs(premiereDateMs);
            if (releaseDateMs < todayStartMs || releaseDateMs >= calendarEndMs) return null;

            return {
                ...source,
                dateKey: getVelarisReleaseDateKey(releaseDateMs),
                releaseDateMs,
                isSeasonPremiere: isVelarisSeasonPremiere(source.item)
            };
        })
        .filter((entry): entry is VelarisReleaseEntry => entry != null)
        .sort(sortReleaseEntries);

    const calendarByDay = new Map<string, VelarisReleaseEntry[]>();
    calendarEntries.forEach(entry => {
        const entries = calendarByDay.get(entry.dateKey) || [];
        entries.push(entry);
        calendarByDay.set(entry.dateKey, entries);
    });

    const calendarDays = [ ...calendarByDay.entries() ]
        .map<VelarisReleaseDay>(([ dateKey, entries ]) => ({
            dateKey,
            releaseDateMs: entries[0]?.releaseDateMs || 0,
            entries
        }))
        .sort((left, right) => left.releaseDateMs - right.releaseDateMs);

    const seasonPremieres = calendarEntries.filter(entry => entry.isSeasonPremiere);

    return {
        newThisWeek,
        newEpisodesThisWeek,
        seasonPremieres,
        calendarDays
    };
};
