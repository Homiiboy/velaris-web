import React, {
    type FC,
    type FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useState
} from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { VELARIS_FRANCHISE_CATALOG } from 'apps/modern/features/franchises/catalog';
import type { ResolvedFranchiseHub } from 'apps/modern/features/franchises/franchiseEngine';
import {
    addFranchiseStudioGroup,
    addFranchiseStudioWatchItem,
    assignFranchiseStudioItem,
    clearFranchiseStudioItemOverride,
    createFranchiseStudioHub,
    createFranchiseStudioWatchOrder,
    excludeFranchiseStudioItem,
    moveFranchiseStudioGroup,
    removeFranchiseStudioGroup,
    removeFranchiseStudioHub,
    removeFranchiseStudioWatchItem,
    removeFranchiseStudioWatchOrder,
    reorderFranchiseStudioWatchItem,
    type FranchiseStudioConfig,
    type FranchiseStudioGroup,
    type FranchiseStudioWatchOrder
} from 'apps/modern/features/franchises/franchiseStudio';
import { getVelarisFranchiseArtworkUrl } from 'apps/modern/features/franchises/franchiseArtwork';
import { useFranchiseStudioConfig } from 'apps/modern/features/franchises/useFranchiseStudioConfig';
import { useVelarisFranchiseHubs } from 'apps/modern/features/franchises/useVelarisFranchiseHubs';
import Loading from 'components/loading/LoadingComponent';
import Page from 'components/Page';
import { useApi } from 'hooks/useApi';
import type { ItemDto } from 'types/base/models/item-dto';

interface StudioHubOption {
    id: string
    name: string
    description: string
    isCustom: boolean
}

interface StudioItemCardProps {
    item: ItemDto
    groupId: string
    isCustomHub: boolean
    isExplicit: boolean
    onAssign: (itemId: string, groupId: string, beforeItemId?: string) => void
    onClear: (itemId: string) => void
    onExclude: (itemId: string) => void
}

const StudioItemCard: FC<StudioItemCardProps> = ({
    item,
    groupId,
    isCustomHub,
    isExplicit,
    onAssign,
    onClear,
    onExclude
}) => {
    const { __legacyApiClient__ } = useApi();
    const artworkUrl = getVelarisFranchiseArtworkUrl(__legacyApiClient__, item, 520);

    const onDragStart = useCallback((event: React.DragEvent<HTMLElement>) => {
        if (!item.Id) return;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', item.Id);
    }, [ item.Id ]);

    const onDrop = useCallback((event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        const itemId = event.dataTransfer.getData('text/plain');
        if (itemId && item.Id && itemId !== item.Id) onAssign(itemId, groupId, item.Id);
    }, [ groupId, item.Id, onAssign ]);

    const onDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onClearClick = useCallback(() => {
        if (item.Id) onClear(item.Id);
    }, [ item.Id, onClear ]);

    const onExcludeClick = useCallback(() => {
        if (item.Id) onExclude(item.Id);
    }, [ item.Id, onExclude ]);

    return (
        <article
            className='velaris-studio-item'
            draggable={Boolean(item.Id)}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <div
                className='velaris-studio-item__artwork'
                style={artworkUrl ? { backgroundImage: `url("${artworkUrl}")` } : undefined}
            >
                {!artworkUrl && <span className='material-icons' aria-hidden='true'>movie</span>}
            </div>
            <div className='velaris-studio-item__body'>
                <strong>{item.Name}</strong>
                <span>{[ item.ProductionYear, item.Type ].filter(Boolean).join(' · ')}</span>
            </div>
            <div className='velaris-studio-item__actions'>
                {(isExplicit || isCustomHub) && (
                    <button type='button' onClick={onClearClick}>
                        {isCustomHub ? 'Entfernen' : 'Automatik'}
                    </button>
                )}
                {!isCustomHub && (
                    <button type='button' onClick={onExcludeClick}>Ausschließen</button>
                )}
            </div>
        </article>
    );
};

interface StudioGroupColumnProps {
    group: FranchiseStudioGroup
    items: ItemDto[]
    isCustomGroup: boolean
    isCustomHub: boolean
    isFirst: boolean
    isLast: boolean
    assignments: Record<string, string>
    onAssign: (itemId: string, groupId: string, beforeItemId?: string) => void
    onClear: (itemId: string) => void
    onExclude: (itemId: string) => void
    onMoveGroup: (groupId: string, direction: -1 | 1) => void
    onRemoveGroup: (groupId: string) => void
}

const StudioGroupColumn: FC<StudioGroupColumnProps> = ({
    group,
    items,
    isCustomGroup,
    isCustomHub,
    isFirst,
    isLast,
    assignments,
    onAssign,
    onClear,
    onExclude,
    onMoveGroup,
    onRemoveGroup
}) => {
    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const itemId = event.dataTransfer.getData('text/plain');
        if (itemId) onAssign(itemId, group.id);
    }, [ group.id, onAssign ]);

    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onMoveUp = useCallback(() => onMoveGroup(group.id, -1), [ group.id, onMoveGroup ]);
    const onMoveDown = useCallback(() => onMoveGroup(group.id, 1), [ group.id, onMoveGroup ]);
    const onRemove = useCallback(() => onRemoveGroup(group.id), [ group.id, onRemoveGroup ]);

    return (
        <section className='velaris-studio-group'>
            <header className='velaris-studio-group__header'>
                <div>
                    <strong>{group.name}</strong>
                    <span>{items.length} Titel</span>
                </div>
                <div className='velaris-studio-group__controls'>
                    <button type='button' onClick={onMoveUp} disabled={isFirst} aria-label={`${group.name} nach links`}>
                        <span className='material-icons' aria-hidden='true'>arrow_back</span>
                    </button>
                    <button type='button' onClick={onMoveDown} disabled={isLast} aria-label={`${group.name} nach rechts`}>
                        <span className='material-icons' aria-hidden='true'>arrow_forward</span>
                    </button>
                    {isCustomGroup && (
                        <button type='button' onClick={onRemove} aria-label={`${group.name} löschen`}>
                            <span className='material-icons' aria-hidden='true'>delete</span>
                        </button>
                    )}
                </div>
            </header>
            <div
                className={`velaris-studio-group__dropzone${items.length === 0 ? ' velaris-studio-group__dropzone--empty' : ''}`}
                onDragOver={onDragOver}
                onDrop={onDrop}
            >
                {items.length === 0 && <span>Titel hierher ziehen</span>}
                {items.map(item => (
                    <StudioItemCard
                        key={item.Id}
                        item={item}
                        groupId={group.id}
                        isCustomHub={isCustomHub}
                        isExplicit={Boolean(item.Id && assignments[item.Id])}
                        onAssign={onAssign}
                        onClear={onClear}
                        onExclude={onExclude}
                    />
                ))}
            </div>
        </section>
    );
};

interface LibraryItemProps {
    item: ItemDto
    targetGroupId: string
    isExcluded: boolean
    onAssign: (itemId: string, groupId: string) => void
    onClear: (itemId: string) => void
}

const LibraryItem: FC<LibraryItemProps> = ({
    item,
    targetGroupId,
    isExcluded,
    onAssign,
    onClear
}) => {
    const onDragStart = useCallback((event: React.DragEvent<HTMLElement>) => {
        if (!item.Id) return;
        event.dataTransfer.effectAllowed = 'copyMove';
        event.dataTransfer.setData('text/plain', item.Id);
    }, [ item.Id ]);

    const onAdd = useCallback(() => {
        if (item.Id && targetGroupId) onAssign(item.Id, targetGroupId);
    }, [ item.Id, onAssign, targetGroupId ]);

    const onRestore = useCallback(() => {
        if (item.Id) onClear(item.Id);
    }, [ item.Id, onClear ]);

    return (
        <article className={`velaris-studio-library-item${isExcluded ? ' velaris-studio-library-item--excluded' : ''}`} draggable={Boolean(item.Id)} onDragStart={onDragStart}>
            <div>
                <strong>{item.Name}</strong>
                <span>{[ item.ProductionYear, item.Type ].filter(Boolean).join(' · ')}</span>
            </div>
            {isExcluded ? (
                <button type='button' onClick={onRestore}>Wieder zulassen</button>
            ) : (
                <button type='button' onClick={onAdd} disabled={!targetGroupId}>Hinzufügen</button>
            )}
        </article>
    );
};

interface WatchOrderEditorProps {
    order: FranchiseStudioWatchOrder
    hubItems: ItemDto[]
    onReorder: (orderId: string, itemId: string, beforeItemId?: string) => void
    onRemoveItem: (orderId: string, itemId: string) => void
    onAddItem: (orderId: string, itemId: string) => void
    onDelete: (orderId: string) => void
}

const WatchOrderEditor: FC<WatchOrderEditorProps> = ({
    order,
    hubItems,
    onReorder,
    onRemoveItem,
    onAddItem,
    onDelete
}) => {
    const itemById = useMemo(() => new Map(
        hubItems.filter(item => item.Id).map(item => [ item.Id as string, item ])
    ), [ hubItems ]);
    const items = order.itemIds.map(itemId => itemById.get(itemId)).filter((item): item is ItemDto => Boolean(item));
    const available = hubItems.filter(item => item.Id && !order.itemIds.includes(item.Id));
    const [ addItemId, setAddItemId ] = useState('');

    useEffect(() => {
        if (addItemId && !available.some(item => item.Id === addItemId)) setAddItemId('');
    }, [ addItemId, available ]);

    const onDeleteClick = useCallback(() => onDelete(order.id), [ onDelete, order.id ]);
    const onAddSelectChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        setAddItemId(event.target.value);
    }, []);
    const onAddClick = useCallback(() => {
        if (addItemId) {
            onAddItem(order.id, addItemId);
            setAddItemId('');
        }
    }, [ addItemId, onAddItem, order.id ]);

    return (
        <article className='velaris-studio-watch-editor'>
            <header>
                <div>
                    <strong>{order.name}</strong>
                    <span>{items.length} Titel</span>
                </div>
                <button type='button' onClick={onDeleteClick}>Watch Order löschen</button>
            </header>

            <div className='velaris-studio-watch-editor__items'>
                {items.map(item => (
                    <WatchOrderRow
                        key={item.Id}
                        item={item}
                        orderId={order.id}
                        onReorder={onReorder}
                        onRemove={onRemoveItem}
                    />
                ))}
                {items.length === 0 && <span className='velaris-studio-watch-editor__empty'>Noch keine Titel.</span>}
            </div>

            <div className='velaris-studio-watch-editor__add'>
                <select value={addItemId} onChange={onAddSelectChange} aria-label={`Titel zu ${order.name} hinzufügen`}>
                    <option value=''>Titel auswählen …</option>
                    {available.map(item => <option key={item.Id} value={item.Id}>{item.Name}</option>)}
                </select>
                <button type='button' onClick={onAddClick} disabled={!addItemId}>Hinzufügen</button>
            </div>
        </article>
    );
};

interface WatchOrderRowProps {
    item: ItemDto
    orderId: string
    onReorder: (orderId: string, itemId: string, beforeItemId?: string) => void
    onRemove: (orderId: string, itemId: string) => void
}

const WatchOrderRow: FC<WatchOrderRowProps> = ({ item, orderId, onReorder, onRemove }) => {
    const onDragStart = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        if (!item.Id) return;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', item.Id);
    }, [ item.Id ]);
    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);
    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const draggedId = event.dataTransfer.getData('text/plain');
        if (draggedId && item.Id && draggedId !== item.Id) onReorder(orderId, draggedId, item.Id);
    }, [ item.Id, onReorder, orderId ]);
    const onRemoveClick = useCallback(() => {
        if (item.Id) onRemove(orderId, item.Id);
    }, [ item.Id, onRemove, orderId ]);

    return (
        <div className='velaris-studio-watch-row' draggable={Boolean(item.Id)} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop}>
            <span className='material-icons' aria-hidden='true'>drag_indicator</span>
            <strong>{item.Name}</strong>
            <span>{item.ProductionYear || ''}</span>
            <button type='button' onClick={onRemoveClick} aria-label={`${item.Name} aus Watch Order entfernen`}>
                <span className='material-icons' aria-hidden='true'>close</span>
            </button>
        </div>
    );
};

const getEditorGroups = (
    hubId: string,
    config: FranchiseStudioConfig
): FranchiseStudioGroup[] => {
    const customHub = config.customHubs.find(hub => hub.id === hubId);
    if (customHub) {
        const order = customHub.groupOrder;
        return [ ...customHub.groups ].sort((a, b) => {
            const aIndex = order.indexOf(a.id);
            const bIndex = order.indexOf(b.id);
            if (aIndex < 0 && bIndex < 0) return 0;
            if (aIndex < 0) return 1;
            if (bIndex < 0) return -1;
            return aIndex - bIndex;
        });
    }

    const definition = VELARIS_FRANCHISE_CATALOG.find(hub => hub.id === hubId);
    const override = config.overrides[hubId];
    const groups = [
        ...(definition?.groups.map(group => ({ id: group.id, name: group.name })) || []),
        ...(override?.groups || [])
    ];
    const unique = groups.filter((group, index) => groups.findIndex(candidate => candidate.id === group.id) === index);
    const order = override?.groupOrder || [];

    return [ ...unique ].sort((a, b) => {
        const aIndex = order.indexOf(a.id);
        const bIndex = order.indexOf(b.id);
        if (aIndex < 0 && bIndex < 0) return 0;
        if (aIndex < 0) return 1;
        if (bIndex < 0) return -1;
        return aIndex - bIndex;
    });
};

const FranchiseStudio: FC = () => {
    const [ searchParams, setSearchParams ] = useSearchParams();
    const { config, setConfig } = useFranchiseStudioConfig();
    const { hubs, libraryItems, isPending, isError } = useVelarisFranchiseHubs();
    const [ newHubName, setNewHubName ] = useState('');
    const [ newGroupName, setNewGroupName ] = useState('');
    const [ newWatchOrderName, setNewWatchOrderName ] = useState('');
    const [ librarySearch, setLibrarySearch ] = useState('');
    const selectedHubId = searchParams.get('hub') || VELARIS_FRANCHISE_CATALOG[0]?.id || config.customHubs[0]?.id;

    const hubOptions = useMemo<StudioHubOption[]>(() => [
        ...VELARIS_FRANCHISE_CATALOG.map(hub => ({
            id: hub.id,
            name: hub.name,
            description: hub.description,
            isCustom: false
        })),
        ...config.customHubs.map(hub => ({
            id: hub.id,
            name: hub.name,
            description: hub.description,
            isCustom: true
        }))
    ], [ config.customHubs ]);
    const selectedOption = hubOptions.find(option => option.id === selectedHubId) || hubOptions[0];
    const effectiveHub = hubs.find(hub => hub.id === selectedOption?.id);
    const isCustomHub = Boolean(selectedOption?.isCustom);
    const editorGroups = useMemo(
        () => selectedOption ? getEditorGroups(selectedOption.id, config) : [],
        [ config, selectedOption ]
    );
    const currentState = isCustomHub ?
        config.customHubs.find(hub => hub.id === selectedOption?.id) :
        (selectedOption ? config.overrides[selectedOption.id] : undefined);
    const assignments = currentState?.assignments || {};
    const excludedItemIds = currentState?.excludedItemIds || [];
    const customGroupIds = new Set(currentState?.groups.map(group => group.id) || []);
    const [ targetGroupId, setTargetGroupId ] = useState(editorGroups[0]?.id || '');

    useEffect(() => {
        if (!editorGroups.some(group => group.id === targetGroupId)) setTargetGroupId(editorGroups[0]?.id || '');
    }, [ editorGroups, targetGroupId ]);

    useEffect(() => {
        if (selectedOption && selectedHubId !== selectedOption.id) {
            setSearchParams({ hub: selectedOption.id }, { replace: true });
        }
    }, [ selectedHubId, selectedOption, setSearchParams ]);

    const effectiveItemsByGroup = useMemo(() => new Map(
        (effectiveHub?.groups || []).map(group => [ group.id, group.items ])
    ), [ effectiveHub?.groups ]);

    const filteredLibraryItems = useMemo(() => {
        const normalizedSearch = librarySearch.trim().toLocaleLowerCase();
        if (!normalizedSearch) return libraryItems.slice(0, 80);
        return libraryItems.filter(item => (
            item.Name?.toLocaleLowerCase().includes(normalizedSearch)
            || item.OriginalTitle?.toLocaleLowerCase().includes(normalizedSearch)
        )).slice(0, 80);
    }, [ libraryItems, librarySearch ]);

    const onSelectHub = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const hubId = event.currentTarget.dataset.hubId;
        if (hubId) setSearchParams({ hub: hubId });
    }, [ setSearchParams ]);

    const onNewHubNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => setNewHubName(event.target.value), []);
    const onCreateHub = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = createFranchiseStudioHub(config, newHubName, VELARIS_FRANCHISE_CATALOG.map(hub => hub.id));
        setConfig(result.config);
        setNewHubName('');
        if (result.hubId) setSearchParams({ hub: result.hubId });
    }, [ config, newHubName, setConfig, setSearchParams ]);

    const onNewGroupNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => setNewGroupName(event.target.value), []);
    const onCreateGroup = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedOption) return;
        setConfig(current => addFranchiseStudioGroup(current, selectedOption.id, newGroupName, editorGroups.map(group => group.id)));
        setNewGroupName('');
    }, [ editorGroups, newGroupName, selectedOption, setConfig ]);

    const onAssign = useCallback((itemId: string, groupId: string, beforeItemId?: string) => {
        if (!selectedOption) return;
        setConfig(current => assignFranchiseStudioItem(current, selectedOption.id, itemId, groupId, beforeItemId));
    }, [ selectedOption, setConfig ]);

    const onClear = useCallback((itemId: string) => {
        if (!selectedOption) return;
        setConfig(current => clearFranchiseStudioItemOverride(current, selectedOption.id, itemId));
    }, [ selectedOption, setConfig ]);

    const onExclude = useCallback((itemId: string) => {
        if (!selectedOption) return;
        setConfig(current => excludeFranchiseStudioItem(current, selectedOption.id, itemId));
    }, [ selectedOption, setConfig ]);

    const onMoveGroup = useCallback((groupId: string, direction: -1 | 1) => {
        if (!selectedOption) return;
        setConfig(current => moveFranchiseStudioGroup(current, selectedOption.id, groupId, direction, editorGroups.map(group => group.id)));
    }, [ editorGroups, selectedOption, setConfig ]);

    const onRemoveGroup = useCallback((groupId: string) => {
        if (!selectedOption) return;
        setConfig(current => removeFranchiseStudioGroup(current, selectedOption.id, groupId));
    }, [ selectedOption, setConfig ]);

    const onDeleteCustomHub = useCallback(() => {
        if (!selectedOption?.isCustom) return;
        const nextConfig = removeFranchiseStudioHub(config, selectedOption.id);
        setConfig(nextConfig);
        const fallback = VELARIS_FRANCHISE_CATALOG[0]?.id || nextConfig.customHubs[0]?.id;
        if (fallback) setSearchParams({ hub: fallback });
    }, [ config, selectedOption, setConfig, setSearchParams ]);

    const onTargetGroupChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => setTargetGroupId(event.target.value), []);
    const onLibrarySearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => setLibrarySearch(event.target.value), []);

    const onWatchOrderNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => setNewWatchOrderName(event.target.value), []);
    const onCreateWatchOrder = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedOption || !newWatchOrderName.trim()) return;
        setConfig(current => createFranchiseStudioWatchOrder(
            current,
            selectedOption.id,
            newWatchOrderName,
            effectiveHub?.items.map(item => item.Id).filter((id): id is string => Boolean(id)) || []
        ));
        setNewWatchOrderName('');
    }, [ effectiveHub?.items, newWatchOrderName, selectedOption, setConfig ]);

    const onReorderWatchItem = useCallback((orderId: string, itemId: string, beforeItemId?: string) => {
        setConfig(current => reorderFranchiseStudioWatchItem(current, orderId, itemId, beforeItemId));
    }, [ setConfig ]);
    const onRemoveWatchItem = useCallback((orderId: string, itemId: string) => {
        setConfig(current => removeFranchiseStudioWatchItem(current, orderId, itemId));
    }, [ setConfig ]);
    const onAddWatchItem = useCallback((orderId: string, itemId: string) => {
        setConfig(current => addFranchiseStudioWatchItem(current, orderId, itemId));
    }, [ setConfig ]);
    const onDeleteWatchOrder = useCallback((orderId: string) => {
        setConfig(current => removeFranchiseStudioWatchOrder(current, orderId));
    }, [ setConfig ]);

    if (isPending) return <Loading />;

    if (isError) {
        return (
            <Page id='velarisFranchiseStudioError' className='mainAnimatedPage velaris-franchise-studio-page'>
                <div className='velaris-franchise-empty'>
                    <span className='velaris-franchise-empty__eyebrow'>FRANCHISE STUDIO</span>
                    <h1 className='velaris-franchise-empty__title'>Mediathek konnte nicht geladen werden.</h1>
                    <Link to='/home' className='velaris-franchise-empty__link'>Zurück zu Home</Link>
                </div>
            </Page>
        );
    }

    if (!selectedOption) return null;

    const customOrders = config.watchOrders.filter(order => order.hubId === selectedOption.id);

    return (
        <Page id='velarisFranchiseStudioPage' className='mainAnimatedPage velaris-franchise-studio-page'>
            <header className='velaris-studio-hero'>
                <div>
                    <Link to='/home' className='velaris-studio-hero__back'>← Home</Link>
                    <span className='velaris-studio-hero__eyebrow'>VELARIS FRANCHISE STUDIO · V0.3.0</span>
                    <h1>Universen selbst kuratieren.</h1>
                    <p>Automatische Treffer korrigieren, eigene Bereiche bauen und Watch Orders ohne Metadaten-Tags pflegen.</p>
                </div>
            </header>

            <div className='velaris-studio-layout'>
                <aside className='velaris-studio-sidebar'>
                    <div className='velaris-studio-sidebar__heading'>
                        <strong>Universen</strong>
                        <span>Automatisch + eigene</span>
                    </div>
                    <div className='velaris-studio-sidebar__list'>
                        {hubOptions.map(option => (
                            <button
                                key={option.id}
                                type='button'
                                className={option.id === selectedOption.id ? 'velaris-studio-sidebar__item velaris-studio-sidebar__item--active' : 'velaris-studio-sidebar__item'}
                                data-hub-id={option.id}
                                onClick={onSelectHub}
                            >
                                <span>{option.name}</span>
                                <small>{option.isCustom ? 'Custom' : 'Auto'}</small>
                            </button>
                        ))}
                    </div>
                    <form className='velaris-studio-sidebar__create' onSubmit={onCreateHub}>
                        <input value={newHubName} onChange={onNewHubNameChange} placeholder='Eigenes Universum …' aria-label='Name für eigenes Universum' />
                        <button type='submit' disabled={!newHubName.trim()}>Erstellen</button>
                    </form>
                </aside>

                <main className='velaris-studio-main'>
                    <section className='velaris-studio-selected'>
                        <div>
                            <span>{isCustomHub ? 'CUSTOM UNIVERSE' : 'AUTOMATISCHER HUB'}</span>
                            <h2>{selectedOption.name}</h2>
                            <p>{selectedOption.description}</p>
                        </div>
                        <div className='velaris-studio-selected__actions'>
                            {effectiveHub && <Link to={`/franchise/${selectedOption.id}`}>Hub ansehen</Link>}
                            {isCustomHub && <button type='button' onClick={onDeleteCustomHub}>Universum löschen</button>}
                        </div>
                    </section>

                    <section className='velaris-studio-groups-section'>
                        <div className='velaris-studio-section-heading'>
                            <div>
                                <span>STRUKTUR</span>
                                <h2>Bereiche, Phasen & Epochen</h2>
                                <p>Titel per Drag & Drop verschieben. Bei automatischen Hubs überschreibt eine manuelle Zuordnung nur diesen Hub.</p>
                            </div>
                            <form onSubmit={onCreateGroup}>
                                <input value={newGroupName} onChange={onNewGroupNameChange} placeholder='Neuer Bereich …' aria-label='Name für neuen Franchise-Bereich' />
                                <button type='submit' disabled={!newGroupName.trim()}>Bereich erstellen</button>
                            </form>
                        </div>

                        <div className='velaris-studio-groups'>
                            {editorGroups.map((group, index) => (
                                <StudioGroupColumn
                                    key={group.id}
                                    group={group}
                                    items={effectiveItemsByGroup.get(group.id) || []}
                                    isCustomGroup={isCustomHub || customGroupIds.has(group.id)}
                                    isCustomHub={isCustomHub}
                                    isFirst={index === 0}
                                    isLast={index === editorGroups.length - 1}
                                    assignments={assignments}
                                    onAssign={onAssign}
                                    onClear={onClear}
                                    onExclude={onExclude}
                                    onMoveGroup={onMoveGroup}
                                    onRemoveGroup={onRemoveGroup}
                                />
                            ))}
                            {editorGroups.length === 0 && <div className='velaris-studio-groups__empty'>Erstelle zuerst einen Bereich.</div>}
                        </div>
                    </section>

                    <section className='velaris-studio-library'>
                        <div className='velaris-studio-section-heading'>
                            <div>
                                <span>MEDIATHEK</span>
                                <h2>Titel zuweisen</h2>
                                <p>Manuelles Include funktioniert auch dann, wenn die automatische Erkennung einen Titel nicht kennt.</p>
                            </div>
                            <div className='velaris-studio-library__filters'>
                                <input value={librarySearch} onChange={onLibrarySearchChange} placeholder='Titel suchen …' aria-label='Mediathek durchsuchen' />
                                <select value={targetGroupId} onChange={onTargetGroupChange} aria-label='Zielbereich für Titel'>
                                    {editorGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className='velaris-studio-library__grid'>
                            {filteredLibraryItems.map(item => (
                                <LibraryItem
                                    key={item.Id}
                                    item={item}
                                    targetGroupId={targetGroupId}
                                    isExcluded={Boolean(item.Id && excludedItemIds.includes(item.Id))}
                                    onAssign={onAssign}
                                    onClear={onClear}
                                />
                            ))}
                        </div>
                    </section>

                    <section className='velaris-studio-watch-orders'>
                        <div className='velaris-studio-section-heading'>
                            <div>
                                <span>WATCH ORDERS</span>
                                <h2>Eigene Reihenfolgen</h2>
                                <p>Neue Watch Orders starten mit der aktuellen Hub-Reihenfolge und lassen sich anschließend per Drag & Drop anpassen.</p>
                            </div>
                            <form onSubmit={onCreateWatchOrder}>
                                <input value={newWatchOrderName} onChange={onWatchOrderNameChange} placeholder='z. B. Familien-Marathon …' aria-label='Name für neue Watch Order' />
                                <button type='submit' disabled={!newWatchOrderName.trim() || !effectiveHub?.items.length}>Watch Order erstellen</button>
                            </form>
                        </div>

                        <div className='velaris-studio-watch-orders__list'>
                            {customOrders.map(order => (
                                <WatchOrderEditor
                                    key={order.id}
                                    order={order}
                                    hubItems={effectiveHub?.items || []}
                                    onReorder={onReorderWatchItem}
                                    onRemoveItem={onRemoveWatchItem}
                                    onAddItem={onAddWatchItem}
                                    onDelete={onDeleteWatchOrder}
                                />
                            ))}
                            {customOrders.length === 0 && <div className='velaris-studio-watch-orders__empty'>Noch keine eigene Watch Order für dieses Universum.</div>}
                        </div>
                    </section>
                </main>
            </div>
        </Page>
    );
};

export default FranchiseStudio;
