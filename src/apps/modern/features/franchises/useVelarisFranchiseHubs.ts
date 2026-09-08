import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import { useMemo } from 'react';

import { useGetItems } from 'hooks/useFetchItems';
import type { ItemDto } from 'types/base/models/item-dto';

import { buildVelarisFranchiseHubs } from './franchiseEngine';
import { applyFranchiseStudioConfig } from './franchiseStudioResolver';
import { useFranchiseStudioConfig } from './useFranchiseStudioConfig';

export const useVelarisFranchiseHubs = () => {
    const request = useMemo(() => ({
        recursive: true,
        includeItemTypes: [ BaseItemKind.Movie, BaseItemKind.Series ],
        fields: [
            ItemFields.OriginalTitle,
            ItemFields.PrimaryImageAspectRatio,
            ItemFields.ProviderIds,
            ItemFields.SortName,
            ItemFields.Studios,
            ItemFields.Tags
        ],
        imageTypeLimit: 1,
        enableImageTypes: [ ImageType.Primary, ImageType.Backdrop ],
        sortBy: [ ItemSortBy.SortName ],
        sortOrder: [ SortOrder.Ascending ],
        enableTotalRecordCount: false
    }), []);

    const query = useGetItems(request);
    const { config: studioConfig } = useFranchiseStudioConfig();
    const libraryItems = useMemo(
        () => (query.data?.Items || []) as ItemDto[],
        [ query.data?.Items ]
    );
    const baseHubs = useMemo(
        () => buildVelarisFranchiseHubs(libraryItems),
        [ libraryItems ]
    );
    const hubs = useMemo(
        () => applyFranchiseStudioConfig(baseHubs, libraryItems, studioConfig),
        [ baseHubs, libraryItems, studioConfig ]
    );

    return {
        ...query,
        hubs,
        baseHubs,
        libraryItems,
        studioConfig
    };
};
