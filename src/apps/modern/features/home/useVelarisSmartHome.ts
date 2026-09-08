import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { MediaType } from '@jellyfin/sdk/lib/generated-client/models/media-type';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import { getUserDataApi } from '@jellyfin/sdk/lib/utils/api/user-data-api';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useResumeItems } from 'apps/legacy/features/libraries/api/useResumeItems';
import { useApi } from 'hooks/useApi';
import { useGetItems } from 'hooks/useFetchItems';
import type { ItemDto } from 'types/base/models/item-dto';
import { queryClient } from 'utils/query/queryClient';

export type SmartHomeContinueAction = 'reset' | 'watched';

interface ContinueActionRequest {
    itemId: string
    action: SmartHomeContinueAction
}

const SMART_HOME_FIELDS = [
    ItemFields.Genres,
    ItemFields.Overview,
    ItemFields.PrimaryImageAspectRatio,
    ItemFields.SortName
];

const SMART_HOME_IMAGES = [
    ImageType.Primary,
    ImageType.Backdrop,
    ImageType.Thumb
];

export const useVelarisSmartHome = () => {
    const currentApi = useApi();
    const userId = currentApi.user?.Id;

    const unplayedRequest = useMemo(() => ({
        recursive: true,
        includeItemTypes: [ BaseItemKind.Movie, BaseItemKind.Series ],
        isPlayed: false,
        fields: SMART_HOME_FIELDS,
        enableImageTypes: SMART_HOME_IMAGES,
        imageTypeLimit: 1,
        sortBy: [ ItemSortBy.Random ],
        limit: 120,
        enableTotalRecordCount: false
    }), []);

    const watchedRequest = useMemo(() => ({
        recursive: true,
        includeItemTypes: [ BaseItemKind.Movie, BaseItemKind.Series ],
        isPlayed: true,
        fields: SMART_HOME_FIELDS,
        enableImageTypes: SMART_HOME_IMAGES,
        imageTypeLimit: 1,
        sortBy: [ ItemSortBy.DatePlayed ],
        sortOrder: [ SortOrder.Descending ],
        limit: 48,
        enableTotalRecordCount: false
    }), []);

    const unplayedQuery = useGetItems(unplayedRequest);
    const watchedQuery = useGetItems(watchedRequest);
    const resumeQuery = useResumeItems({
        userId,
        limit: 18,
        fields: [ ItemFields.PrimaryImageAspectRatio, ItemFields.Genres ],
        imageTypeLimit: 1,
        enableImageTypes: SMART_HOME_IMAGES,
        enableTotalRecordCount: false,
        mediaTypes: [ MediaType.Video ]
    });

    const continueMutation = useMutation({
        mutationFn: async ({ itemId, action }: ContinueActionRequest) => {
            if (!currentApi.api || !userId) {
                throw new Error('Smart Home requires an authenticated user');
            }

            const userDataApi = getUserDataApi(currentApi.api);
            if (action === 'watched') {
                await userDataApi.markPlayedItem({ itemId, userId });
                return;
            }

            await userDataApi.updateItemUserData({
                itemId,
                userId,
                updateUserItemDataDto: {
                    PlaybackPositionTicks: 0,
                    PlayedPercentage: 0,
                    Played: false
                }
            });
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: [ 'Items' ] }),
                queryClient.invalidateQueries({ queryKey: [ 'User', userId ] })
            ]);
        }
    });

    return {
        unplayedItems: (unplayedQuery.data?.Items || []) as ItemDto[],
        recentlyWatchedItems: (watchedQuery.data?.Items || []) as ItemDto[],
        continueItems: (resumeQuery.data?.Items || []) as ItemDto[],
        isPending: unplayedQuery.isPending || watchedQuery.isPending || resumeQuery.isPending,
        isError: unplayedQuery.isError || watchedQuery.isError || resumeQuery.isError,
        continueMutation
    };
};
