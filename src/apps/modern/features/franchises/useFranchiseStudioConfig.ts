import { useCallback, useEffect, useState } from 'react';

import { getVelarisLocalStorage } from 'apps/modern/utils/velarisStorage';
import { useApi } from 'hooks/useApi';

import {
    EMPTY_FRANCHISE_STUDIO_CONFIG,
    sanitizeFranchiseStudioConfig,
    type FranchiseStudioConfig
} from './franchiseStudio';
import {
    getVelarisFranchiseStudioChangeEventName,
    getVelarisFranchiseStudioStorageKey,
    readVelarisFranchiseStudioConfig,
    saveVelarisFranchiseStudioConfig
} from './franchiseStudioPersistence';

const getEmptyConfig = () => sanitizeFranchiseStudioConfig(EMPTY_FRANCHISE_STUDIO_CONFIG);

const readConfig = (serverId: string, userId: string) => (
    readVelarisFranchiseStudioConfig(getVelarisLocalStorage(), serverId, userId)
);

const persistConfig = (serverId: string, userId: string, config: FranchiseStudioConfig) => {
    const saved = saveVelarisFranchiseStudioConfig(getVelarisLocalStorage(), serverId, userId, config);
    if (!saved) return;

    window.setTimeout(() => {
        window.dispatchEvent(new Event(getVelarisFranchiseStudioChangeEventName(serverId, userId)));
    }, 0);
};

export const useFranchiseStudioConfig = () => {
    const { user, __legacyApiClient__ } = useApi();
    const userId = user?.Id;
    const serverId = __legacyApiClient__?.serverId();
    const [ config, setConfigState ] = useState<FranchiseStudioConfig>(() => (
        userId && serverId ? readConfig(serverId, userId) : getEmptyConfig()
    ));

    useEffect(() => {
        setConfigState(userId && serverId ? readConfig(serverId, userId) : getEmptyConfig());
    }, [ serverId, userId ]);

    useEffect(() => {
        if (!userId || !serverId) return undefined;

        const eventName = getVelarisFranchiseStudioChangeEventName(serverId, userId);
        const storageKey = getVelarisFranchiseStudioStorageKey(serverId, userId);
        const onChange = () => setConfigState(readConfig(serverId, userId));
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

    const setConfig = useCallback((
        updater: FranchiseStudioConfig | ((current: FranchiseStudioConfig) => FranchiseStudioConfig)
    ) => {
        setConfigState(current => {
            const candidate = typeof updater === 'function' ? updater(current) : updater;
            const next = sanitizeFranchiseStudioConfig(candidate);
            if (userId && serverId) persistConfig(serverId, userId, next);
            return next;
        });
    }, [ serverId, userId ]);

    const resetConfig = useCallback(() => {
        setConfig(getEmptyConfig());
    }, [ setConfig ]);

    return {
        config,
        setConfig,
        resetConfig
    };
};
