import React, { type FC, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { useApi } from 'hooks/useApi';

import { getVelarisFranchiseArtworkUrl } from './franchiseArtwork';
import { useVelarisFranchiseHubs } from './useVelarisFranchiseHubs';

const VelarisFranchiseShelf: FC = () => {
    const { __legacyApiClient__ } = useApi();
    const { hubs, isPending, isError } = useVelarisFranchiseHubs();
    const railRef = useRef<HTMLDivElement>(null);

    // Re-entering the home screen should show the start of the franchise shelf.
    useEffect(() => {
        if (!isPending && hubs.length > 0 && railRef.current) {
            railRef.current.scrollLeft = 0;
        }
    }, [ isPending, hubs.length ]);

    if (isPending || isError || hubs.length === 0) return null;

    return (
        <section
            className='velaris-franchise-discovery'
            aria-labelledby='velaris-franchise-discovery-title'
        >
            <div className='velaris-franchise-discovery__heading'>
                <span className='velaris-franchise-discovery__eyebrow'>VELARIS</span>
                <h2
                    id='velaris-franchise-discovery-title'
                    className='velaris-franchise-discovery__title'
                >
                    Universen & Franchises
                </h2>
                <p className='velaris-franchise-discovery__subtitle'>
                    Automatisch aus deiner vorhandenen Mediathek zusammengestellt.
                </p>
            </div>

            <div className='velaris-franchise-discovery__rail' ref={railRef}>
                {hubs.map(hub => {
                    const artworkUrl = getVelarisFranchiseArtworkUrl(
                        __legacyApiClient__,
                        hub.representativeItem,
                        900
                    );

                    return (
                        <Link
                            key={hub.id}
                            to={`/franchise/${hub.id}`}
                            className='velaris-franchise-card'
                        >
                            {artworkUrl && (
                                <img
                                    className='velaris-franchise-card__artwork'
                                    src={artworkUrl}
                                    alt=''
                                    loading='lazy'
                                    aria-hidden='true'
                                />
                            )}
                            <div className='velaris-franchise-card__content'>
                                <span className='velaris-franchise-card__eyebrow'>
                                    {hub.eyebrow}
                                </span>
                                <strong className='velaris-franchise-card__title'>
                                    {hub.name}
                                </strong>
                                <span className='velaris-franchise-card__meta'>
                                    {hub.groups.length} {hub.groups.length === 1 ? 'Bereich' : 'Bereiche'} · {hub.items.length} Titel
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default VelarisFranchiseShelf;
