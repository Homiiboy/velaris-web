import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models/base-item-dto';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';
import { useQuery } from '@tanstack/react-query';
import React, { type FC, useMemo } from 'react';
import { Link } from 'react-router-dom';

import {
    getVelarisLibraryCategory,
    sortVelarisLibraries
} from 'apps/modern/utils/velarisNavigation';
import { toReactRoute } from 'apps/modern/utils/velarisRouting';
import { appRouter } from 'components/router/appRouter';
import { useUserViews } from 'hooks/api/useUserViews';
import { useApi } from 'hooks/useApi';
import type { ItemDto } from 'types/base/models/item-dto';

import { getVelarisSmartHomeArtworkUrl } from './smartHomeArtwork';

interface VelarisHomeDestinationProps {
    library: BaseItemDto
}

const hasDestinationArtwork = (item: BaseItemDto) => Boolean(
    item.BackdropImageTags?.length
    || (item.ParentBackdropItemId && item.ParentBackdropImageTags?.length)
    || item.ImageTags?.Primary
);

const VelarisHomeDestination: FC<VelarisHomeDestinationProps> = ({ library }) => {
    const { api, user, __legacyApiClient__ } = useApi();
    const category = getVelarisLibraryCategory(library);

    const artworkQuery = useQuery({
        queryKey: [ 'VelarisHomeDestinationArtwork', user?.Id, library.Id ],
        enabled: Boolean(api && user?.Id && library.Id),
        staleTime: 5 * 60 * 1000,
        queryFn: async ({ signal }) => {
            if (!api || !user?.Id || !library.Id) return undefined;

            const response = await getLibraryApi(api).getItems({
                userId: user.Id,
                parentId: library.Id,
                recursive: true,
                enableImageTypes: [ ImageType.Backdrop, ImageType.Primary ],
                imageTypeLimit: 1,
                sortBy: [ ItemSortBy.DateCreated ],
                sortOrder: [ SortOrder.Descending ],
                startIndex: 0,
                limit: 24,
                enableTotalRecordCount: false
            }, { signal });

            return (response.data.Items || []).find(hasDestinationArtwork);
        }
    });

    const artworkUrl = artworkQuery.data ?
        getVelarisSmartHomeArtworkUrl(
            __legacyApiClient__,
            artworkQuery.data as ItemDto,
            1000
        ) :
        undefined;
    const route = toReactRoute(appRouter.getRouteUrl(library, {
        context: library.CollectionType
    }));

    return (
        <Link
            to={route}
            className={`velaris-home-destination velaris-home-destination--${category}`}
            style={artworkUrl ? {
                backgroundImage: `url("${artworkUrl}")`
            } : undefined}
        >
            <span className='velaris-home-destination__scrim' aria-hidden='true'></span>
            <span className='velaris-home-destination__content'>
                <span className='velaris-home-destination__label'>{library.Name}</span>
                <span className='velaris-home-destination__cta'>Entdecken</span>
            </span>
        </Link>
    );
};

const VelarisHomeDestinations: FC = () => {
    const { user } = useApi();
    const { data } = useUserViews({ userId: user?.Id });

    const libraries = useMemo(() => (
        sortVelarisLibraries(data?.Items || [])
            .filter(library => getVelarisLibraryCategory(library) !== 'other')
            .slice(0, 5)
    ), [ data ]);

    if (libraries.length === 0) return null;

    return (
        <section
            className='velaris-home-destinations'
            aria-labelledby='velaris-home-destinations-title'
        >
            <div className='velaris-home-destinations__heading'>
                <span className='velaris-home-destinations__eyebrow'>ENTDECKEN</span>
                <h2 id='velaris-home-destinations-title'>Deine Welten</h2>
            </div>

            <div className='velaris-home-destinations__rail'>
                {libraries.map(library => (
                    <VelarisHomeDestination
                        key={library.Id}
                        library={library}
                    />
                ))}
            </div>
        </section>
    );
};

export default VelarisHomeDestinations;
