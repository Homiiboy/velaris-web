import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';
import { useQuery } from '@tanstack/react-query';

import { useApi } from 'hooks/useApi';
import type { ItemDto } from 'types/base/models/item-dto';

import { buildVelarisInsightsModel } from './insights';

const INSIGHTS_FIELDS = [
    ItemFields.Genres,
    ItemFields.PrimaryImageAspectRatio,
    ItemFields.SortName
];

const INSIGHTS_IMAGES = [
    ImageType.Primary,
    ImageType.Backdrop,
    ImageType.Thumb
];

const PAGE_SIZE = 250;
const MAX_PAGES = 80;

interface InsightsQueryResult {
    items: ItemDto[]
    truncated: boolean
}

const shouldFetchNextPage = (
    itemCount: number,
    startIndex: number,
    totalRecordCount: number | null | undefined
) => (
    itemCount === PAGE_SIZE
    && (totalRecordCount == null || startIndex < totalRecordCount)
);

export const useVelarisInsights = () => {
    const { api, user } = useApi();
    const userId = user?.Id;

    const query = useQuery<InsightsQueryResult>({
        queryKey: [ 'VelarisInsights', userId ],
        enabled: !!api && !!userId,
        queryFn: async ({ signal }) => {
            if (!userId) throw new Error('[VelarisInsights] missing active user');

            const libraryApi = getLibraryApi(api!);
            const byId = new Map<string, ItemDto>();
            let startIndex = 0;
            let page = 0;
            let hasMore = true;

            while (hasMore && page < MAX_PAGES) {
                const response = await libraryApi.getItems({
                    userId,
                    recursive: true,
                    includeItemTypes: [ BaseItemKind.Movie, BaseItemKind.Episode ],
                    isPlayed: true,
                    fields: INSIGHTS_FIELDS,
                    enableImageTypes: INSIGHTS_IMAGES,
                    imageTypeLimit: 1,
                    startIndex,
                    limit: PAGE_SIZE,
                    enableTotalRecordCount: true
                }, { signal });
                const pageItems = (response.data.Items || []) as ItemDto[];

                pageItems.forEach(item => {
                    if (item.Id) byId.set(item.Id, item);
                });

                startIndex += pageItems.length;
                page += 1;
                hasMore = shouldFetchNextPage(
                    pageItems.length,
                    startIndex,
                    response.data.TotalRecordCount
                );
            }

            return {
                items: [ ...byId.values() ],
                truncated: hasMore
            };
        }
    });

    const model = buildVelarisInsightsModel(query.data?.items || []);

    return {
        ...model,
        isPending: query.isPending,
        isError: query.isError,
        isPartial: Boolean(query.data?.truncated)
    };
};
