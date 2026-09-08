import { useCallback, useEffect, useState } from 'react';

import { useApi } from 'hooks/useApi';

import {
    EMPTY_FRANCHISE_STUDIO_CONFIG,
    sanitizeFranchiseStudioConfig,
    type FranchiseStudioConfig
} from './franchiseStudio';

const STORAGE_PREFIX = 'velaris:franchise-studio:v1:';
const CHANGE_EVENT_PREFIX = 'velaris:franchise-studio:change:';

const getStorageKey = (userId: string) => `${STORAGE_PREFIX}${userId}`;
const getChangeEventName = (userId: string) => `${CHANGE_EVENT_PREFIX}${userId}`;

const readConfig = (userId: string): FranchiseStudioConfig => {
    try {
        const stored = window.localStorage.getItem(getStorageKey(userId));
        return stored ? sanitizeFranchiseStudioConfig(JSON.parse(stored)) :
            sanitizeFranchiseStudioConfig(EMPTY_FRANCHISE_STUDIO_CONFIG);
    } catch (error) {
        console.warn('[FranchiseStudio] unable to read configuration', error);
        return sanitizeFranchiseStudioConfig(EMPTY_FRANCHISE_STUDIO_CONFIG);
    }
};

const persistConfig = (userId: string, config: FranchiseStudioConfig) => {
    try {
        window.localStorage.setItem(getStorageKey(userId), JSON.stringify(config));
        window.setTimeout(() => {
            window.dispatchEvent(new Event(getChangeEventName(userId)));
        }, 0);
    } catch (error) {
        console.warn('[FranchiseStudio] unable to save configuration', error);
    }
};

export const useFranchiseStudioConfig = () => {
    const { user } = useApi();
    const userId = user?.Id;
    const [ config, setConfigState ] = useState<FranchiseStudioConfig>(() => (
        userId ? readConfig(userId) : sanitizeFranchiseStudioConfig(EMPTY_FRANCHISE_STUDIO_CONFIG)
    ));

    useEffect(() => {
        setConfigState(userId ? readConfig(userId) : sanitizeFranchiseStudioConfig(EMPTY_FRANCHISE_STUDIO_CONFIG));
    }, [ userId ]);

    useEffect(() => {
        if (!userId) return undefined;

        const eventName = getChangeEventName(userId);
        const onChange = () => setConfigState(readConfig(userId));
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

    const setConfig = useCallback((
        updater: FranchiseStudioConfig | ((current: FranchiseStudioConfig) => FranchiseStudioConfig)
    ) => {
        setConfigState(current => {
            const candidate = typeof updater === 'function' ? updater(current) : updater;
            const next = sanitizeFranchiseStudioConfig(candidate);
            if (userId) persistConfig(userId, next);
            return next;
        });
    }, [ userId ]);

    const resetConfig = useCallback(() => {
        setConfig(sanitizeFranchiseStudioConfig(EMPTY_FRANCHISE_STUDIO_CONFIG));
    }, [ setConfig ]);

    return {
        config,
        setConfig,
        resetConfig
    };
};
