import { useCallback, useEffect, useState } from 'react';

import { getVelarisLocalStorage } from 'apps/modern/utils/velarisStorage';
import { useApi } from 'hooks/useApi';

import {
    EMPTY_DISCOVERY_STORE,
    sanitizeDiscoveryStore,
    type VelarisDiscoveryStore
} from './discovery';
import {
    getVelarisDiscoveryChangeEventName,
    getVelarisDiscoveryStorageKey,
    readVelarisDiscoveryStore,
    saveVelarisDiscoveryStore
} from './discoveryStorePersistence';

const getEmptyStore = () => sanitizeDiscoveryStore(EMPTY_DISCOVERY_STORE);

const readStore = (serverId: string, userId: string) => (
    readVelarisDiscoveryStore(getVelarisLocalStorage(), serverId, userId)
);

const persistStore = (serverId: string, userId: string, store: VelarisDiscoveryStore) => {
    const saved = saveVelarisDiscoveryStore(getVelarisLocalStorage(), serverId, userId, store);
    if (!saved) return;

    window.setTimeout(() => {
        window.dispatchEvent(new Event(getVelarisDiscoveryChangeEventName(serverId, userId)));
    }, 0);
};

export const useVelarisDiscoveryStore = () => {
    const { user, __legacyApiClient__ } = useApi();
    const userId = user?.Id;
    const serverId = __legacyApiClient__?.serverId();
    const [ store, setStoreState ] = useState<VelarisDiscoveryStore>(() => (
        userId && serverId ? readStore(serverId, userId) : getEmptyStore()
    ));

    useEffect(() => {
        setStoreState(userId && serverId ? readStore(serverId, userId) : getEmptyStore());
    }, [ serverId, userId ]);

    useEffect(() => {
        if (!userId || !serverId) return undefined;

        const eventName = getVelarisDiscoveryChangeEventName(serverId, userId);
        const storageKey = getVelarisDiscoveryStorageKey(serverId, userId);
        const onChange = () => setStoreState(readStore(serverId, userId));
        const onStorage = (event: StorageEvent) => {
            if (event.key === storageKey) onChange();
        };

        window.addEventListener(eventName, onChange);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener(eventName, onChange);
            window.removeEventListener('storage', onStorage);
        };
    }, [ serverId, userId ]);

    const setStore = useCallback((
        updater: VelarisDiscoveryStore | ((current: VelarisDiscoveryStore) => VelarisDiscoveryStore)
    ) => {
        setStoreState(current => {
            const candidate = typeof updater === 'function' ? updater(current) : updater;
            const next = sanitizeDiscoveryStore(candidate);
            if (userId && serverId) persistStore(serverId, userId, next);
            return next;
        });
    }, [ serverId, userId ]);

    return { store, setStore };
};
