import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import React, { type FC } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getVelarisFranchiseArtworkUrl } from 'apps/modern/features/franchises/franchiseArtwork';
import { useVelarisFranchiseHubs } from 'apps/modern/features/franchises/useVelarisFranchiseHubs';
import { CardShape } from 'components/cardbuilder/utils/shape';
import SectionContainer from 'components/common/SectionContainer';
import Loading from 'components/loading/LoadingComponent';
import Page from 'components/Page';
import { useApi } from 'hooks/useApi';

const Franchise: FC = () => {
    const { hubId } = useParams();
    const { __legacyApiClient__ } = useApi();
    const { hubs, isLoading } = useVelarisFranchiseHubs();
    const hub = hubs.find(candidate => candidate.id === hubId);

    if (isLoading) {
        return <Loading />;
    }

    if (!hub) {
        return (
            <Page
                id='velarisFranchiseNotFoundPage'
                className='mainAnimatedPage velaris-franchise-page'
            >
                <div className='velaris-franchise-empty'>
                    <span className='velaris-franchise-empty__eyebrow'>VELARIS</span>
                    <h1 className='velaris-franchise-empty__title'>Dieses Universum ist noch leer.</h1>
                    <p className='velaris-franchise-empty__text'>
                        Der Hub erscheint automatisch, sobald passende Filme oder Serien in deiner Mediathek vorhanden sind.
                    </p>
                    <Link to='/home' className='velaris-franchise-empty__link'>
                        Zurück zu Home
                    </Link>
                </div>
            </Page>
        );
    }

    const artworkUrl = getVelarisFranchiseArtworkUrl(
        __legacyApiClient__,
        hub.representativeItem,
        1800
    );

    return (
        <Page
            id='velarisFranchisePage'
            className='mainAnimatedPage velaris-franchise-page'
            backDropType={[ BaseItemKind.Movie, BaseItemKind.Series ]}
        >
            <header
                className='velaris-franchise-hero'
                style={artworkUrl ? {
                    backgroundImage: `linear-gradient(90deg, rgba(3, 4, 8, 0.98) 0%, rgba(3, 4, 8, 0.76) 38%, rgba(3, 4, 8, 0.18) 74%), linear-gradient(0deg, #05060a 0%, rgba(5, 6, 10, 0.08) 42%), url("${artworkUrl}")`
                } : undefined}
            >
                <div className='velaris-franchise-hero__content'>
                    <span className='velaris-franchise-hero__eyebrow'>
                        {hub.eyebrow}
                    </span>
                    <h1 className='velaris-franchise-hero__title'>
                        {hub.name}
                    </h1>
                    <p className='velaris-franchise-hero__description'>
                        {hub.description}
                    </p>
                    <div className='velaris-franchise-hero__meta'>
                        <span>{hub.items.length} Titel</span>
                        <span aria-hidden='true'>•</span>
                        <span>{hub.groups.length} Bereiche</span>
                    </div>
                </div>
            </header>

            <main className='velaris-franchise-groups'>
                {hub.groups.map(group => (
                    <SectionContainer
                        key={group.id}
                        className='velaris-franchise-group'
                        sectionHeaderProps={{
                            title: group.name
                        }}
                        items={group.items}
                        cardOptions={{
                            scalable: true,
                            overlayPlayButton: true,
                            showTitle: true,
                            centerText: true,
                            cardLayout: false,
                            shape: CardShape.PortraitOverflow,
                            showYear: true,
                            serverId: __legacyApiClient__?.serverId()
                        }}
                    />
                ))}
            </main>
        </Page>
    );
};

export default Franchise;
