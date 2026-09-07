import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import React, { type FC, useMemo } from 'react';
import { Link } from 'react-router-dom';

import {
    getVelarisLibraryCategory,
    sortVelarisLibraries
} from 'apps/modern/utils/velarisNavigation';
import { appRouter } from 'components/router/appRouter';
import { useUserViews } from 'hooks/api/useUserViews';
import { useApi } from 'hooks/useApi';

const toReactRoute = (url: string) => url.startsWith('#') ? url.substring(1) : url;

const VelarisHomeDestinations: FC = () => {
    const { user, __legacyApiClient__ } = useApi();
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
                {libraries.map(library => {
                    const category = getVelarisLibraryCategory(library);
                    const backdropTag = library.BackdropImageTags?.[0];
                    const primaryTag = library.ImageTags?.Primary;
                    const artworkUrl = library.Id && __legacyApiClient__ && (backdropTag || primaryTag)
                        ? __legacyApiClient__.getImageUrl(library.Id, {
                            type: backdropTag ? ImageType.Backdrop : ImageType.Primary,
                            tag: backdropTag || primaryTag,
                            maxWidth: 1000
                        })
                        : undefined;
                    const route = toReactRoute(appRouter.getRouteUrl(library, {
                        context: library.CollectionType
                    }));

                    return (
                        <Link
                            key={library.Id}
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
                })}
            </div>
        </section>
    );
};

export default VelarisHomeDestinations;
