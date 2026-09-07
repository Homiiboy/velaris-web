import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import type { ApiClient } from 'jellyfin-apiclient';

import type { ItemDto } from 'types/base/models/item-dto';

export const getVelarisFranchiseArtworkUrl = (
    apiClient: ApiClient | undefined,
    item: ItemDto | undefined,
    maxWidth = 1200
) => {
    if (!apiClient || !item?.Id) return undefined;

    const backdropTag = item.BackdropImageTags?.[0];
    if (backdropTag) {
        return apiClient.getImageUrl(item.Id, {
            type: ImageType.Backdrop,
            tag: backdropTag,
            maxWidth
        });
    }

    const primaryTag = item.ImageTags?.Primary;
    if (primaryTag) {
        return apiClient.getImageUrl(item.Id, {
            type: ImageType.Primary,
            tag: primaryTag,
            maxWidth
        });
    }

    return undefined;
};
