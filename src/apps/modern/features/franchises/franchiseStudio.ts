export interface FranchiseStudioGroup {
    id: string
    name: string
}

export interface FranchiseStudioHubEditorState {
    groups: FranchiseStudioGroup[]
    assignments: Record<string, string>
    excludedItemIds: string[]
    groupOrder: string[]
    itemOrder: Record<string, string[]>
}

export interface FranchiseStudioCustomHub extends FranchiseStudioHubEditorState {
    id: string
    name: string
    eyebrow: string
    description: string
}

export interface FranchiseStudioWatchOrder {
    id: string
    hubId: string
    name: string
    itemIds: string[]
}

export interface FranchiseStudioConfig {
    version: 1
    overrides: Record<string, FranchiseStudioHubEditorState>
    customHubs: FranchiseStudioCustomHub[]
    watchOrders: FranchiseStudioWatchOrder[]
}

export const EMPTY_FRANCHISE_STUDIO_CONFIG: FranchiseStudioConfig = {
    version: 1,
    overrides: {},
    customHubs: [],
    watchOrders: []
};

const emptyHubEditorState = (): FranchiseStudioHubEditorState => ({
    groups: [],
    assignments: {},
    excludedItemIds: [],
    groupOrder: [],
    itemOrder: {}
});

const uniqueStrings = (values: unknown): string[] => {
    if (!Array.isArray(values)) return [];

    return [ ...new Set(values.filter((value): value is string => (
        typeof value === 'string' && Boolean(value.trim())
    )).map(value => value.trim())) ];
};

const sanitizeId = (value: unknown) => {
    if (typeof value !== 'string') return '';

    const normalized = value.trim().toLocaleLowerCase();
    let result = '';
    let separatorPending = false;

    for (const character of normalized) {
        const code = character.charCodeAt(0);
        const isDigit = code >= 48 && code <= 57;
        const isLowercaseAscii = code >= 97 && code <= 122;
        const isAllowedSymbol = character === '_' || character === '-';

        if (isDigit || isLowercaseAscii || isAllowedSymbol) {
            if (separatorPending && result && character !== '-' && !result.endsWith('-')) {
                result += '-';
            }
            separatorPending = false;
            result += character;
        } else if (result) {
            separatorPending = true;
        }
    }

    let start = 0;
    let end = result.length;
    while (start < end && result[start] === '-') start += 1;
    while (end > start && result[end - 1] === '-') end -= 1;
    return result.slice(start, end);
};

const sanitizeName = (value: unknown, fallback = '') => (
    typeof value === 'string' && value.trim() ? value.trim() : fallback
);

const sanitizeGroups = (value: unknown): FranchiseStudioGroup[] => {
    if (!Array.isArray(value)) return [];

    const seen = new Set<string>();
    const groups: FranchiseStudioGroup[] = [];

    value.forEach(candidate => {
        if (!candidate || typeof candidate !== 'object') return;

        const raw = candidate as Partial<FranchiseStudioGroup>;
        const id = sanitizeId(raw.id);
        const name = sanitizeName(raw.name);
        if (!id || !name || seen.has(id)) return;

        seen.add(id);
        groups.push({ id, name });
    });

    return groups;
};

const sanitizeAssignments = (value: unknown) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

    return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>((result, [ itemId, groupId ]) => {
        const cleanItemId = itemId.trim();
        const cleanGroupId = sanitizeId(groupId);
        if (cleanItemId && cleanGroupId) result[cleanItemId] = cleanGroupId;
        return result;
    }, {});
};

const sanitizeItemOrder = (value: unknown) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

    return Object.entries(value as Record<string, unknown>).reduce<Record<string, string[]>>((result, [ groupId, itemIds ]) => {
        const cleanGroupId = sanitizeId(groupId);
        const cleanItems = uniqueStrings(itemIds);
        if (cleanGroupId && cleanItems.length > 0) result[cleanGroupId] = cleanItems;
        return result;
    }, {});
};

const sanitizeEditorState = (value: unknown): FranchiseStudioHubEditorState => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return emptyHubEditorState();
    }

    const candidate = value as Partial<FranchiseStudioHubEditorState>;
    return {
        groups: sanitizeGroups(candidate.groups),
        assignments: sanitizeAssignments(candidate.assignments),
        excludedItemIds: uniqueStrings(candidate.excludedItemIds),
        groupOrder: uniqueStrings(candidate.groupOrder).map(sanitizeId).filter(Boolean),
        itemOrder: sanitizeItemOrder(candidate.itemOrder)
    };
};

const sanitizeCustomHubs = (value: unknown): FranchiseStudioCustomHub[] => {
    if (!Array.isArray(value)) return [];

    const seen = new Set<string>();
    const hubs: FranchiseStudioCustomHub[] = [];

    value.forEach(candidate => {
        if (!candidate || typeof candidate !== 'object') return;

        const raw = candidate as Partial<FranchiseStudioCustomHub>;
        const id = sanitizeId(raw.id);
        const name = sanitizeName(raw.name);
        if (!id || !name || seen.has(id)) return;

        seen.add(id);
        const editor = sanitizeEditorState(raw);
        hubs.push({
            ...editor,
            id,
            name,
            eyebrow: sanitizeName(raw.eyebrow, 'VELARIS CUSTOM UNIVERSE'),
            description: sanitizeName(raw.description, 'Ein eigenes Universum aus deiner Mediathek.')
        });
    });

    return hubs;
};

const sanitizeWatchOrders = (value: unknown): FranchiseStudioWatchOrder[] => {
    if (!Array.isArray(value)) return [];

    const seen = new Set<string>();
    const orders: FranchiseStudioWatchOrder[] = [];

    value.forEach(candidate => {
        if (!candidate || typeof candidate !== 'object') return;

        const raw = candidate as Partial<FranchiseStudioWatchOrder>;
        const id = sanitizeId(raw.id);
        const hubId = sanitizeId(raw.hubId);
        const name = sanitizeName(raw.name);
        if (!id || !hubId || !name || seen.has(id)) return;

        seen.add(id);
        orders.push({
            id,
            hubId,
            name,
            itemIds: uniqueStrings(raw.itemIds)
        });
    });

    return orders;
};

export const sanitizeFranchiseStudioConfig = (value: unknown): FranchiseStudioConfig => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {
            version: 1,
            overrides: {},
            customHubs: [],
            watchOrders: []
        };
    }

    const candidate = value as Partial<FranchiseStudioConfig>;
    const overrides = candidate.overrides && typeof candidate.overrides === 'object' && !Array.isArray(candidate.overrides) ?
        Object.entries(candidate.overrides).reduce<Record<string, FranchiseStudioHubEditorState>>((result, [ hubId, state ]) => {
            const cleanHubId = sanitizeId(hubId);
            if (cleanHubId) result[cleanHubId] = sanitizeEditorState(state);
            return result;
        }, {}) :
        {};

    return {
        version: 1,
        overrides,
        customHubs: sanitizeCustomHubs(candidate.customHubs),
        watchOrders: sanitizeWatchOrders(candidate.watchOrders)
    };
};

export const createFranchiseStudioId = (
    name: string,
    prefix: string,
    reservedIds: string[] = []
) => {
    const stem = sanitizeId(name) || 'untitled';
    const base = `${sanitizeId(prefix) || 'custom'}-${stem}`;
    const reserved = new Set(reservedIds.map(sanitizeId));

    if (!reserved.has(base)) return base;

    let index = 2;
    while (reserved.has(`${base}-${index}`)) index += 1;
    return `${base}-${index}`;
};

const updateEditorState = (
    config: FranchiseStudioConfig,
    hubId: string,
    updater: (state: FranchiseStudioHubEditorState) => FranchiseStudioHubEditorState
): FranchiseStudioConfig => {
    const customIndex = config.customHubs.findIndex(hub => hub.id === hubId);
    if (customIndex >= 0) {
        const customHubs = [ ...config.customHubs ];
        const hub = customHubs[customIndex];
        customHubs[customIndex] = {
            ...hub,
            ...updater(hub)
        };
        return { ...config, customHubs };
    }

    return {
        ...config,
        overrides: {
            ...config.overrides,
            [hubId]: updater(config.overrides[hubId] || emptyHubEditorState())
        }
    };
};

const removeItemFromOrder = (itemOrder: Record<string, string[]>, itemId: string) => (
    Object.entries(itemOrder).reduce<Record<string, string[]>>((result, [ groupId, itemIds ]) => {
        const filtered = itemIds.filter(id => id !== itemId);
        if (filtered.length > 0) result[groupId] = filtered;
        return result;
    }, {})
);

export const assignFranchiseStudioItem = (
    config: FranchiseStudioConfig,
    hubId: string,
    itemId: string,
    groupId: string,
    beforeItemId?: string
) => updateEditorState(config, hubId, state => {
    const cleanGroupId = sanitizeId(groupId);
    if (!itemId || !cleanGroupId) return state;

    const itemOrder = removeItemFromOrder(state.itemOrder, itemId);
    const targetOrder = [ ...(itemOrder[cleanGroupId] || []) ].filter(id => id !== itemId);
    const beforeIndex = beforeItemId ? targetOrder.indexOf(beforeItemId) : -1;

    if (beforeIndex >= 0) targetOrder.splice(beforeIndex, 0, itemId);
    else targetOrder.push(itemId);

    return {
        ...state,
        assignments: {
            ...state.assignments,
            [itemId]: cleanGroupId
        },
        excludedItemIds: state.excludedItemIds.filter(id => id !== itemId),
        itemOrder: {
            ...itemOrder,
            [cleanGroupId]: targetOrder
        }
    };
});

export const excludeFranchiseStudioItem = (
    config: FranchiseStudioConfig,
    hubId: string,
    itemId: string
) => updateEditorState(config, hubId, state => {
    if (!itemId) return state;

    const assignments = { ...state.assignments };
    delete assignments[itemId];

    return {
        ...state,
        assignments,
        excludedItemIds: [ ...new Set([ ...state.excludedItemIds, itemId ]) ],
        itemOrder: removeItemFromOrder(state.itemOrder, itemId)
    };
});

export const clearFranchiseStudioItemOverride = (
    config: FranchiseStudioConfig,
    hubId: string,
    itemId: string
) => updateEditorState(config, hubId, state => {
    const assignments = { ...state.assignments };
    delete assignments[itemId];

    return {
        ...state,
        assignments,
        excludedItemIds: state.excludedItemIds.filter(id => id !== itemId),
        itemOrder: removeItemFromOrder(state.itemOrder, itemId)
    };
});

export const addFranchiseStudioGroup = (
    config: FranchiseStudioConfig,
    hubId: string,
    name: string,
    reservedIds: string[] = []
) => updateEditorState(config, hubId, state => {
    const cleanName = sanitizeName(name);
    if (!cleanName) return state;

    const id = createFranchiseStudioId(
        cleanName,
        'group',
        [ ...reservedIds, ...state.groups.map(group => group.id) ]
    );

    return {
        ...state,
        groups: [ ...state.groups, { id, name: cleanName } ],
        groupOrder: [ ...state.groupOrder, id ]
    };
});

export const removeFranchiseStudioGroup = (
    config: FranchiseStudioConfig,
    hubId: string,
    groupId: string
) => updateEditorState(config, hubId, state => {
    const assignments = Object.entries(state.assignments).reduce<Record<string, string>>((result, [ itemId, assignedGroup ]) => {
        if (assignedGroup !== groupId) result[itemId] = assignedGroup;
        return result;
    }, {});
    const itemOrder = { ...state.itemOrder };
    delete itemOrder[groupId];

    return {
        ...state,
        groups: state.groups.filter(group => group.id !== groupId),
        assignments,
        groupOrder: state.groupOrder.filter(id => id !== groupId),
        itemOrder
    };
});

export const moveFranchiseStudioGroup = (
    config: FranchiseStudioConfig,
    hubId: string,
    groupId: string,
    direction: -1 | 1,
    availableGroupIds: string[]
) => updateEditorState(config, hubId, state => {
    const sanitizedAvailable = availableGroupIds.map(sanitizeId).filter(Boolean);
    const explicit = state.groupOrder.filter(id => sanitizedAvailable.includes(id));
    const order = [ ...explicit, ...sanitizedAvailable.filter(id => !explicit.includes(id)) ];
    const currentIndex = order.indexOf(groupId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= order.length) return state;

    [ order[currentIndex], order[nextIndex] ] = [ order[nextIndex], order[currentIndex] ];
    return { ...state, groupOrder: order };
});

export const createFranchiseStudioHub = (
    config: FranchiseStudioConfig,
    name: string,
    reservedIds: string[] = []
): { config: FranchiseStudioConfig; hubId?: string } => {
    const cleanName = sanitizeName(name);
    if (!cleanName) return { config };

    const hubId = createFranchiseStudioId(
        cleanName,
        'custom',
        [ ...reservedIds, ...config.customHubs.map(hub => hub.id) ]
    );
    const mainGroup: FranchiseStudioGroup = { id: 'main', name: 'Hauptreihe' };

    return {
        hubId,
        config: {
            ...config,
            customHubs: [
                ...config.customHubs,
                {
                    ...emptyHubEditorState(),
                    id: hubId,
                    name: cleanName,
                    eyebrow: 'VELARIS CUSTOM UNIVERSE',
                    description: 'Ein eigenes Universum aus deiner Mediathek.',
                    groups: [ mainGroup ],
                    groupOrder: [ mainGroup.id ]
                }
            ]
        }
    };
};

export const removeFranchiseStudioHub = (
    config: FranchiseStudioConfig,
    hubId: string
): FranchiseStudioConfig => ({
    ...config,
    customHubs: config.customHubs.filter(hub => hub.id !== hubId),
    watchOrders: config.watchOrders.filter(order => order.hubId !== hubId)
});

export const createFranchiseStudioWatchOrder = (
    config: FranchiseStudioConfig,
    hubId: string,
    name: string,
    itemIds: string[]
): FranchiseStudioConfig => {
    const cleanName = sanitizeName(name);
    if (!cleanName || !hubId) return config;

    const id = createFranchiseStudioId(
        cleanName,
        `watch-${hubId}`,
        config.watchOrders.map(order => order.id)
    );

    return {
        ...config,
        watchOrders: [
            ...config.watchOrders,
            {
                id,
                hubId,
                name: cleanName,
                itemIds: uniqueStrings(itemIds)
            }
        ]
    };
};

export const removeFranchiseStudioWatchOrder = (
    config: FranchiseStudioConfig,
    orderId: string
): FranchiseStudioConfig => ({
    ...config,
    watchOrders: config.watchOrders.filter(order => order.id !== orderId)
});

export const reorderFranchiseStudioWatchItem = (
    config: FranchiseStudioConfig,
    orderId: string,
    itemId: string,
    beforeItemId?: string
): FranchiseStudioConfig => ({
    ...config,
    watchOrders: config.watchOrders.map(order => {
        if (order.id !== orderId) return order;

        const itemIds = order.itemIds.filter(id => id !== itemId);
        const beforeIndex = beforeItemId ? itemIds.indexOf(beforeItemId) : -1;
        if (beforeIndex >= 0) itemIds.splice(beforeIndex, 0, itemId);
        else itemIds.push(itemId);

        return { ...order, itemIds };
    })
});

export const addFranchiseStudioWatchItem = (
    config: FranchiseStudioConfig,
    orderId: string,
    itemId: string
): FranchiseStudioConfig => ({
    ...config,
    watchOrders: config.watchOrders.map(order => (
        order.id === orderId && itemId && !order.itemIds.includes(itemId) ?
            { ...order, itemIds: [ ...order.itemIds, itemId ] } :
            order
    ))
});

export const removeFranchiseStudioWatchItem = (
    config: FranchiseStudioConfig,
    orderId: string,
    itemId: string
): FranchiseStudioConfig => ({
    ...config,
    watchOrders: config.watchOrders.map(order => (
        order.id === orderId ?
            { ...order, itemIds: order.itemIds.filter(id => id !== itemId) } :
            order
    ))
});
