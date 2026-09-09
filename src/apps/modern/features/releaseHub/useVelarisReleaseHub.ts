import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getVelarisLibraryCategory } from 'apps/modern/utils/velarisNavigation';
import { useUserViews } from 'hooks/api/useUserViews';
import { useApi } from 'hooks/useApi';
import type { ItemDto } from 'types/base/models/item-dto';

import {
    buildVelarisReleaseHubModel,
    getVelarisReleaseDateKey,
    getVelarisReleaseWindow,
    shouldFetchNextVelarisReleasePage,
    type VelarisReleaseCategory,
    type VelarisReleasePagingDateField,
    type VelarisReleaseSourceItem
} from './releaseHub';

const RELEASE_FIELDS = [
    ItemFields.DateCreated,
    ItemFields.Genres,
    ItemFields.Overview,
    ItemFields.PrimaryImageAspectRatio,
    ItemFields.SortName
];

const RELEASE_IMAGES = [
    ImageType.Primary,
    ImageType.Backdrop,
    ImageType.Thumb
];

const PAGE_SIZE = 250;
const MAX_PAGES_PER_QUERY = 80;

interface ReleaseLibrarySource {
    id: string
    category: VelarisReleaseCategory
}

interface ReleaseQueryResult {
    recentSources: VelarisReleaseSourceItem[]
    calendarSources: VelarisReleaseSourceItem[]
    failedLibraryIds: string[]
    truncatedLibraryIds: string[]
}

interface LoadReleaseItemsOptions {
    libraryApi: ReturnType<typeof getLibraryApi>
    userId: string
    library: ReleaseLibrarySource
    includeItemTypes: BaseItemKind[]
    sortBy: ItemSortBy
    dateField: VelarisReleasePagingDateField
    lowerBoundMs: number
    signal: AbortSignal
}

interface LoadReleaseItemsResult {
    sources: VelarisReleaseSourceItem[]
    truncated: boolean
}

const getReleaseLibraryCategory = (item: Parameters<typeof getVelarisLibraryCategory>[0]) => {
    const category = getVelarisLibraryCategory(item);
    if (category === 'anime') return 'anime';
    if (category === 'series') return 'series';
    return undefined;
};

const loadReleaseItems = async ({
    libraryApi,
    userId,
    library,
    includeItemTypes,
    sortBy,
    dateField,
    lowerBoundMs,
    signal
}: LoadReleaseItemsOptions): Promise<LoadReleaseItemsResult> => {
    const sources: VelarisReleaseSourceItem[] = [];
    let startIndex = 0;
    let page = 0;
    let hasMore = true;

    while (hasMore && page < MAX_PAGES_PER_QUERY) {
        const response = await libraryApi.getItems({
            userId,
            parentId: library.id,
            recursive: true,
            includeItemTypes,
            fields: RELEASE_FIELDS,
            enableImageTypes: RELEASE_IMAGES,
            imageTypeLimit: 1,
            sortBy: [ sortBy ],
            sortOrder: [ SortOrder.Descending ],
            startIndex,
            limit: PAGE_SIZE,
            enableTotalRecordCount: true
        }, { signal });
        const pageItems = (response.data.Items || []) as ItemDto[];

        for (const item of pageItems) {
            sources.push({
                item,
                category: library.category
            });
        }

        startIndex += pageItems.length;
        page += 1;
        hasMore = shouldFetchNextVelarisReleasePage(
            pageItems,
            dateField,
            lowerBoundMs,
            startIndex,
            response.data.TotalRecordCount,
            PAGE_SIZE
        );
    }

    return {
        sources,
        truncated: hasMore
    };
};

export const useVelarisReleaseHub = () => {
    const { api, user } = useApi();
    const userId = user?.Id;
    const userViewsQuery = useUserViews({ userId });
    const nowMs = Date.now();
    const todayKey = getVelarisReleaseDateKey(nowMs);
    const window = getVelarisReleaseWindow(nowMs);

    const libraries = useMemo<ReleaseLibrarySource[]>(() => (
        (userViewsQuery.data?.Items || [])
            .map(view => ({
                view,
                category: getReleaseLibraryCategory(view)
            }))
            .filter((entry): entry is { view: typeof entry.view; category: VelarisReleaseCategory } => (
                Boolean(entry.view.Id && entry.category)
            ))
            .map(entry => ({
                id: entry.view.Id as string,
                category: entry.category
            }))
    ), [ userViewsQuery.data ]);

    const libraryKey = useMemo(
        () => libraries.map(library => `${library.id}:${library.category}`),
        [ libraries ]
    );

    const query = useQuery<ReleaseQueryResult>({
        queryKey: [ 'VelarisReleaseHub', userId, libraryKey, todayKey ],
        enabled: !!api && !!userId && !userViewsQuery.isPending,
        queryFn: async ({ signal }) => {
            if (!userId) throw new Error('[VelarisReleaseHub] missing active user');

            const recentSources: VelarisReleaseSourceItem[] = [];
            const calendarSources: VelarisReleaseSourceItem[] = [];
            const failedLibraryIds: string[] = [];
            const truncatedLibraryIds: string[] = [];
            const libraryApi = getLibraryApi(api!);

            for (const library of libraries) {
                try {
                    const recent = await loadReleaseItems({
                        libraryApi,
                        userId,
                        library,
                        includeItemTypes: [ BaseItemKind.Series, BaseItemKind.Episode ],
                        sortBy: ItemSortBy.DateCreated,
                        dateField: 'DateCreated',
                        lowerBoundMs: window.weekStartMs,
                        signal
                    });
                    recentSources.push(...recent.sources);
                    if (recent.truncated) truncatedLibraryIds.push(`${library.id}:recent`);
                } catch (error) {
                    if (signal.aborted) throw error;
                    console.warn(`[VelarisReleaseHub] unable to load recent items from ${library.id}`, error);
                    failedLibraryIds.push(library.id);
                }

                try {
                    const calendar = await loadReleaseItems({
                        libraryApi,
                        userId,
                        library,
                        includeItemTypes: [ BaseItemKind.Episode ],
                        sortBy: ItemSortBy.PremiereDate,
                        dateField: 'PremiereDate',
                        lowerBoundMs: window.todayStartMs,
                        signal
                    });
                    calendarSources.push(...calendar.sources);
                    if (calendar.truncated) truncatedLibraryIds.push(`${library.id}:calendar`);
                } catch (error) {
                    if (signal.aborted) throw error;
                    console.warn(`[VelarisReleaseHub] unable to load release calendar from ${library.id}`, error);
                    failedLibraryIds.push(library.id);
                }
            }

            return {
                recentSources,
                calendarSources,
                failedLibraryIds: [ ...new Set(failedLibraryIds) ],
                truncatedLibraryIds
            };
        }
    });

    const model = buildVelarisReleaseHubModel(
        query.data?.recentSources || [],
        query.data?.calendarSources || [],
        nowMs
    );

    return {
        ...model,
        libraryCount: libraries.length,
        isPending: userViewsQuery.isPending || query.isPending,
        isError: userViewsQuery.isError || query.isError,
        isPartial: Boolean(
            query.data?.failedLibraryIds.length
            || query.data?.truncatedLibraryIds.length
        )
    };
};
