import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import { getGenreApi } from '@jellyfin/sdk/lib/utils/api/genre-api';
import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useApi } from 'hooks/useApi';
import type { ItemDto } from 'types/base/models/item-dto';

import {
    buildSmartHomeGenreRows,
    getAvailableSmartHomeGenres,
    MAX_SMART_HOME_ROW_ITEMS
} from './smartHome';

/**
 * Check Jellyfin's movie genres first and request only categories actually
 * present on the server. Each genre query verifies that it contains movies;
 * empty genres never become visible, even when stale genre tags remain.
 */
export const useVelarisGenreRows = () => {
    const { api, user, __legacyApiClient__ } = useApi();
    const userId = user?.Id;
    const serverId = __legacyApiClient__?.serverId();

    const availableGenres = useQuery({
        queryKey: [ 'Velaris', 'MovieGenres', serverId, userId ],
        queryFn: async ({ signal }) => {
            const response = await getGenreApi(api!).getGenres({
                userId,
                includeItemTypes: [ BaseItemKind.Movie ],
                sortBy: [ ItemSortBy.SortName ],
                sortOrder: [ SortOrder.Ascending ],
                limit: 250,
                enableTotalRecordCount: false
            }, { signal });

            return (response.data.Items || [])
                .map(item => item.Name)
                .filter((name): name is string => Boolean(name));
        },
        enabled: Boolean(api && userId),
        staleTime: 90 * 1000
    });

    const genreSources = useMemo(
        () => getAvailableSmartHomeGenres(availableGenres.data || []),
        [ availableGenres.data ]
    );

    const movieQueries = useQueries({
        queries: genreSources.map(source => ({
            queryKey: [ 'Velaris', 'GenreMovies', serverId, userId, source.genre ],
            queryFn: async ({ signal }: { signal: AbortSignal }) => {
                const response = await getLibraryApi(api!).getItems({
                    userId,
                    recursive: true,
                    includeItemTypes: [ BaseItemKind.Movie ],
                    genres: [ source.genre ],
                    fields: [ ItemFields.Genres, ItemFields.PrimaryImageAspectRatio ],
                    enableImageTypes: [ ImageType.Primary, ImageType.Backdrop, ImageType.Thumb ],
                    imageTypeLimit: 1,
                    sortBy: [ ItemSortBy.DateCreated ],
                    sortOrder: [ SortOrder.Descending ],
                    limit: MAX_SMART_HOME_ROW_ITEMS,
                    enableTotalRecordCount: false
                }, { signal });

                return (response.data.Items || []) as ItemDto[];
            },
            enabled: Boolean(api && userId),
            staleTime: 2 * 60 * 1000
        }))
    });

    return buildSmartHomeGenreRows(genreSources.map((source, index) => ({
        ...source,
        items: movieQueries[index]?.data || []
    })));
};
