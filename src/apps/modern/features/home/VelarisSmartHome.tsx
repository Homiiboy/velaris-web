import React, { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { toReactRoute } from 'apps/modern/utils/velarisRouting';
import { getVelarisLocalStorage } from 'apps/modern/utils/velarisStorage';
import { playbackManager } from 'components/playback/playbackmanager';
import { appRouter } from 'components/router/appRouter';
import { useApi } from 'hooks/useApi';
import type { ItemDto } from 'types/base/models/item-dto';

import { getVelarisSmartHomeArtworkUrl } from './smartHomeArtwork';
import {
    buildSmartHomeRows,
    DEFAULT_SMART_HOME_PREFERENCES,
    moveSmartHomeRow,
    sanitizeSmartHomePreferences,
    SMART_HOME_ROW_LABELS,
    toggleSmartHomeRow,
    type SmartHomePreferences,
    type SmartHomeRow,
    type SmartHomeRowId
} from './smartHome';
import {
    readVelarisSmartHomePreferences,
    saveVelarisSmartHomePreferences
} from './smartHomePersistence';
import { useVelarisSmartHome, type SmartHomeContinueAction } from './useVelarisSmartHome';

const getDetailsUrl = (item: ItemDto) => toReactRoute(appRouter.getRouteUrl(item));

const formatRuntime = (item: ItemDto) => {
    if (!item.RunTimeTicks) return undefined;

    const minutes = Math.round(item.RunTimeTicks / 600000000);
    if (minutes < 60) return `${minutes} Min.`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} Std. ${remainingMinutes} Min.` : `${hours} Std.`;
};

interface SmartHomeCardProps {
    item: ItemDto
}

const SmartHomeCard: FC<SmartHomeCardProps> = ({ item }) => {
    const { __legacyApiClient__ } = useApi();
    const artworkUrl = getVelarisSmartHomeArtworkUrl(__legacyApiClient__, item);
    const runtime = formatRuntime(item);
    const meta = [ item.ProductionYear, runtime, item.Genres?.[0] ].filter(Boolean).join(' · ');

    return (
        <Link
            className='velaris-smart-card'
            to={getDetailsUrl(item)}
            aria-label={`${item.Name} öffnen`}
        >
            <div
                className='velaris-smart-card__artwork'
                style={artworkUrl ? { backgroundImage: `url("${artworkUrl}")` } : undefined}
            >
                {!artworkUrl && (
                    <span className='material-icons velaris-smart-card__fallback' aria-hidden='true'>movie</span>
                )}
                <span className='velaris-smart-card__details-icon material-icons' aria-hidden='true'>arrow_forward</span>
            </div>
            <strong className='velaris-smart-card__title'>{item.Name}</strong>
            {meta && <span className='velaris-smart-card__meta'>{meta}</span>}
        </Link>
    );
};

interface ContinueCardProps {
    item: ItemDto
    isBusy: boolean
    onAction: (itemId: string, action: SmartHomeContinueAction) => void
}

const ContinueCard: FC<ContinueCardProps> = ({ item, isBusy, onAction }) => {
    const { __legacyApiClient__ } = useApi();
    const artworkUrl = getVelarisSmartHomeArtworkUrl(__legacyApiClient__, item, 900);
    const progress = item.RunTimeTicks && item.UserData?.PlaybackPositionTicks ?
        Math.min(100, Math.max(0, item.UserData.PlaybackPositionTicks / item.RunTimeTicks * 100)) :
        0;
    const parentTitle = item.SeriesName || item.Album || undefined;

    const onPlay = useCallback(() => {
        if (!item.Id) return;

        void playbackManager.play({
            ids: [ item.Id ],
            serverId: item.ServerId || __legacyApiClient__?.serverId(),
            startPositionTicks: item.UserData?.PlaybackPositionTicks || 0
        });
    }, [ __legacyApiClient__, item ]);

    const onReset = useCallback(() => {
        if (item.Id) onAction(item.Id, 'reset');
    }, [ item.Id, onAction ]);

    const onWatched = useCallback(() => {
        if (item.Id) onAction(item.Id, 'watched');
    }, [ item.Id, onAction ]);

    return (
        <article className='velaris-continue-card'>
            <div
                className='velaris-continue-card__artwork'
                style={artworkUrl ? { backgroundImage: `url("${artworkUrl}")` } : undefined}
            >
                {!artworkUrl && (
                    <span className='material-icons velaris-smart-card__fallback' aria-hidden='true'>play_circle</span>
                )}
                <button
                    type='button'
                    className='velaris-continue-card__play'
                    onClick={onPlay}
                    aria-label={`${item.Name} fortsetzen`}
                >
                    <span className='material-icons' aria-hidden='true'>play_arrow</span>
                </button>
                <div className='velaris-continue-card__progress' aria-hidden='true'>
                    <span style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className='velaris-continue-card__body'>
                {parentTitle && <span className='velaris-continue-card__parent'>{parentTitle}</span>}
                <Link className='velaris-continue-card__title' to={getDetailsUrl(item)}>{item.Name}</Link>
                <div className='velaris-continue-card__actions'>
                    <button
                        type='button'
                        className='velaris-continue-card__action'
                        onClick={onReset}
                        disabled={isBusy}
                        title='Aus Weiterschauen entfernen und Fortschritt zurücksetzen'
                    >
                        <span className='material-icons' aria-hidden='true'>restart_alt</span>
                        Zurücksetzen
                    </button>
                    <button
                        type='button'
                        className='velaris-continue-card__action'
                        onClick={onWatched}
                        disabled={isBusy}
                        title='Als gesehen markieren'
                    >
                        <span className='material-icons' aria-hidden='true'>done</span>
                        Gesehen
                    </button>
                </div>
            </div>
        </article>
    );
};

interface RecommendationRowProps {
    row: SmartHomeRow
}

const RecommendationRow: FC<RecommendationRowProps> = ({ row }) => (
    <section className='velaris-smart-row' aria-labelledby={`velaris-smart-row-${row.id}`}>
        <div className='velaris-smart-row__heading'>
            <div>
                <h2 id={`velaris-smart-row-${row.id}`} className='velaris-smart-row__title'>{row.title}</h2>
                <p className='velaris-smart-row__subtitle'>{row.subtitle}</p>
            </div>
        </div>
        <div className='velaris-smart-row__rail'>
            {row.items.map(item => <SmartHomeCard key={item.Id} item={item} />)}
        </div>
    </section>
);

interface SmartHomeSettingsProps {
    preferences: SmartHomePreferences
    onPreferenceAction: (rowId: SmartHomeRowId, action: string) => void
    onReset: () => void
}

const SmartHomeSettings: FC<SmartHomeSettingsProps> = ({
    preferences,
    onPreferenceAction,
    onReset
}) => {
    const onActionClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const rowId = event.currentTarget.dataset.rowId as SmartHomeRowId | undefined;
        const action = event.currentTarget.dataset.action;
        if (rowId && action) onPreferenceAction(rowId, action);
    }, [ onPreferenceAction ]);

    return (
        <div className='velaris-smart-settings'>
            <div className='velaris-smart-settings__header'>
                <div>
                    <strong>Smart Home anpassen</strong>
                    <span>Reihenfolge und sichtbare persönliche Bereiche.</span>
                </div>
                <button type='button' className='velaris-smart-settings__reset' onClick={onReset}>Standard</button>
            </div>

            <div className='velaris-smart-settings__rows'>
                {preferences.order.map((rowId, index) => {
                    const enabled = !preferences.disabled.includes(rowId);
                    return (
                        <div key={rowId} className='velaris-smart-settings__row'>
                            <span>{SMART_HOME_ROW_LABELS[rowId]}</span>
                            <div className='velaris-smart-settings__actions'>
                                <button
                                    type='button'
                                    data-row-id={rowId}
                                    data-action='up'
                                    onClick={onActionClick}
                                    disabled={index === 0}
                                    aria-label={`${SMART_HOME_ROW_LABELS[rowId]} nach oben`}
                                >
                                    <span className='material-icons' aria-hidden='true'>keyboard_arrow_up</span>
                                </button>
                                <button
                                    type='button'
                                    data-row-id={rowId}
                                    data-action='down'
                                    onClick={onActionClick}
                                    disabled={index === preferences.order.length - 1}
                                    aria-label={`${SMART_HOME_ROW_LABELS[rowId]} nach unten`}
                                >
                                    <span className='material-icons' aria-hidden='true'>keyboard_arrow_down</span>
                                </button>
                                <button
                                    type='button'
                                    data-row-id={rowId}
                                    data-action='toggle'
                                    onClick={onActionClick}
                                    aria-pressed={enabled}
                                >
                                    <span className='material-icons' aria-hidden='true'>{enabled ? 'visibility' : 'visibility_off'}</span>
                                    {enabled ? 'An' : 'Aus'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface VelarisSmartHomeForUserProps {
    serverId: string
    userId: string
}

const VelarisSmartHomeForUser: FC<VelarisSmartHomeForUserProps> = ({ serverId, userId }) => {
    const [ preferences, setPreferences ] = useState<SmartHomePreferences>(() => (
        readVelarisSmartHomePreferences(getVelarisLocalStorage(), serverId, userId)
    ));
    const [ settingsOpen, setSettingsOpen ] = useState(false);
    const {
        unplayedItems,
        recentlyWatchedItems,
        continueItems,
        isPending,
        isError,
        continueMutation
    } = useVelarisSmartHome();

    useEffect(() => {
        saveVelarisSmartHomePreferences(getVelarisLocalStorage(), serverId, userId, preferences);
    }, [ preferences, serverId, userId ]);

    const recommendationRows = useMemo(
        () => buildSmartHomeRows(unplayedItems, recentlyWatchedItems, preferences),
        [ preferences, recentlyWatchedItems, unplayedItems ]
    );
    const recommendationRowsById = useMemo(
        () => new Map(recommendationRows.map(row => [ row.id, row ])),
        [ recommendationRows ]
    );

    const onToggleSettings = useCallback(() => {
        setSettingsOpen(open => !open);
    }, []);

    const onResetPreferences = useCallback(() => {
        setPreferences(sanitizeSmartHomePreferences(DEFAULT_SMART_HOME_PREFERENCES));
    }, []);

    const onPreferenceAction = useCallback((rowId: SmartHomeRowId, action: string) => {
        setPreferences(current => {
            if (action === 'toggle') return toggleSmartHomeRow(current, rowId);
            if (action === 'up') return moveSmartHomeRow(current, rowId, -1);
            if (action === 'down') return moveSmartHomeRow(current, rowId, 1);
            return current;
        });
    }, []);

    const onContinueAction = useCallback((itemId: string, action: SmartHomeContinueAction) => {
        continueMutation.mutate({ itemId, action });
    }, [ continueMutation ]);

    const hasVisibleContent = preferences.order.some(rowId => {
        if (preferences.disabled.includes(rowId)) return false;
        if (rowId === 'continue') return continueItems.length > 0;
        return recommendationRowsById.has(rowId);
    });

    if (isPending) {
        return (
            <section className='velaris-smart-home velaris-smart-home--loading' aria-hidden='true'>
                <div className='velaris-smart-home__skeleton' />
            </section>
        );
    }

    if (isError && !hasVisibleContent) return null;

    return (
        <div className='velaris-smart-home'>
            <div className='velaris-smart-home__toolbar'>
                <div>
                    <span className='velaris-smart-home__eyebrow'>DEIN VELARIS</span>
                    <h2>Für dich</h2>
                </div>
                <button
                    type='button'
                    className='velaris-smart-home__settings-button'
                    onClick={onToggleSettings}
                    aria-expanded={settingsOpen}
                >
                    <span className='material-icons' aria-hidden='true'>tune</span>
                    Anpassen
                </button>
            </div>

            {settingsOpen && (
                <SmartHomeSettings
                    preferences={preferences}
                    onPreferenceAction={onPreferenceAction}
                    onReset={onResetPreferences}
                />
            )}

            {!hasVisibleContent && (
                <div className='velaris-smart-home__empty'>
                    <span className='material-icons' aria-hidden='true'>auto_awesome</span>
                    <div>
                        <strong>Dein Smart Home lernt noch.</strong>
                        <span>Mit angesehenen und begonnenen Titeln werden hier persönliche Reihen aufgebaut.</span>
                    </div>
                </div>
            )}

            {preferences.order.map(rowId => {
                if (preferences.disabled.includes(rowId)) return null;

                if (rowId === 'continue') {
                    if (continueItems.length === 0) return null;
                    return (
                        <section key={rowId} className='velaris-smart-row' aria-labelledby='velaris-smart-row-continue'>
                            <div className='velaris-smart-row__heading'>
                                <div>
                                    <h2 id='velaris-smart-row-continue' className='velaris-smart-row__title'>Weiterschauen</h2>
                                    <p className='velaris-smart-row__subtitle'>Genau dort weitermachen, wo du aufgehört hast.</p>
                                </div>
                            </div>
                            <div className='velaris-smart-row__rail velaris-smart-row__rail--continue'>
                                {continueItems.map(item => (
                                    <ContinueCard
                                        key={item.Id}
                                        item={item}
                                        isBusy={continueMutation.isPending}
                                        onAction={onContinueAction}
                                    />
                                ))}
                            </div>
                        </section>
                    );
                }

                const row = recommendationRowsById.get(rowId);
                return row ? <RecommendationRow key={row.id} row={row} /> : null;
            })}
        </div>
    );
};

const VelarisSmartHome: FC = () => {
    const { user, __legacyApiClient__ } = useApi();
    const serverId = __legacyApiClient__?.serverId();
    const userId = user?.Id;

    return userId && serverId ? (
        <VelarisSmartHomeForUser
            key={`${serverId}:${userId}`}
            serverId={serverId}
            userId={userId}
        />
    ) : null;
};

export default VelarisSmartHome;
