import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import React, { type FC, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    type VelarisReleaseCategory,
    type VelarisReleaseEntry,
    type VelarisReleaseSourceItem
} from 'apps/modern/features/releaseHub/releaseHub';
import { useVelarisReleaseHub } from 'apps/modern/features/releaseHub/useVelarisReleaseHub';
import { getVelarisSmartHomeArtworkUrl } from 'apps/modern/features/home/smartHomeArtwork';
import { toReactRoute } from 'apps/modern/utils/velarisRouting';
import Loading from 'components/loading/LoadingComponent';
import Page from 'components/Page';
import { appRouter } from 'components/router/appRouter';
import { useApi } from 'hooks/useApi';
import type { ItemDto } from 'types/base/models/item-dto';

type ReleaseFilter = 'all' | VelarisReleaseCategory;

interface ReleaseCardProps {
    source: VelarisReleaseSourceItem
    badge?: string
}

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    timeZone: 'UTC'
});
const DATE_FORMATTER = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'long',
    timeZone: 'UTC'
});

const getDetailsUrl = (item: ItemDto) => toReactRoute(appRouter.getRouteUrl(item));

const getEpisodeLabel = (item: ItemDto) => {
    if (item.Type !== BaseItemKind.Episode) return 'Neue Serie';

    const season = item.ParentIndexNumber != null ? `S${item.ParentIndexNumber}` : '';
    const episode = item.IndexNumber != null ? `E${item.IndexNumber}` : '';
    return [ season && episode ? `${season}${episode}` : undefined, item.Name ].filter(Boolean).join(' · ');
};

const ReleaseCard: FC<ReleaseCardProps> = ({ source, badge }) => {
    const { __legacyApiClient__ } = useApi();
    const artworkUrl = getVelarisSmartHomeArtworkUrl(__legacyApiClient__, source.item, 760);
    const title = source.item.SeriesName || source.item.Name || 'Unbekannter Titel';
    const subtitle = getEpisodeLabel(source.item);

    return (
        <Link className='velaris-release-card' to={getDetailsUrl(source.item)}>
            <span
                className='velaris-release-card__artwork'
                style={artworkUrl ? { backgroundImage: `url("${artworkUrl}")` } : undefined}
            >
                {!artworkUrl && <span className='material-icons' aria-hidden='true'>live_tv</span>}
                <span className={`velaris-release-card__category velaris-release-card__category--${source.category}`}>
                    {source.category === 'anime' ? 'Anime' : 'Serie'}
                </span>
                {badge && <span className='velaris-release-card__badge'>{badge}</span>}
            </span>
            <span className='velaris-release-card__copy'>
                <strong className='velaris-release-card__title'>{title}</strong>
                <span className='velaris-release-card__subtitle'>{subtitle}</span>
            </span>
        </Link>
    );
};

const ReleaseHub = () => {
    const {
        newThisWeek,
        newEpisodesThisWeek,
        seasonPremieres,
        calendarDays,
        libraryCount,
        isPending,
        isError,
        isPartial
    } = useVelarisReleaseHub();
    const [ filter, setFilter ] = useState<ReleaseFilter>('all');

    const matchesFilter = useCallback((category: VelarisReleaseCategory) => (
        filter === 'all' || category === filter
    ), [ filter ]);

    const filteredNewThisWeek = useMemo(
        () => newThisWeek.filter(source => matchesFilter(source.category)),
        [ matchesFilter, newThisWeek ]
    );
    const filteredSeasonPremieres = useMemo(
        () => seasonPremieres.filter(entry => matchesFilter(entry.category)),
        [ matchesFilter, seasonPremieres ]
    );
    const filteredCalendarDays = useMemo(() => calendarDays
        .map(day => ({
            ...day,
            entries: day.entries.filter(entry => matchesFilter(entry.category))
        }))
        .filter(day => day.entries.length > 0), [ calendarDays, matchesFilter ]);

    const onFilterClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const nextFilter = event.currentTarget.dataset.filter as ReleaseFilter | undefined;
        if (nextFilter) setFilter(nextFilter);
    }, []);

    if (isPending) {
        return (
            <Page id='velarisReleaseHubPage' className='mainAnimatedPage velaris-release-hub-page' isBackButtonEnabled={false}>
                <Loading />
            </Page>
        );
    }

    const hasAnyData = newThisWeek.length > 0 || calendarDays.length > 0;

    return (
        <Page id='velarisReleaseHubPage' className='mainAnimatedPage velaris-release-hub-page' isBackButtonEnabled={false}>
            <header className='velaris-release-hero'>
                <div className='velaris-release-hero__content'>
                    <span className='velaris-release-hero__eyebrow'>VELARIS RELEASE HUB</span>
                    <h1>Neu diese Woche. Als Nächstes.</h1>
                    <p>
                        Neue Serien und Episoden aus deiner Mediathek — plus ein 28-Tage-Kalender aus den Premiere-Daten, die dein Server bereits kennt.
                    </p>
                    <div className='velaris-release-hero__stats'>
                        <span className='velaris-release-hero__stat'><strong>{newThisWeek.length}</strong> neu diese Woche</span>
                        <span className='velaris-release-hero__stat'><strong>{newEpisodesThisWeek.length}</strong> neue Episoden</span>
                        <span className='velaris-release-hero__stat'><strong>{seasonPremieres.length}</strong> Season Starts</span>
                    </div>
                </div>
            </header>

            <div className='velaris-release-toolbar' aria-label='Release Hub Filter'>
                <div>
                    <button type='button' data-filter='all' aria-pressed={filter === 'all'} onClick={onFilterClick}>Alles</button>
                    <button type='button' data-filter='series' aria-pressed={filter === 'series'} onClick={onFilterClick}>Serien</button>
                    <button type='button' data-filter='anime' aria-pressed={filter === 'anime'} onClick={onFilterClick}>Anime</button>
                </div>
                <span className='velaris-release-toolbar__count'>{libraryCount} Release-Bibliothek{libraryCount === 1 ? '' : 'en'}</span>
            </div>

            {isPartial && (
                <div className='velaris-release-warning' role='status'>
                    Ein Teil der Release-Daten konnte nicht vollständig geladen werden. Bereits geladene Einträge bleiben verfügbar.
                </div>
            )}

            {isError && !hasAnyData && (
                <section className='velaris-release-empty'>
                    <span className='material-icons' aria-hidden='true'>cloud_off</span>
                    <h2>Release Hub konnte nicht geladen werden.</h2>
                    <p>Die Mediathek wurde nicht verändert. Öffne die Seite erneut, sobald der Server erreichbar ist.</p>
                </section>
            )}

            {!isError && libraryCount === 0 && (
                <section className='velaris-release-empty'>
                    <span className='material-icons' aria-hidden='true'>video_library</span>
                    <h2>Keine Serien- oder Anime-Bibliothek gefunden.</h2>
                    <p>Der Release Hub erscheint automatisch, sobald eine passende Bibliothek verfügbar ist.</p>
                </section>
            )}

            {filteredNewThisWeek.length > 0 && (
                <section className='velaris-release-section'>
                    <div className='velaris-release-section__heading'>
                        <div>
                            <span className='velaris-release-section__eyebrow'>DIESE WOCHE</span>
                            <h2>Neu in deiner Mediathek</h2>
                        </div>
                        <strong className='velaris-release-section__count'>{filteredNewThisWeek.length} Titel</strong>
                    </div>
                    <div className='velaris-release-rail'>
                        {filteredNewThisWeek.map(source => (
                            <ReleaseCard
                                key={`${source.category}:${source.item.Id}`}
                                source={source}
                                badge={source.item.Type === BaseItemKind.Episode ? 'Neue Episode' : 'Neu'}
                            />
                        ))}
                    </div>
                </section>
            )}

            {filteredSeasonPremieres.length > 0 && (
                <section className='velaris-release-section'>
                    <div className='velaris-release-section__heading'>
                        <div>
                            <span className='velaris-release-section__eyebrow'>SEASON STARTS</span>
                            <h2>Neue Staffeln im Kalender</h2>
                        </div>
                        <strong className='velaris-release-section__count'>{filteredSeasonPremieres.length} Starts</strong>
                    </div>
                    <div className='velaris-release-rail velaris-release-rail--season'>
                        {filteredSeasonPremieres.map(entry => (
                            <ReleaseCard
                                key={`${entry.category}:${entry.item.Id}`}
                                source={entry}
                                badge={`Staffel ${entry.item.ParentIndexNumber}`}
                            />
                        ))}
                    </div>
                </section>
            )}

            <section className='velaris-release-section velaris-release-calendar'>
                <div className='velaris-release-section__heading'>
                    <div>
                        <span className='velaris-release-section__eyebrow'>KALENDER</span>
                        <h2>Die nächsten 28 Tage</h2>
                    </div>
                    <strong className='velaris-release-section__count'>
                        {filteredCalendarDays.reduce((count, day) => count + day.entries.length, 0)} Episoden
                    </strong>
                </div>

                {filteredCalendarDays.length > 0 ? (
                    <div className='velaris-release-calendar__days'>
                        {filteredCalendarDays.map(day => (
                            <article key={day.dateKey} className='velaris-release-day'>
                                <header className='velaris-release-day__date'>
                                    <strong className='velaris-release-day__weekday'>{WEEKDAY_FORMATTER.format(day.releaseDateMs)}</strong>
                                    <span className='velaris-release-day__calendar-date'>{DATE_FORMATTER.format(day.releaseDateMs)}</span>
                                </header>
                                <div className='velaris-release-day__entries'>
                                    {day.entries.map((entry: VelarisReleaseEntry) => (
                                        <ReleaseCard
                                            key={`${entry.category}:${entry.item.Id}`}
                                            source={entry}
                                            badge={entry.isSeasonPremiere ? 'Season Start' : undefined}
                                        />
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className='velaris-release-calendar__empty'>
                        <span className='material-icons' aria-hidden='true'>event_busy</span>
                        <strong className='velaris-release-calendar__empty-title'>Keine kommenden Episoden mit Premiere-Datum gefunden.</strong>
                        <span className='velaris-release-calendar__empty-copy'>Velaris zeigt hier nur reale Release-Metadaten an, die dein Jellyfin-Server bereits kennt.</span>
                    </div>
                )}
            </section>
        </Page>
    );
};

export default ReleaseHub;
