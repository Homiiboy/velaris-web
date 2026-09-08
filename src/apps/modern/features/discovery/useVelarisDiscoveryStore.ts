import { useCallback, useEffect, useState } from 'react';

import { useApi } from 'hooks/useApi';

import {
    EMPTY_DISCOVERY_STORE,
    sanitizeDiscoveryStore,
    type VelarisDiscoveryStore
} from './discovery';

const STORAGE_PREFIX = 'velaris:discovery:v1:';
const CHANGE_EVENT_PREFIX = 'velaris:discovery:change:';

const getStorageKey = (userId: string) => `${STORAGE_PREFIX}${userId}`;
const getChangeEventName = (userId: string) => `${CHANGE_EVENT_PREFIX}${userId}`;

const readStore = (userId: string): VelarisDiscoveryStore => {
    try {
        const stored = window.localStorage.getItem(getStorageKey(userId));
        return stored ? sanitizeDiscoveryStore(JSON.parse(stored)) : sanitizeDiscoveryStore(EMPTY_DISCOVERY_STORE);
    } catch (error) {
        console.warn('[VelarisDiscovery] unable to read list data', error);
        return sanitizeDiscoveryStore(EMPTY_DISCOVERY_STORE);
    }
};

const persistStore = (userId: string, store: VelarisDiscoveryStore) => {
    try {
        window.localStorage.setItem(getStorageKey(userId), JSON.stringify(store));
        window.setTimeout(() => {
            window.dispatchEvent(new Event(getChangeEventName(userId)));
        }, 0);
    } catch (error) {
        console.warn('[VelarisDiscovery] unable to save list data', error);
    }
};

export const useVelarisDiscoveryStore = () => {
    const { user } = useApi();
    const userId = user?.Id;
    const [ store, setStoreState ] = useState<VelarisDiscoveryStore>(() => (
        userId ? readStore(userId) : sanitizeDiscoveryStore(EMPTY_DISCOVERY_STORE)
    ));

    useEffect(() => {
        setStoreState(userId ? readStore(userId) : sanitizeDiscoveryStore(EMPTY_DISCOVERY_STORE));
    }, [ userId ]);

    useEffect(() => {
        if (!userId) return undefined;

        const eventName = getChangeEventName(userId);
        const onChange = () => setStoreState(readStore(userId));
        const onStorage = (event: StorageEvent) => {
            if (event.key === getStorageKey(userId)) onChange();
        };

        window.addEventListener(eventName, onChange);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener(eventName, onChange);
            window.removeEventListener('storage', onStorage);
        };
    }, [ userId ]);

    const setStore = useCallback((
        updater: VelarisDiscoveryStore | ((current: VelarisDiscoveryStore) => VelarisDiscoveryStore)
    ) => {
        setStoreState(current => {
            const candidate = typeof updater === 'function' ? updater(current) : updater;
            const next = sanitizeDiscoveryStore(candidate);
            if (userId) persistStore(userId, next);
            return next;
        });
    }, [ userId ]);

    return { store, setStore };
};
