import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import React, { type FC } from 'react';
import { Link } from 'react-router-dom';

import type { VelarisInsightBreakdown } from 'apps/modern/features/insights/insights';
import { useVelarisInsights } from 'apps/modern/features/insights/useVelarisInsights';
import { getVelarisSmartHomeArtworkUrl } from 'apps/modern/features/home/smartHomeArtwork';
import { toReactRoute } from 'apps/modern/utils/velarisRouting';
import Loading from 'components/loading/LoadingComponent';
import Page from 'components/Page';
import { appRouter } from 'components/router/appRouter';
import { useApi } from 'hooks/useApi';
import type { ItemDto } from 'types/base/models/item-dto';

const DATE_FORMATTER = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
});
const NUMBER_FORMATTER = new Intl.NumberFormat('de-DE');

const getDetailsUrl = (item: ItemDto) => toReactRoute(appRouter.getRouteUrl(item));

const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${NUMBER_FORMATTER.format(minutes)} Min.`;
    const hours = Math.round(minutes / 60);
    if (hours < 48) return `${NUMBER_FORMATTER.format(hours)} Std.`;
    const days = Math.round(hours / 24);
    return `${NUMBER_FORMATTER.format(days)} Tage`;
};

const getLastPlayedDate = (item: ItemDto) => (
    item.UserData?.LastPlayedDate || item.LastPlayedDate
);

interface InsightBarProps {
    entry: VelarisInsightBreakdown
    maximum: number
}

const InsightBar: FC<InsightBarProps> = ({ entry, maximum }) => {
    const width = maximum > 0 ? Math.max(6, Math.round(entry.plays / maximum * 100)) : 0;

    return (
        <div className='velaris-insights-bar'>
            <div className='velaris-insights-bar__heading'>
                <strong>{entry.name}</strong>
                <span>{NUMBER_FORMATTER.format(entry.plays)} Plays</span>
            </div>
            <div className='velaris-insights-bar__track' aria-hidden='true'>
                <span className='velaris-insights-bar__fill' style={{ width: `${width}%` }} />
            </div>
        </div>
    );
};

const RecentCard: FC<{ item: ItemDto }> = ({ item }) => {
    const { __legacyApiClient__ } = useApi();
    const artworkUrl = getVelarisSmartHomeArtworkUrl(__legacyApiClient__, item, 720);
    const lastPlayedDate = getLastPlayedDate(item);
    const title = item.SeriesName || item.Name || 'Unbekannter Titel';
    const subtitle = item.Type === BaseItemKind.Episode && item.SeriesName
        ? item.Name
        : item.Type === BaseItemKind.Movie ? 'Film' : 'Episode';

    return (
        <Link className='velaris-insights-recent-card' to={getDetailsUrl(item)}>
            <span
                className='velaris-insights-recent-card__artwork'
                style={artworkUrl ? { backgroundImage: `url("${artworkUrl}")` } : undefined}
            >
                {!artworkUrl && <span className='material-icons' aria-hidden='true'>play_circle</span>}
            </span>
            <strong className='velaris-insights-recent-card__title'>{title}</strong>
            <span className='velaris-insights-recent-card__subtitle'>{subtitle}</span>
            {lastPlayedDate && (
                <span className='velaris-insights-recent-card__date'>
                    {DATE_FORMATTER.format(new Date(lastPlayedDate))}
                </span>
            )}
        </Link>
    );
};

const Insights = () => {
    const {
        watchedTitles,
        watchedMovies,
        watchedEpisodes,
        totalPlays,
        rewatches,
        estimatedWatchMinutes,
        activeTitlesLast30Days,
        topGenres,
        topSeries,
        recentItems,
        isPending,
        isError,
        isPartial
    } = useVelarisInsights();

    if (isPending) {
        return (
            <Page id='velarisInsightsPage' className='mainAnimatedPage velaris-insights-page' isBackButtonEnabled={false}>
                <Loading />
            </Page>
        );
    }

    const topGenreMaximum = topGenres[0]?.plays || 0;

    return (
        <Page id='velarisInsightsPage' className='mainAnimatedPage velaris-insights-page' isBackButtonEnabled={false}>
            <header className='velaris-insights-hero'>
                <span className='velaris-insights-hero__eyebrow'>VELARIS INSIGHTS</span>
                <h1>Deine Watch-Story.</h1>
                <p>
                    Persönliche Statistiken aus den Wiedergabedaten deines aktuellen Jellyfin-Profils — ohne separate Tracking-Datenbank.
                </p>
            </header>

            {isPartial && (
                <div className='velaris-insights-warning' role='status'>
                    Die Statistik wurde wegen einer sehr großen Wiedergabehistorie begrenzt. Die angezeigten Daten bleiben nutzbar.
                </div>
            )}

            {isError && (
                <section className='velaris-insights-empty'>
                    <span className='material-icons' aria-hidden='true'>cloud_off</span>
                    <h2>Insights konnten nicht geladen werden.</h2>
                    <p>Deine Jellyfin-Wiedergabedaten wurden nicht verändert.</p>
                </section>
            )}

            {!isError && watchedTitles === 0 && (
                <section className='velaris-insights-empty'>
                    <span className='material-icons' aria-hidden='true'>insights</span>
                    <h2>Noch keine abgeschlossenen Titel.</h2>
                    <p>Sobald dein Profil Filme oder Episoden als gesehen markiert hat, baut Velaris hier deine persönlichen Insights auf.</p>
                </section>
            )}

            {!isError && watchedTitles > 0 && (
                <>
                    <section className='velaris-insights-stats' aria-label='Watch-Statistik'>
                        <article className='velaris-insights-stat'>
                            <span>ERFASSTE PLAYS</span>
                            <strong>{NUMBER_FORMATTER.format(totalPlays)}</strong>
                            <small>{NUMBER_FORMATTER.format(rewatches)} davon Wiederholungen</small>
                        </article>
                        <article className='velaris-insights-stat'>
                            <span>WATCH TIME</span>
                            <strong>{formatDuration(estimatedWatchMinutes)}</strong>
                            <small>aus Laufzeit × bekannten Plays abgeleitet</small>
                        </article>
                        <article className='velaris-insights-stat'>
                            <span>FILME</span>
                            <strong>{NUMBER_FORMATTER.format(watchedMovies)}</strong>
                            <small>abgeschlossene Filmtitel</small>
                        </article>
                        <article className='velaris-insights-stat'>
                            <span>EPISODEN</span>
                            <strong>{NUMBER_FORMATTER.format(watchedEpisodes)}</strong>
                            <small>abgeschlossene Episoden</small>
                        </article>
                        <article className='velaris-insights-stat'>
                            <span>LETZTE 30 TAGE</span>
                            <strong>{NUMBER_FORMATTER.format(activeTitlesLast30Days)}</strong>
                            <small>Titel mit letztem Play in diesem Zeitraum</small>
                        </article>
                    </section>

                    <div className='velaris-insights-grid'>
                        <section className='velaris-insights-panel'>
                            <div className='velaris-insights-panel__heading'>
                                <span>GESCHMACK</span>
                                <h2>Top Genres</h2>
                            </div>
                            <div className='velaris-insights-bars'>
                                {topGenres.map(entry => (
                                    <InsightBar key={entry.name} entry={entry} maximum={topGenreMaximum} />
                                ))}
                                {topGenres.length === 0 && <p className='velaris-insights-panel__empty'>Keine Genre-Metadaten verfügbar.</p>}
                            </div>
                        </section>

                        <section className='velaris-insights-panel'>
                            <div className='velaris-insights-panel__heading'>
                                <span>SERIEN</span>
                                <h2>Meistgesehen</h2>
                            </div>
                            <div className='velaris-insights-series-list'>
                                {topSeries.map((entry, index) => (
                                    <div key={entry.id} className='velaris-insights-series'>
                                        <span className='velaris-insights-series__rank'>{String(index + 1).padStart(2, '0')}</span>
                                        <div className='velaris-insights-series__copy'>
                                            <strong>{entry.name}</strong>
                                            <span>{entry.episodes} Episoden · {entry.plays} Plays · {formatDuration(Math.round(entry.minutes))}</span>
                                        </div>
                                    </div>
                                ))}
                                {topSeries.length === 0 && <p className='velaris-insights-panel__empty'>Noch keine gesehenen Episoden verfügbar.</p>}
                            </div>
                        </section>
                    </div>

                    {recentItems.length > 0 && (
                        <section className='velaris-insights-recent'>
                            <div className='velaris-insights-recent__heading'>
                                <span>LETZTE AKTIVITÄT</span>
                                <h2>Zuletzt gesehen</h2>
                            </div>
                            <div className='velaris-insights-recent__rail'>
                                {recentItems.map(item => <RecentCard key={item.Id} item={item} />)}
                            </div>
                        </section>
                    )}
                </>
            )}
        </Page>
    );
};

export default Insights;
