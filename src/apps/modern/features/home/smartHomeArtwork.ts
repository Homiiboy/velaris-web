import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import type { ApiClient } from 'jellyfin-apiclient';

import type { ItemDto } from 'types/base/models/item-dto';

export const getVelarisSmartHomeArtworkUrl = (
    apiClient: ApiClient | undefined,
    item: ItemDto,
    maxWidth = 720
) => {
    if (!apiClient || !item.Id) return undefined;

    const backdropTag = item.BackdropImageTags?.[0];
    if (backdropTag) {
        return apiClient.getImageUrl(item.Id, {
            type: ImageType.Backdrop,
            tag: backdropTag,
            maxWidth
        });
    }

    const parentBackdropTag = item.ParentBackdropImageTags?.[0];
    if (parentBackdropTag && item.ParentBackdropItemId) {
        return apiClient.getImageUrl(item.ParentBackdropItemId, {
            type: ImageType.Backdrop,
            tag: parentBackdropTag,
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

export const getVelarisSmartHomePosterUrl = (
    apiClient: ApiClient | undefined,
    item: ItemDto,
    maxWidth = 480
) => {
    if (!apiClient || !item.Id) return undefined;

    const primaryTag = item.ImageTags?.Primary;
    const aspectRatio = item.PrimaryImageAspectRatio;

    // Some Jellyfin libraries use a square logo instead of a portrait poster.
    // Prefer a cinematic fallback for obviously non-poster primary images.
    if (primaryTag && (!aspectRatio || (aspectRatio >= 0.48 && aspectRatio <= 0.88))) {
        return apiClient.getImageUrl(item.Id, {
            type: ImageType.Primary,
            tag: primaryTag,
            maxWidth
        });
    }

    const backdropTag = item.BackdropImageTags?.[0];
    if (backdropTag) {
        return apiClient.getImageUrl(item.Id, {
            type: ImageType.Backdrop,
            tag: backdropTag,
            maxWidth
        });
    }

    const thumbTag = item.ImageTags?.Thumb;
    if (thumbTag) {
        return apiClient.getImageUrl(item.Id, {
            type: ImageType.Thumb,
            tag: thumbTag,
            maxWidth
        });
    }

    return primaryTag ? apiClient.getImageUrl(item.Id, {
        type: ImageType.Primary,
        tag: primaryTag,
        maxWidth
    }) : undefined;
};
