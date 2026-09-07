import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import React, { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { getVelarisFranchiseArtworkUrl } from 'apps/modern/features/franchises/franchiseArtwork';
import { playbackManager } from 'components/playback/playbackmanager';
import { appRouter } from 'components/router/appRouter';
import { useApi } from 'hooks/useApi';
import { useGetItems } from 'hooks/useFetchItems';
import type { ItemDto } from 'types/base/models/item-dto';

const HERO_ROTATION_INTERVAL = 12000;
const MAX_HERO_ITEMS = 6;

const toReactRoute = (url: string) => url.startsWith('#') ? url.substring(1) : url;

const formatRuntime = (runTimeTicks: number | null | undefined) => {
    if (!runTimeTicks) return undefined;

    const totalMinutes = Math.round(runTimeTicks / 600000000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes} Min.`;
    return `${hours} Std. ${minutes} Min.`;
};

const getHeroMeta = (item: ItemDto) => {
    const values: string[] = [];
    values.push(item.Type === BaseItemKind.Movie ? 'FILM' : 'SERIE');

    if (item.ProductionYear) values.push(String(item.ProductionYear));
    if (item.OfficialRating) values.push(item.OfficialRating);

    const runtime = item.Type === BaseItemKind.Movie ?
        formatRuntime(item.RunTimeTicks) :
        undefined;
    if (runtime) values.push(runtime);

    return values;
};

const getHeroCandidates = (items: ItemDto[]) => {
    const withBackdrop = items.filter(item => Boolean(item.BackdropImageTags?.length));
    const candidates = withBackdrop.length > 0 ? withBackdrop : items;

    return candidates
        .filter(item => Boolean(item.Id && item.Name))
        .slice(0, MAX_HERO_ITEMS);
};

const VelarisHomeHero: FC = () => {
    const { __legacyApiClient__ } = useApi();
    const [ activeIndex, setActiveIndex ] = useState(0);

    const request = useMemo(() => ({
        recursive: true,
        includeItemTypes: [ BaseItemKind.Movie, BaseItemKind.Series ],
        fields: [
            ItemFields.Genres,
            ItemFields.Overview,
            ItemFields.PrimaryImageAspectRatio,
            ItemFields.SortName,
            ItemFields.Taglines
        ],
        enableImageTypes: [ ImageType.Primary, ImageType.Backdrop ],
        imageTypeLimit: 1,
        sortBy: [ ItemSortBy.Random ],
        limit: 18,
        enableTotalRecordCount: false
    }), []);

    const query = useGetItems(request);
    const heroItems = useMemo(
        () => getHeroCandidates(query.data?.Items || []),
        [ query.data?.Items ]
    );

    useEffect(() => {
        if (activeIndex >= heroItems.length) setActiveIndex(0);
    }, [ activeIndex, heroItems.length ]);

    useEffect(() => {
        if (heroItems.length <= 1) return undefined;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

        const interval = window.setInterval(() => {
            setActiveIndex(index => (index + 1) % heroItems.length);
        }, HERO_ROTATION_INTERVAL);

        return () => window.clearInterval(interval);
    }, [ heroItems.length ]);

    const activeItem = heroItems[activeIndex];

    const onPlay = useCallback(() => {
        if (!activeItem?.Id || activeItem.Type !== BaseItemKind.Movie) return;

        void playbackManager.play({
            ids: [ activeItem.Id ],
            serverId: activeItem.ServerId || __legacyApiClient__?.serverId()
        });
    }, [ __legacyApiClient__, activeItem ]);

    const onIndicatorClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const index = Number(event.currentTarget.dataset.index);
        if (Number.isInteger(index)) setActiveIndex(index);
    }, []);

    if (query.isLoading || !activeItem) {
        return (
            <section className='velaris-home-hero velaris-home-hero--loading' aria-hidden='true'>
                <div className='velaris-home-hero__skeleton'></div>
            </section>
        );
    }

    const artworkUrl = getVelarisFranchiseArtworkUrl(
        __legacyApiClient__,
        activeItem,
        2200
    );
    const detailsUrl = toReactRoute(appRouter.getRouteUrl(activeItem));
    const meta = getHeroMeta(activeItem);
    const genreText = activeItem.Genres?.slice(0, 3).join(' · ');
    const tagline = activeItem.Taglines?.[0];
    const isMovie = activeItem.Type === BaseItemKind.Movie;

    return (
        <section
            className='velaris-home-hero'
            aria-label={`Spotlight: ${activeItem.Name}`}
            style={artworkUrl ? {
                backgroundImage: `linear-gradient(90deg, rgba(3, 4, 8, 0.98) 0%, rgba(3, 4, 8, 0.82) 34%, rgba(3, 4, 8, 0.28) 66%, rgba(3, 4, 8, 0.08) 100%), linear-gradient(0deg, #05060a 0%, rgba(5, 6, 10, 0.16) 42%, rgba(5, 6, 10, 0.05) 72%), url("${artworkUrl}")`
            } : undefined}
        >
            <div key={activeItem.Id} className='velaris-home-hero__content'>
                <span className='velaris-home-hero__eyebrow'>VELARIS SPOTLIGHT</span>
                <h1 className='velaris-home-hero__title'>{activeItem.Name}</h1>

                <div className='velaris-home-hero__meta'>
                    {meta.map(value => <span key={value}>{value}</span>)}
                </div>

                {tagline && (
                    <p className='velaris-home-hero__tagline'>{tagline}</p>
                )}

                {activeItem.Overview && (
                    <p className='velaris-home-hero__overview'>{activeItem.Overview}</p>
                )}

                {genreText && (
                    <p className='velaris-home-hero__genres'>{genreText}</p>
                )}

                <div className='velaris-home-hero__actions'>
                    {isMovie ? (
                        <button
                            type='button'
                            className='velaris-home-hero__button velaris-home-hero__button--primary'
                            onClick={onPlay}
                        >
                            <span className='material-icons' aria-hidden='true'>play_arrow</span>
                            Abspielen
                        </button>
                    ) : (
                        <Link
                            to={detailsUrl}
                            className='velaris-home-hero__button velaris-home-hero__button--primary'
                        >
                            <span className='material-icons' aria-hidden='true'>play_arrow</span>
                            Serie ansehen
                        </Link>
                    )}

                    <Link
                        to={detailsUrl}
                        className='velaris-home-hero__button velaris-home-hero__button--secondary'
                    >
                        <span className='material-icons' aria-hidden='true'>info</span>
                        Details
                    </Link>
                </div>
            </div>

            {heroItems.length > 1 && (
                <div className='velaris-home-hero__indicators' aria-label='Spotlight auswählen'>
                    {heroItems.map((item, index) => (
                        <button
                            key={item.Id}
                            type='button'
                            className={`velaris-home-hero__indicator${index === activeIndex ? ' velaris-home-hero__indicator--active' : ''}`}
                            data-index={index}
                            aria-label={`${item.Name} anzeigen`}
                            aria-current={index === activeIndex ? 'true' : undefined}
                            onClick={onIndicatorClick}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default VelarisHomeHero;
