import React, {
    type ChangeEvent,
    type FC,
    type FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useState
} from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
    buildDiscoverySmartLists,
    createDiscoveryList,
    DEFAULT_DISCOVERY_FILTERS,
    filterDiscoveryItems,
    getDiscoveryRuntimeMinutes,
    pickDiscoverySurprise,
    removeDiscoveryList,
    resolveDiscoveryListItems,
    toggleDiscoveryCustomListItem,
    toggleDiscoveryWatchlistItem,
    type DiscoveryFilters,
    type DiscoverySmartListId,
    type VelarisCustomList
} from 'apps/modern/features/discovery/discovery';
import { useVelarisDiscovery } from 'apps/modern/features/discovery/useVelarisDiscovery';
import { useVelarisDiscoveryStore } from 'apps/modern/features/discovery/useVelarisDiscoveryStore';
import { getVelarisSmartHomeArtworkUrl } from 'apps/modern/features/home/smartHomeArtwork';
import { toReactRoute } from 'apps/modern/utils/velarisRouting';
import Loading from 'components/loading/LoadingComponent';
import Page from 'components/Page';
import { appRouter } from 'components/router/appRouter';
import { useApi } from 'hooks/useApi';
import type { ItemDto } from 'types/base/models/item-dto';

const RESULT_BATCH_SIZE = 60;
const WATCHLIST_ID = 'watchlist';

const getDetailsUrl = (item: ItemDto) => toReactRoute(appRouter.getRouteUrl(item));

const formatRuntime = (item: ItemDto) => {
    const minutes = getDiscoveryRuntimeMinutes(item);
    if (minutes == null) return undefined;
    if (minutes < 60) return `${minutes} Min.`;

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return remaining ? `${hours} Std. ${remaining} Min.` : `${hours} Std.`;
};

interface DiscoveryCardProps {
    item: ItemDto
    watchlisted: boolean
    lists: VelarisCustomList[]
    onToggleWatchlist: (itemId: string) => void
    onToggleList: (listId: string, itemId: string) => void
}

const DiscoveryCard: FC<DiscoveryCardProps> = ({
    item,
    watchlisted,
    lists,
    onToggleWatchlist,
    onToggleList
}) => {
    const { __legacyApiClient__ } = useApi();
    const artworkUrl = getVelarisSmartHomeArtworkUrl(__legacyApiClient__, item, 720);
    const runtime = formatRuntime(item);
    const meta = [ item.ProductionYear, runtime, item.CommunityRating ? `★ ${item.CommunityRating.toFixed(1)}` : undefined ]
        .filter(Boolean)
        .join(' · ');

    const onWatchlistClick = useCallback(() => {
        if (item.Id) onToggleWatchlist(item.Id);
    }, [ item.Id, onToggleWatchlist ]);

    const onListClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const listId = event.currentTarget.dataset.listId;
        if (listId && item.Id) onToggleList(listId, item.Id);
    }, [ item.Id, onToggleList ]);

    return (
        <article className='velaris-discovery-card'>
            <Link className='velaris-discovery-card__link' to={getDetailsUrl(item)}>
                <div
                    className='velaris-discovery-card__artwork'
                    style={artworkUrl ? { backgroundImage: `url("${artworkUrl}")` } : undefined}
                >
                    {!artworkUrl && <span className='material-icons' aria-hidden='true'>movie</span>}
                    {item.UserData?.Played && (
                        <span className='velaris-discovery-card__watched material-icons' aria-label='Gesehen'>done</span>
                    )}
                </div>
                <strong>{item.Name}</strong>
                {meta && <span className='velaris-discovery-card__meta'>{meta}</span>}
            </Link>

            <div className='velaris-discovery-card__actions'>
                <button
                    type='button'
                    className={watchlisted ? 'velaris-discovery-card__watchlist velaris-discovery-card__watchlist--active' : 'velaris-discovery-card__watchlist'}
                    onClick={onWatchlistClick}
                    aria-pressed={watchlisted}
                >
                    <span className='material-icons' aria-hidden='true'>{watchlisted ? 'bookmark' : 'bookmark_border'}</span>
                    {watchlisted ? 'Watchlist' : 'Merken'}
                </button>

                {lists.length > 0 && (
                    <details className='velaris-discovery-card__lists'>
                        <summary aria-label='Zu Liste hinzufügen'>
                            <span className='material-icons' aria-hidden='true'>playlist_add</span>
                        </summary>
                        <div>
                            {lists.map(list => {
                                const selected = Boolean(item.Id && list.itemIds.includes(item.Id));
                                return (
                                    <button
                                        key={list.id}
                                        type='button'
                                        data-list-id={list.id}
                                        onClick={onListClick}
                                        aria-pressed={selected}
                                    >
                                        <span className='material-icons' aria-hidden='true'>{selected ? 'check' : 'add'}</span>
                                        {list.name}
                                    </button>
                                );
                            })}
                        </div>
                    </details>
                )}
            </div>
        </article>
    );
};

const Discovery = () => {
    const navigate = useNavigate();
    const {
        items,
        categoryByItemId,
        libraryCount,
        isPending,
        isError,
        isPartial
    } = useVelarisDiscovery();
    const { store, setStore } = useVelarisDiscoveryStore();
    const [ filters, setFilters ] = useState<DiscoveryFilters>(DEFAULT_DISCOVERY_FILTERS);
    const [ activeSmartList, setActiveSmartList ] = useState<DiscoverySmartListId | null>(null);
    const [ activeSavedList, setActiveSavedList ] = useState<string | null>(null);
    const [ resultLimit, setResultLimit ] = useState(RESULT_BATCH_SIZE);
    const [ newListName, setNewListName ] = useState('');

    const activeSavedListIds = useMemo(() => {
        if (activeSavedList === WATCHLIST_ID) return store.watchlist;
        return store.customLists.find(list => list.id === activeSavedList)?.itemIds;
    }, [ activeSavedList, store.customLists, store.watchlist ]);
    const sourceItems = useMemo(() => (
        activeSavedListIds
            ? resolveDiscoveryListItems(activeSavedListIds, items)
            : items
    ), [ activeSavedListIds, items ]);
    const genres = useMemo(() => [ ...new Set(items.flatMap(item => item.Genres || [])) ]
        .sort((a, b) => a.localeCompare(b)), [ items ]);
    const filteredItems = useMemo(
        () => filterDiscoveryItems(sourceItems, filters, categoryByItemId),
        [ categoryByItemId, filters, sourceItems ]
    );
    const smartLists = useMemo(() => buildDiscoverySmartLists(filteredItems), [ filteredItems ]);
    const visibleItems = useMemo(() => {
        if (!activeSmartList) return filteredItems;
        return smartLists.find(list => list.id === activeSmartList)?.items || [];
    }, [ activeSmartList, filteredItems, smartLists ]);
    const renderedItems = useMemo(
        () => visibleItems.slice(0, resultLimit),
        [ resultLimit, visibleItems ]
    );
    const watchlistItems = useMemo(
        () => resolveDiscoveryListItems(store.watchlist, items),
        [ items, store.watchlist ]
    );
    const activeSavedListName = useMemo(() => {
        if (activeSavedList === WATCHLIST_ID) return 'Watchlist';
        return store.customLists.find(list => list.id === activeSavedList)?.name;
    }, [ activeSavedList, store.customLists ]);
    const activeSmartListName = useMemo(
        () => smartLists.find(list => list.id === activeSmartList)?.name,
        [ activeSmartList, smartLists ]
    );

    useEffect(() => {
        setResultLimit(RESULT_BATCH_SIZE);
    }, [ activeSavedList, activeSmartList, filters ]);

    const clearSmartList = useCallback(() => setActiveSmartList(null), []);
    const onSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setFilters(current => ({ ...current, query: event.target.value }));
        clearSmartList();
    }, [ clearSmartList ]);
    const onContentKindChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        setFilters(current => ({ ...current, contentKind: event.target.value as DiscoveryFilters['contentKind'] }));
        clearSmartList();
    }, [ clearSmartList ]);
    const onGenreChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        setFilters(current => ({ ...current, genre: event.target.value }));
        clearSmartList();
    }, [ clearSmartList ]);
    const onWatchStateChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        setFilters(current => ({ ...current, watchState: event.target.value as DiscoveryFilters['watchState'] }));
        clearSmartList();
    }, [ clearSmartList ]);
    const onRuntimeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        setFilters(current => ({ ...current, runtime: event.target.value as DiscoveryFilters['runtime'] }));
        clearSmartList();
    }, [ clearSmartList ]);
    const onMinYearChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value ? Number(event.target.value) : undefined;
        setFilters(current => ({ ...current, minYear: value }));
        clearSmartList();
    }, [ clearSmartList ]);
    const onMaxYearChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value ? Number(event.target.value) : undefined;
        setFilters(current => ({ ...current, maxYear: value }));
        clearSmartList();
    }, [ clearSmartList ]);
    const onRatingChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value ? Number(event.target.value) : undefined;
        setFilters(current => ({ ...current, minRating: value }));
        clearSmartList();
    }, [ clearSmartList ]);
    const onResetFilters = useCallback(() => {
        setFilters(DEFAULT_DISCOVERY_FILTERS);
        clearSmartList();
    }, [ clearSmartList ]);
    const onSmartListClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const smartListId = event.currentTarget.dataset.smartListId as DiscoverySmartListId | undefined;
        if (!smartListId) return;
        setActiveSavedList(null);
        setActiveSmartList(current => current === smartListId ? null : smartListId);
    }, []);
    const onSavedListClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const listId = event.currentTarget.dataset.savedListId;
        if (!listId) return;
        setActiveSmartList(null);
        setActiveSavedList(current => current === listId ? null : listId);
    }, []);
    const onSurprise = useCallback(() => {
        const item = pickDiscoverySurprise(visibleItems);
        if (item) navigate(getDetailsUrl(item));
    }, [ navigate, visibleItems ]);
    const onLoadMore = useCallback(() => {
        setResultLimit(current => current + RESULT_BATCH_SIZE);
    }, []);
    const onToggleWatchlist = useCallback((itemId: string) => {
        setStore(current => toggleDiscoveryWatchlistItem(current, itemId));
    }, [ setStore ]);
    const onToggleList = useCallback((listId: string, itemId: string) => {
        setStore(current => toggleDiscoveryCustomListItem(current, listId, itemId));
    }, [ setStore ]);
    const onListNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setNewListName(event.target.value);
    }, []);
    const onCreateList = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const cleanName = newListName.trim();
        if (!cleanName) return;
        setStore(current => createDiscoveryList(current, cleanName));
        setNewListName('');
    }, [ newListName, setStore ]);
    const onDeleteList = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const listId = event.currentTarget.dataset.listId;
        if (!listId) return;

        setStore(current => removeDiscoveryList(current, listId));
        setActiveSavedList(current => current === listId ? null : current);
    }, [ setStore ]);

    if (isPending) {
        return (
            <Page id='velarisDiscoveryPage' className='mainAnimatedPage velaris-discovery-page' isBackButtonEnabled={false}>
                <Loading />
            </Page>
        );
    }

    const headingName = activeSavedListName || activeSmartListName || 'Ergebnisse';
    const headingEyebrow = activeSavedListName ? 'DEINE LISTE' : activeSmartListName ? 'SMART LIST' : 'DISCOVERY';
    const hasLoadWarning = isPartial || (isError && items.length > 0);

    return (
        <Page id='velarisDiscoveryPage' className='mainAnimatedPage velaris-discovery-page' isBackButtonEnabled={false}>
            <header className='velaris-discovery-hero'>
                <span>VELARIS DISCOVERY</span>
                <h1>Finde deinen nächsten Titel.</h1>
                <p>Durchsuche deine eigene Mediathek nach Genre, Jahr, Laufzeit, Bewertung und Wiedergabestatus — oder lass Velaris entscheiden.</p>
                <button type='button' onClick={onSurprise} disabled={visibleItems.length === 0}>
                    <span className='material-icons' aria-hidden='true'>casino</span>
                    Überrasch mich
                </button>
            </header>

            <section className='velaris-discovery-controls' aria-label='Discovery Filter'>
                <label className='velaris-discovery-controls__search'>
                    <span className='material-icons' aria-hidden='true'>search</span>
                    <input value={filters.query} onChange={onSearchChange} placeholder='Titel oder Genre suchen' />
                </label>
                <select value={filters.contentKind} onChange={onContentKindChange} aria-label='Inhaltstyp'>
                    <option value='all'>Filme & Serien</option>
                    <option value='movies'>Filme</option>
                    <option value='series'>Serien</option>
                    <option value='anime'>Anime</option>
                    <option value='anime-movies'>Anime Filme</option>
                </select>
                <select value={filters.genre} onChange={onGenreChange} aria-label='Genre'>
                    <option value=''>Alle Genres</option>
                    {genres.map(genre => <option key={genre} value={genre}>{genre}</option>)}
                </select>
                <select value={filters.watchState} onChange={onWatchStateChange} aria-label='Wiedergabestatus'>
                    <option value='all'>Alle Status</option>
                    <option value='unwatched'>Ungesehen</option>
                    <option value='watched'>Gesehen</option>
                </select>
                <select value={filters.runtime} onChange={onRuntimeChange} aria-label='Laufzeit'>
                    <option value='all'>Alle Laufzeiten</option>
                    <option value='short'>Bis 90 Min.</option>
                    <option value='standard'>91–140 Min.</option>
                    <option value='long'>Über 140 Min.</option>
                </select>
                <input type='number' min='1900' max='2200' value={filters.minYear || ''} onChange={onMinYearChange} placeholder='Von Jahr' aria-label='Jahr von' />
                <input type='number' min='1900' max='2200' value={filters.maxYear || ''} onChange={onMaxYearChange} placeholder='Bis Jahr' aria-label='Jahr bis' />
                <select value={filters.minRating || ''} onChange={onRatingChange} aria-label='Mindestbewertung'>
                    <option value=''>Alle Bewertungen</option>
                    <option value='6'>Ab 6.0</option>
                    <option value='7'>Ab 7.0</option>
                    <option value='8'>Ab 8.0</option>
                    <option value='9'>Ab 9.0</option>
                </select>
                <button type='button' onClick={onResetFilters}>Zurücksetzen</button>
            </section>

            {smartLists.length > 0 && (
                <section className='velaris-discovery-smart' aria-labelledby='velarisDiscoverySmartTitle'>
                    <div>
                        <span>SMART LISTS</span>
                        <h2 id='velarisDiscoverySmartTitle'>Automatisch für dich sortiert</h2>
                    </div>
                    <div className='velaris-discovery-smart__chips'>
                        {smartLists.map(list => (
                            <button
                                key={list.id}
                                type='button'
                                data-smart-list-id={list.id}
                                onClick={onSmartListClick}
                                aria-pressed={activeSmartList === list.id}
                            >
                                <strong>{list.name}</strong>
                                <span>{list.items.length} Titel · {list.description}</span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            <div className='velaris-discovery-layout'>
                <main className='velaris-discovery-results'>
                    <div className='velaris-discovery-section-heading'>
                        <div>
                            <span>{headingEyebrow}</span>
                            <h2>{headingName}</h2>
                        </div>
                        <strong>{visibleItems.length} Titel · {libraryCount} Mediatheken</strong>
                    </div>

                    {hasLoadWarning && (
                        <div className='velaris-discovery-empty'>Ein Teil der Mediathek konnte nicht vollständig geladen werden. Bereits geladene Titel bleiben verfügbar.</div>
                    )}
                    {isError && items.length === 0 && (
                        <div className='velaris-discovery-empty'>Die Mediathek konnte nicht geladen werden.</div>
                    )}
                    {!isError && visibleItems.length === 0 && (
                        <div className='velaris-discovery-empty'>Keine Titel passen zu diesen Filtern oder dieser Liste.</div>
                    )}

                    <div className='velaris-discovery-grid'>
                        {renderedItems.map(item => (
                            <DiscoveryCard
                                key={item.Id}
                                item={item}
                                watchlisted={Boolean(item.Id && store.watchlist.includes(item.Id))}
                                lists={store.customLists}
                                onToggleWatchlist={onToggleWatchlist}
                                onToggleList={onToggleList}
                            />
                        ))}
                    </div>

                    {renderedItems.length < visibleItems.length && (
                        <div className='velaris-discovery-list-create'>
                            <button type='button' onClick={onLoadMore}>
                                Mehr anzeigen ({visibleItems.length - renderedItems.length} verbleibend)
                            </button>
                        </div>
                    )}
                </main>

                <aside className='velaris-discovery-lists'>
                    <div className='velaris-discovery-lists__heading'>
                        <span>DEINE LISTEN</span>
                        <h2>Merkliste & Sammlungen</h2>
                    </div>

                    <section className='velaris-discovery-list-card'>
                        <header>
                            <div>
                                <strong>Watchlist</strong>
                                <span>{watchlistItems.length} verfügbare Titel</span>
                            </div>
                            <button
                                type='button'
                                data-saved-list-id={WATCHLIST_ID}
                                onClick={onSavedListClick}
                                aria-pressed={activeSavedList === WATCHLIST_ID}
                            >
                                <span className='material-icons' aria-hidden='true'>bookmark</span>
                            </button>
                        </header>
                        <div className='velaris-discovery-list-card__items'>
                            {watchlistItems.slice(0, 8).map(item => (
                                <Link key={item.Id} to={getDetailsUrl(item)}>{item.Name}</Link>
                            ))}
                            {watchlistItems.length === 0 && <span>Noch keine gemerkten Titel.</span>}
                        </div>
                    </section>

                    {store.customLists.map(list => {
                        const listItems = resolveDiscoveryListItems(list.itemIds, items);
                        return (
                            <section key={list.id} className='velaris-discovery-list-card'>
                                <header>
                                    <div>
                                        <strong>{list.name}</strong>
                                        <span>{listItems.length} verfügbare Titel</span>
                                    </div>
                                    <button
                                        type='button'
                                        data-saved-list-id={list.id}
                                        onClick={onSavedListClick}
                                        aria-pressed={activeSavedList === list.id}
                                        aria-label={`${list.name} anzeigen`}
                                    >
                                        <span className='material-icons' aria-hidden='true'>visibility</span>
                                    </button>
                                    <button type='button' data-list-id={list.id} onClick={onDeleteList} aria-label={`${list.name} löschen`}>
                                        <span className='material-icons' aria-hidden='true'>delete</span>
                                    </button>
                                </header>
                                <div className='velaris-discovery-list-card__items'>
                                    {listItems.slice(0, 8).map(item => (
                                        <Link key={item.Id} to={getDetailsUrl(item)}>{item.Name}</Link>
                                    ))}
                                    {listItems.length === 0 && <span>Diese Liste ist noch leer.</span>}
                                </div>
                            </section>
                        );
                    })}

                    <form className='velaris-discovery-list-create' onSubmit={onCreateList}>
                        <label htmlFor='velarisDiscoveryListName'>Neue Liste</label>
                        <input
                            id='velarisDiscoveryListName'
                            value={newListName}
                            onChange={onListNameChange}
                            placeholder='z. B. Halloween'
                            maxLength={48}
                        />
                        <button type='submit' disabled={!newListName.trim()}>Liste erstellen</button>
                    </form>
                </aside>
            </div>
        </Page>
    );
};

export default Discovery;
