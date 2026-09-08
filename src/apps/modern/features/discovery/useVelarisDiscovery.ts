import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
    resolveDiscoveryItemCategory,
    shouldFetchNextDiscoveryPage,
    sortDiscoveryItems,
    type DiscoveryCategoryMap
} from 'apps/modern/features/discovery/discovery';
import { getVelarisLibraryCategory } from 'apps/modern/utils/velarisNavigation';
import { useUserViews } from 'hooks/api/useUserViews';
import { useApi } from 'hooks/useApi';
import type { ItemDto } from 'types/base/models/item-dto';

const DISCOVERY_FIELDS = [
    ItemFields.DateCreated,
    ItemFields.Genres,
    ItemFields.Overview,
    ItemFields.PrimaryImageAspectRatio,
    ItemFields.SortName
];

const DISCOVERY_IMAGES = [
    ImageType.Primary,
    ImageType.Backdrop,
    ImageType.Thumb
];

const PAGE_SIZE = 250;
const MAX_PAGES_PER_LIBRARY = 200;

interface DiscoveryLibrarySource {
    id: string
    category: ReturnType<typeof getVelarisLibraryCategory>
}

interface DiscoveryQueryResult {
    items: ItemDto[]
    categoryByItemId: DiscoveryCategoryMap
    failedLibraryIds: string[]
    truncatedLibraryIds: string[]
}

const getPreferredCategory = (
    current: DiscoveryCategoryMap[string] | undefined,
    next: DiscoveryCategoryMap[string]
) => {
    if (!current) return next;
    const currentIsAnime = current === 'anime' || current === 'anime-movies';
    const nextIsAnime = next === 'anime' || next === 'anime-movies';
    return nextIsAnime && !currentIsAnime ? next : current;
};

export const useVelarisDiscovery = () => {
    const { api, user } = useApi();
    const userViewsQuery = useUserViews({ userId: user?.Id });
    const libraries = useMemo<DiscoveryLibrarySource[]>(() => (
        (userViewsQuery.data?.Items || [])
            .filter(view => view.Id && getVelarisLibraryCategory(view) !== 'collections')
            .map(view => ({
                id: view.Id as string,
                category: getVelarisLibraryCategory(view)
            }))
    ), [ userViewsQuery.data ]);
    const libraryKey = useMemo(
        () => libraries.map(library => `${library.id}:${library.category}`),
        [ libraries ]
    );

    const query = useQuery<DiscoveryQueryResult>({
        queryKey: [ 'VelarisDiscovery', user?.Id, libraryKey ],
        enabled: !!api && !!user?.Id && !userViewsQuery.isPending,
        queryFn: async ({ signal }) => {
            const byId = new Map<string, ItemDto>();
            const categoryByItemId: DiscoveryCategoryMap = {};
            const failedLibraryIds: string[] = [];
            const truncatedLibraryIds: string[] = [];
            const libraryApi = getLibraryApi(api!);

            for (const library of libraries) {
                let startIndex = 0;
                let page = 0;
                let hasMore = true;

                try {
                    while (hasMore && page < MAX_PAGES_PER_LIBRARY) {
                        const response = await libraryApi.getItems({
                            userId: user!.Id,
                            parentId: library.id,
                            recursive: true,
                            includeItemTypes: [ BaseItemKind.Movie, BaseItemKind.Series ],
                            fields: DISCOVERY_FIELDS,
                            enableImageTypes: DISCOVERY_IMAGES,
                            imageTypeLimit: 1,
                            sortBy: [ ItemSortBy.DateCreated ],
                            sortOrder: [ SortOrder.Descending ],
                            startIndex,
                            limit: PAGE_SIZE,
                            enableTotalRecordCount: true
                        }, { signal });
                        const pageItems = (response.data.Items || []) as ItemDto[];

                        pageItems.forEach(item => {
                            if (!item.Id) return;
                            byId.set(item.Id, item);

                            const category = resolveDiscoveryItemCategory(item, library.category);
                            if (category) {
                                categoryByItemId[item.Id] = getPreferredCategory(categoryByItemId[item.Id], category);
                            }
                        });

                        startIndex += pageItems.length;
                        page += 1;
                        hasMore = shouldFetchNextDiscoveryPage(
                            pageItems.length,
                            startIndex,
                            response.data.TotalRecordCount,
                            PAGE_SIZE
                        );
                    }

                    if (hasMore) truncatedLibraryIds.push(library.id);
                } catch (error) {
                    if (signal.aborted) throw error;
                    console.warn(`[VelarisDiscovery] unable to load library ${library.id}`, error);
                    failedLibraryIds.push(library.id);
                }
            }

            return {
                items: sortDiscoveryItems([ ...byId.values() ]),
                categoryByItemId,
                failedLibraryIds,
                truncatedLibraryIds
            };
        }
    });

    return {
        items: query.data?.items || [],
        categoryByItemId: query.data?.categoryByItemId || {},
        libraryCount: libraries.length,
        isPending: userViewsQuery.isPending || query.isPending,
        isError: userViewsQuery.isError || query.isError,
        isPartial: Boolean(
            query.data?.failedLibraryIds.length
            || query.data?.truncatedLibraryIds.length
        )
    };
};
