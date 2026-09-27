import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { useQueries } from '@tanstack/react-query';
import type { ApiClient } from 'jellyfin-apiclient';
import React, { type FC, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import { getLatestMediaQuery } from 'apps/legacy/features/libraries/api/useLatestMedia';
import { getVelarisSmartHomePosterUrl } from 'apps/modern/features/home/smartHomeArtwork';
import {
    getVelarisLibraryCategory,
    type VelarisLibraryCategory
} from 'apps/modern/utils/velarisNavigation';
import { toReactRoute } from 'apps/modern/utils/velarisRouting';
import Loading from 'components/loading/LoadingComponent';
import Page from 'components/Page';
import { appRouter } from 'components/router/appRouter';
import { useUserViews } from 'hooks/api/useUserViews';
import { useApi } from 'hooks/useApi';
import type { ItemDto } from 'types/base/models/item-dto';

type LatestCategory = 'movies' | 'series' | 'anime' | 'anime-movies';
type LatestFilter = LatestCategory | 'all';

interface LatestLibrary {
    id: string
    category: LatestCategory
}

interface LatestSection {
    category: LatestCategory
    title: string
    description: string
    items: ItemDto[]
    libraryCount: number
    isPending: boolean
    isError: boolean
}

const CATEGORIES: { id: LatestCategory; title: string; description: string }[] = [
    { id: 'movies', title: 'Filme', description: 'Die neuesten Filme in deiner Mediathek.' },
    { id: 'series', title: 'Serien', description: 'Neue Serien und frisch hinzugefügte Folgen.' },
    { id: 'anime', title: 'Animes', description: 'Neue Anime-Serien und Episoden.' },
    { id: 'anime-movies', title: 'Anime Filme', description: 'Neu hinzugefügte Anime-Filme.' }
];

const CATEGORY_LIMIT = 24;

const isLatestCategory = (value: VelarisLibraryCategory): value is LatestCategory => (
    value === 'movies' || value === 'series' || value === 'anime' || value === 'anime-movies'
);

const getRecentPosterUrl = (apiClient: ApiClient | undefined, item: ItemDto) => {
    if (!apiClient) return undefined;

    // Jellyfin's latest media endpoint also returns episodes. Display the
    // series poster instead of cropping an episode thumbnail into portrait.
    if (item.Type === BaseItemKind.Episode) {
        if (item.SeriesId && item.SeriesPrimaryImageTag) {
            return apiClient.getImageUrl(item.SeriesId, {
                type: ImageType.Primary,
                tag: item.SeriesPrimaryImageTag,
                maxWidth: 480
            });
        }
        if (item.ParentPrimaryImageItemId && item.ParentPrimaryImageTag) {
            return apiClient.getImageUrl(item.ParentPrimaryImageItemId, {
                type: ImageType.Primary,
                tag: item.ParentPrimaryImageTag,
                maxWidth: 480
            });
        }
    }

    return getVelarisSmartHomePosterUrl(apiClient, item, 480);
};

const getRecentItemLabel = (item: ItemDto) => (
    item.Type === BaseItemKind.Episode ? item.SeriesName || item.Name : item.Name
);

const getRecentItemSubtitle = (item: ItemDto) => {
    if (item.Type === BaseItemKind.Episode) {
        const season = item.ParentIndexNumber != null ? 'S' + item.ParentIndexNumber : '';
        const episode = item.IndexNumber != null ? 'E' + item.IndexNumber : '';
        const number = season + episode;
        return [ number, item.Name ].filter(Boolean).join(' · ');
    }
    return item.ProductionYear ? String(item.ProductionYear) : 'Neu hinzugefügt';
};

const mergeLatestItems = (groups: ItemDto[][]) => {
    const used = new Set<string>();
    return groups.flat()
        .filter(item => Boolean(item.Id))
        .sort((a, b) => (b.DateCreated || '').localeCompare(a.DateCreated || ''))
        .filter(item => {
            const key = item.Type === BaseItemKind.Episode ? item.SeriesId || item.Id : item.Id;
            if (!key || used.has(key)) return false;
            used.add(key);
            return true;
        })
        .slice(0, CATEGORY_LIMIT);
};

interface LatestCardProps {
    item: ItemDto
}

const LatestCard: FC<LatestCardProps> = ({ item }) => {
    const { __legacyApiClient__ } = useApi();
    const artworkUrl = getRecentPosterUrl(__legacyApiClient__, item);
    const title = getRecentItemLabel(item) || 'Unbekannter Titel';
    const subtitle = getRecentItemSubtitle(item);

    return (
        <Link
            className='velaris-latest-card'
            to={toReactRoute(appRouter.getRouteUrl(item))}
            aria-label={title + ' öffnen'}
        >
            <span className='velaris-latest-card__image'>
                {artworkUrl ? (
                    <img src={artworkUrl} alt='' loading='lazy' />
                ) : (
                    <span className='material-icons' aria-hidden='true'>movie</span>
                )}
            </span>
            <strong className='velaris-latest-card__title'>{title}</strong>
            <span className='velaris-latest-card__subtitle'>{subtitle}</span>
        </Link>
    );
};

interface LatestSectionProps {
    section: LatestSection
}

const LatestSectionRow: FC<LatestSectionProps> = ({ section }) => {
    if (section.libraryCount === 0) return null;

    let content: React.ReactNode;
    if (section.isPending) {
        content = <div className='velaris-latest-section__status' role='status'>Inhalte werden geladen …</div>;
    } else if (section.items.length > 0) {
        content = (
            <div className='velaris-latest-section__rail'>
                {section.items.map(item => <LatestCard key={item.Id} item={item} />)}
            </div>
        );
    } else {
        content = (
            <div className='velaris-latest-section__status'>
                {section.isError ? 'Diese Bibliothek konnte nicht geladen werden.' : 'Noch keine neuen Titel vorhanden.'}
            </div>
        );
    }

    return (
        <section className='velaris-latest-section' aria-labelledby={'latest-' + section.category}>
            <div className='velaris-latest-section__heading'>
                <div>
                    <h2 id={'latest-' + section.category}>{section.title}</h2>
                    <p>{section.description}</p>
                </div>
                {!section.isPending && !section.isError && (
                    <span className='velaris-latest-section__count'>{section.items.length} Titel</span>
                )}
            </div>
            {content}
        </section>
    );
};

const Latest = () => {
    const { api, user } = useApi();
    const [ filter, setFilter ] = useState<LatestFilter>('all');
    const views = useUserViews({ userId: user?.Id });
    const libraries: LatestLibrary[] = (views.data?.Items || []).flatMap(view => {
        const category = getVelarisLibraryCategory(view);
        return view.Id && isLatestCategory(category) ? [{ id: view.Id, category }] : [];
    });

    const queries = useQueries({
        queries: libraries.map(library => ({
            ...getLatestMediaQuery(api, {
                userId: user?.Id,
                parentId: library.id,
                limit: CATEGORY_LIMIT,
                fields: [ ItemFields.DateCreated, ItemFields.PrimaryImageAspectRatio ],
                enableImageTypes: [ ImageType.Primary, ImageType.Backdrop, ImageType.Thumb ],
                imageTypeLimit: 1
            }),
            enabled: Boolean(api && user?.Id),
            staleTime: 2 * 60 * 1000
        }))
    });

    const sections: LatestSection[] = CATEGORIES.map(category => {
        const sourceIndices = libraries.flatMap((library, index) => (
            library.category === category.id ? [ index ] : []
        ));
        const sourceQueries = sourceIndices.map(index => queries[index]);
        return {
            category: category.id,
            title: category.title,
            description: category.description,
            libraryCount: sourceIndices.length,
            items: mergeLatestItems(sourceQueries.map(query => (query.data || []) as ItemDto[])),
            isPending: sourceQueries.some(query => query.isPending),
            isError: sourceQueries.some(query => query.isError)
        };
    });

    const onFilterClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const next = event.currentTarget.dataset.category as LatestFilter | undefined;
        if (next && (next === 'all' || CATEGORIES.some(category => category.id === next))) {
            setFilter(next);
        }
    }, []);

    const visibleSections = sections.filter(section => filter === 'all' || section.category === filter);
    const hasLibraries = libraries.length > 0;
    let pageContent: React.ReactNode;

    if (views.isPending) {
        pageContent = <Loading />;
    } else if (views.isError) {
        pageContent = (
            <div className='velaris-latest-empty' role='status'>
                Deine Bibliotheken konnten nicht geladen werden.
            </div>
        );
    } else if (!hasLibraries) {
        pageContent = (
            <div className='velaris-latest-empty'>
                Keine Film-, Serien- oder Anime-Bibliothek gefunden.
            </div>
        );
    } else {
        pageContent = (
            <div className='velaris-latest-content'>
                {visibleSections.map(section => (
                    <LatestSectionRow key={section.category} section={section} />
                ))}
                {filter !== 'all' && visibleSections[0]?.libraryCount === 0 && (
                    <div className='velaris-latest-empty'>Keine Bibliothek in dieser Kategorie vorhanden.</div>
                )}
            </div>
        );
    }

    return (
        <Page id='velarisLatestPage' className='mainAnimatedPage velaris-latest-page' isBackButtonEnabled={false}>
            <header className='velaris-latest-intro'>
                <span className='velaris-latest-intro__eyebrow'>DEINE MEDIATHEK</span>
                <h1>Neu hinzugefügt</h1>
                <p>Deine neuesten Filme, Serien, Animes und Anime-Filme – übersichtlich an einem Ort.</p>
            </header>

            <nav className='velaris-latest-filters' aria-label='Medienkategorie'>
                <button type='button' data-category='all' aria-pressed={filter === 'all'} onClick={onFilterClick}>Alles</button>
                {CATEGORIES.map(category => (
                    <button
                        key={category.id}
                        type='button'
                        data-category={category.id}
                        aria-pressed={filter === category.id}
                        onClick={onFilterClick}
                    >
                        {category.title}
                    </button>
                ))}
            </nav>

            {pageContent}
        </Page>
    );
};

export default Latest;
