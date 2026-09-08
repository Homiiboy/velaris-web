import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import { useMemo } from 'react';

import { useGetItems } from 'hooks/useFetchItems';
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

export const useVelarisDiscovery = () => {
    const request = useMemo(() => ({
        recursive: true,
        includeItemTypes: [ BaseItemKind.Movie, BaseItemKind.Series ],
        fields: DISCOVERY_FIELDS,
        enableImageTypes: DISCOVERY_IMAGES,
        imageTypeLimit: 1,
        sortBy: [ ItemSortBy.DateCreated ],
        sortOrder: [ SortOrder.Descending ],
        limit: 500,
        enableTotalRecordCount: false
    }), []);

    const query = useGetItems(request);

    return {
        items: (query.data?.Items || []) as ItemDto[],
        isPending: query.isPending,
        isError: query.isError
    };
};
