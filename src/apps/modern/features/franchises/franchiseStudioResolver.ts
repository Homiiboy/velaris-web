import type { ItemDto } from 'types/base/models/item-dto';

import { VELARIS_FRANCHISE_CATALOG } from './catalog';
import type {
    ResolvedFranchiseGroup,
    ResolvedFranchiseHub
} from './franchiseEngine';
import type {
    FranchiseStudioConfig,
    FranchiseStudioCustomHub,
    FranchiseStudioHubEditorState
} from './franchiseStudio';

const getItemKey = (item: ItemDto, index = 0) => (
    item.Id || `${item.Type || 'Item'}:${item.Name || item.OriginalTitle || 'Unknown'}:${index}`
);

const uniqueItems = (items: ItemDto[]) => {
    const seen = new Set<string>();

    return items.filter((item, index) => {
        const key = getItemKey(item, index);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const orderItems = (items: ItemDto[], requestedOrder: string[] | undefined) => {
    if (!requestedOrder?.length) return items;

    const positions = new Map(requestedOrder.map((itemId, index) => [ itemId, index ]));
    return [ ...items ].sort((a, b) => {
        const aIndex = a.Id ? positions.get(a.Id) : undefined;
        const bIndex = b.Id ? positions.get(b.Id) : undefined;

        if (aIndex != null || bIndex != null) {
            if (aIndex == null) return 1;
            if (bIndex == null) return -1;
            if (aIndex !== bIndex) return aIndex - bIndex;
        }

        return 0;
    });
};

const orderGroups = (groups: ResolvedFranchiseGroup[], requestedOrder: string[]) => {
    if (requestedOrder.length === 0) return groups;

    const positions = new Map(requestedOrder.map((groupId, index) => [ groupId, index ]));
    return [ ...groups ].sort((a, b) => {
        const aIndex = positions.get(a.id);
        const bIndex = positions.get(b.id);

        if (aIndex != null || bIndex != null) {
            if (aIndex == null) return 1;
            if (bIndex == null) return -1;
            return aIndex - bIndex;
        }

        return 0;
    });
};

const findRepresentative = (items: ItemDto[], previous?: ItemDto) => {
    if (previous?.Id && items.some(item => item.Id === previous.Id)) return previous;
    return items.find(item => item.BackdropImageTags?.length)
        || items.find(item => item.ImageTags?.Primary)
        || items[0];
};

const buildCatalogSeed = (hubId: string): ResolvedFranchiseHub | undefined => {
    const definition = VELARIS_FRANCHISE_CATALOG.find(candidate => candidate.id === hubId);
    if (!definition) return undefined;

    return {
        id: definition.id,
        name: definition.name,
        eyebrow: definition.eyebrow,
        description: definition.description,
        groups: definition.groups.map(group => ({
            id: group.id,
            name: group.name,
            items: []
        })),
        items: []
    };
};

const hasMeaningfulOverride = (state: FranchiseStudioHubEditorState | undefined) => Boolean(
    state && (
        state.groups.length > 0
        || Object.keys(state.assignments).length > 0
        || state.excludedItemIds.length > 0
        || state.groupOrder.length > 0
        || Object.keys(state.itemOrder).length > 0
    )
);

const getGroupDefinitions = (
    hub: ResolvedFranchiseHub,
    state: FranchiseStudioHubEditorState
) => {
    const definition = VELARIS_FRANCHISE_CATALOG.find(candidate => candidate.id === hub.id);
    const groups: { id: string; name: string; items: ItemDto[] }[] = hub.groups.map(group => ({
        id: group.id,
        name: group.name,
        items: group.items
    }));

    definition?.groups.forEach(group => {
        if (!groups.some(existing => existing.id === group.id)) {
            groups.push({ id: group.id, name: group.name, items: [] });
        }
    });
    state.groups.forEach(group => {
        if (!groups.some(existing => existing.id === group.id)) {
            groups.push({ id: group.id, name: group.name, items: [] });
        }
    });

    return groups;
};

const applyEditorState = (
    hub: ResolvedFranchiseHub,
    libraryItems: ItemDto[],
    state: FranchiseStudioHubEditorState
): ResolvedFranchiseHub | undefined => {
    const libraryById = new Map(
        libraryItems
            .filter(item => item.Id)
            .map(item => [ item.Id as string, item ])
    );
    const excluded = new Set(state.excludedItemIds);
    const assignments = state.assignments;
    const groupDefinitions = getGroupDefinitions(hub, state);

    const groups = groupDefinitions.map(group => {
        const automaticItems = group.items.filter(item => {
            if (!item.Id || excluded.has(item.Id)) return false;
            const assignedGroup = assignments[item.Id];
            return !assignedGroup || assignedGroup === group.id;
        });
        const explicitItems = Object.entries(assignments)
            .filter(([ itemId, groupId ]) => groupId === group.id && !excluded.has(itemId))
            .map(([ itemId ]) => libraryById.get(itemId))
            .filter((item): item is ItemDto => Boolean(item));
        const items = orderItems(
            uniqueItems([ ...automaticItems, ...explicitItems ]),
            state.itemOrder[group.id]
        );

        return {
            id: group.id,
            name: group.name,
            items
        };
    }).filter(group => group.items.length > 0);

    const orderedGroups = orderGroups(groups, state.groupOrder);
    const items = uniqueItems(orderedGroups.flatMap(group => group.items));
    if (items.length === 0) return undefined;

    return {
        ...hub,
        groups: orderedGroups,
        items,
        representativeItem: findRepresentative(items, hub.representativeItem)
    };
};

const resolveCustomHub = (
    hub: FranchiseStudioCustomHub,
    libraryItems: ItemDto[]
): ResolvedFranchiseHub | undefined => {
    const libraryById = new Map(
        libraryItems
            .filter(item => item.Id)
            .map(item => [ item.Id as string, item ])
    );
    const excluded = new Set(hub.excludedItemIds);
    const groups = hub.groups.map(group => {
        const items = Object.entries(hub.assignments)
            .filter(([ itemId, groupId ]) => groupId === group.id && !excluded.has(itemId))
            .map(([ itemId ]) => libraryById.get(itemId))
            .filter((item): item is ItemDto => Boolean(item));

        return {
            id: group.id,
            name: group.name,
            items: orderItems(uniqueItems(items), hub.itemOrder[group.id])
        };
    }).filter(group => group.items.length > 0);

    const orderedGroups = orderGroups(groups, hub.groupOrder);
    const items = uniqueItems(orderedGroups.flatMap(group => group.items));
    if (items.length === 0) return undefined;

    return {
        id: hub.id,
        name: hub.name,
        eyebrow: hub.eyebrow,
        description: hub.description,
        groups: orderedGroups,
        items,
        representativeItem: findRepresentative(items)
    };
};

export const applyFranchiseStudioConfig = (
    baseHubs: ResolvedFranchiseHub[],
    libraryItems: ItemDto[],
    config: FranchiseStudioConfig
): ResolvedFranchiseHub[] => {
    const baseById = new Map(baseHubs.map(hub => [ hub.id, hub ]));
    const builtInHubIds = new Set([
        ...baseHubs.map(hub => hub.id),
        ...Object.keys(config.overrides)
    ]);
    const catalogIds = new Set(VELARIS_FRANCHISE_CATALOG.map(hub => hub.id));
    const resolvedBuiltIn: ResolvedFranchiseHub[] = [];

    builtInHubIds.forEach(hubId => {
        const baseHub = baseById.get(hubId)
            || (hasMeaningfulOverride(config.overrides[hubId]) ? buildCatalogSeed(hubId) : undefined);
        if (!baseHub) return;

        const state = config.overrides[hubId];
        const resolved = state ? applyEditorState(baseHub, libraryItems, state) : baseHub;
        if (resolved) resolvedBuiltIn.push(resolved);
    });

    const customHubs = config.customHubs
        .filter(hub => !catalogIds.has(hub.id))
        .map(hub => resolveCustomHub(hub, libraryItems))
        .filter((hub): hub is ResolvedFranchiseHub => Boolean(hub));

    return [ ...resolvedBuiltIn, ...customHubs ];
};
