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

const getReleaseLibraryCategory = (item: Parameters<typeof getVelarisLibraryCategory>[0]) => {
    const category = getVelarisLibraryCategory(item);
    if (category === 'anime') return 'anime';
    if (category === 'series') return 'series';
    return undefined;
};

export const useVelarisReleaseHub = () => {
    const { api, user } = useApi();
    const userViewsQuery = useUserViews({ userId: user?.Id });
    const now = new Date();
    const todayKey = getVelarisReleaseDateKey(now);
    const window = getVelarisReleaseWindow(now);

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
        queryKey: [ 'VelarisReleaseHub', user?.Id, libraryKey, todayKey ],
        enabled: !!api && !!user?.Id && !userViewsQuery.isPending,
        queryFn: async ({ signal }) => {
            const recentSources: VelarisReleaseSourceItem[] = [];
            const calendarSources: VelarisReleaseSourceItem[] = [];
            const failedLibraryIds: string[] = [];
            const truncatedLibraryIds: string[] = [];
            const libraryApi = getLibraryApi(api!);

            for (const library of libraries) {
                let libraryFailed = false;

                try {
                    let startIndex = 0;
                    let page = 0;
                    let hasMore = true;

                    while (hasMore && page < MAX_PAGES_PER_QUERY) {
                        const response = await libraryApi.getItems({
                            userId: user!.Id,
                            parentId: library.id,
                            recursive: true,
                            includeItemTypes: [ BaseItemKind.Series, BaseItemKind.Episode ],
                            fields: RELEASE_FIELDS,
                            enableImageTypes: RELEASE_IMAGES,
                            imageTypeLimit: 1,
                            sortBy: [ ItemSortBy.DateCreated ],
                            sortOrder: [ SortOrder.Descending ],
                            startIndex,
                            limit: PAGE_SIZE,
                            enableTotalRecordCount: true
                        }, { signal });
                        const pageItems = (response.data.Items || []) as ItemDto[];

                        pageItems.forEach(item => recentSources.push({
                            item,
                            category: library.category
                        }));

                        startIndex += pageItems.length;
                        page += 1;
                        hasMore = shouldFetchNextVelarisReleasePage(
                            pageItems,
                            'DateCreated',
                            window.weekStartMs,
                            startIndex,
                            response.data.TotalRecordCount,
                            PAGE_SIZE
                        );
                    }

                    if (hasMore) truncatedLibraryIds.push(`${library.id}:recent`);
                } catch (error) {
                    if (signal.aborted) throw error;
                    console.warn(`[VelarisReleaseHub] unable to load recent items from ${library.id}`, error);
                    libraryFailed = true;
                }

                try {
                    let startIndex = 0;
                    let page = 0;
                    let hasMore = true;

                    while (hasMore && page < MAX_PAGES_PER_QUERY) {
                        const response = await libraryApi.getItems({
                            userId: user!.Id,
                            parentId: library.id,
                            recursive: true,
                            includeItemTypes: [ BaseItemKind.Episode ],
                            fields: RELEASE_FIELDS,
                            enableImageTypes: RELEASE_IMAGES,
                            imageTypeLimit: 1,
                            sortBy: [ ItemSortBy.PremiereDate ],
                            sortOrder: [ SortOrder.Descending ],
                            startIndex,
                            limit: PAGE_SIZE,
                            enableTotalRecordCount: true
                        }, { signal });
                        const pageItems = (response.data.Items || []) as ItemDto[];

                        pageItems.forEach(item => calendarSources.push({
                            item,
                            category: library.category
                        }));

                        startIndex += pageItems.length;
                        page += 1;
                        hasMore = shouldFetchNextVelarisReleasePage(
                            pageItems,
                            'PremiereDate',
                            window.todayStartMs,
                            startIndex,
                            response.data.TotalRecordCount,
                            PAGE_SIZE
                        );
                    }

                    if (hasMore) truncatedLibraryIds.push(`${library.id}:calendar`);
                } catch (error) {
                    if (signal.aborted) throw error;
                    console.warn(`[VelarisReleaseHub] unable to load release calendar from ${library.id}`, error);
                    libraryFailed = true;
                }

                if (libraryFailed) failedLibraryIds.push(library.id);
            }

            return {
                recentSources,
                calendarSources,
                failedLibraryIds: [ ...new Set(failedLibraryIds) ],
                truncatedLibraryIds
            };
        }
    });

    const model = useMemo(() => buildVelarisReleaseHubModel(
        query.data?.recentSources || [],
        query.data?.calendarSources || [],
        now
    ), [ now, query.data?.calendarSources, query.data?.recentSources ]);

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
