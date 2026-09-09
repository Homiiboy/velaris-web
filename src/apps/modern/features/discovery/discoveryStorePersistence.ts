import {
    EMPTY_DISCOVERY_STORE,
    sanitizeDiscoveryStore,
    type VelarisDiscoveryStore
} from './discovery';

const STORAGE_PREFIX = 'velaris:discovery:v2';
const LEGACY_STORAGE_PREFIX = 'velaris:discovery:v1:';
const CHANGE_EVENT_PREFIX = 'velaris:discovery:change:v2';

type DiscoveryStorage = Pick<Storage, 'getItem' | 'setItem'>;

const getEmptyStore = () => sanitizeDiscoveryStore(EMPTY_DISCOVERY_STORE);
const encodeScopePart = (value: string) => encodeURIComponent(value.trim() || 'unknown');

export const getVelarisDiscoveryStorageKey = (serverId: string, userId: string) => (
    `${STORAGE_PREFIX}:${encodeScopePart(serverId)}:${encodeScopePart(userId)}`
);

export const getVelarisLegacyDiscoveryStorageKey = (userId: string) => (
    `${LEGACY_STORAGE_PREFIX}${userId}`
);

export const getVelarisDiscoveryChangeEventName = (serverId: string, userId: string) => (
    `${CHANGE_EVENT_PREFIX}:${encodeScopePart(serverId)}:${encodeScopePart(userId)}`
);

const parseStore = (value: string) => sanitizeDiscoveryStore(JSON.parse(value));

export const readVelarisDiscoveryStore = (
    storage: DiscoveryStorage | undefined,
    serverId: string,
    userId: string
): VelarisDiscoveryStore => {
    if (!storage) return getEmptyStore();

    try {
        const storageKey = getVelarisDiscoveryStorageKey(serverId, userId);
        const currentValue = storage.getItem(storageKey);
        if (currentValue) return parseStore(currentValue);

        const legacyValue = storage.getItem(getVelarisLegacyDiscoveryStorageKey(userId));
        if (!legacyValue) return getEmptyStore();

        const migratedStore = parseStore(legacyValue);
        try {
            storage.setItem(storageKey, JSON.stringify(migratedStore));
        } catch (error) {
            console.debug('[VelarisDiscovery] unable to persist migrated list data', error);
        }
        return migratedStore;
    } catch (error) {
        console.warn('[VelarisDiscovery] unable to read list data', error);
        return getEmptyStore();
    }
};

export const saveVelarisDiscoveryStore = (
    storage: DiscoveryStorage | undefined,
    serverId: string,
    userId: string,
    store: VelarisDiscoveryStore
) => {
    if (!storage) return false;

    try {
        storage.setItem(
            getVelarisDiscoveryStorageKey(serverId, userId),
            JSON.stringify(sanitizeDiscoveryStore(store))
        );
        return true;
    } catch (error) {
        console.warn('[VelarisDiscovery] unable to save list data', error);
        return false;
    }
};
