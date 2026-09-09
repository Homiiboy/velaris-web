import { useCallback, useEffect, useMemo, useState } from 'react';

import { useApi } from 'hooks/useApi';

import {
    DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES,
    getVelarisControlCenterStorageKey,
    readVelarisControlCenterPreferences,
    sanitizeVelarisControlCenterPreferences,
    saveVelarisControlCenterPreferences,
    VELARIS_CONTROL_CENTER_EVENT,
    type VelarisControlCenterPreferences
} from './controlCenter';

const applyPreferencesToRoot = (preferences: VelarisControlCenterPreferences) => {
    const root = document.documentElement;
    root.dataset.velarisTheme = preferences.themePreset;
    root.dataset.velarisDensity = preferences.density;
    root.dataset.velarisAnimations = preferences.animationMode;
    root.dataset.velarisHero = preferences.heroMode;
    root.dataset.velarisNavigation = preferences.navigationMode;
    root.style.setProperty('--velaris-custom-accent', preferences.customAccent);
    root.classList.toggle('velaris-feature-smart-home-disabled', !preferences.showSmartHome);
    root.classList.toggle('velaris-feature-discovery-disabled', !preferences.showDiscovery);
    root.classList.toggle('velaris-feature-franchises-disabled', !preferences.showFranchises);
    root.classList.toggle('velaris-feature-advanced-player-disabled', !preferences.advancedPlayerEnabled);
};

export const useVelarisControlCenterPreferences = () => {
    const { user, __legacyApiClient__ } = useApi();
    const userId = user?.Id;
    const serverId = __legacyApiClient__?.serverId();
    const storageKey = useMemo(() => (
        userId && serverId ? getVelarisControlCenterStorageKey(serverId, userId) : undefined
    ), [ serverId, userId ]);
    const [ preferences, setPreferences ] = useState<VelarisControlCenterPreferences>(() => (
        userId && serverId ?
            readVelarisControlCenterPreferences(window.localStorage, serverId, userId) :
            { ...DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES }
    ));

    useEffect(() => {
        if (!userId || !serverId) {
            setPreferences({ ...DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES });
            return;
        }

        setPreferences(readVelarisControlCenterPreferences(window.localStorage, serverId, userId));
    }, [ serverId, userId ]);

    useEffect(() => {
        applyPreferencesToRoot(preferences);
    }, [ preferences ]);

    useEffect(() => {
        if (!storageKey || !userId || !serverId) return;

        const onStorage = (event: StorageEvent) => {
            if (event.key === storageKey) {
                setPreferences(readVelarisControlCenterPreferences(window.localStorage, serverId, userId));
            }
        };
        const onPreferencesChanged = () => {
            setPreferences(readVelarisControlCenterPreferences(window.localStorage, serverId, userId));
        };

        window.addEventListener('storage', onStorage);
        window.addEventListener(VELARIS_CONTROL_CENTER_EVENT, onPreferencesChanged);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener(VELARIS_CONTROL_CENTER_EVENT, onPreferencesChanged);
        };
    }, [ serverId, storageKey, userId ]);

    const updatePreferences = useCallback((next: VelarisControlCenterPreferences) => {
        if (!userId || !serverId) return;

        const sanitized = sanitizeVelarisControlCenterPreferences(next);
        setPreferences(sanitized);
        try {
            saveVelarisControlCenterPreferences(window.localStorage, serverId, userId, sanitized);
            window.dispatchEvent(new Event(VELARIS_CONTROL_CENTER_EVENT));
        } catch (error) {
            console.warn('[VelarisControlCenter] unable to save preferences', error);
        }
    }, [ serverId, userId ]);

    const patchPreferences = useCallback((patch: Partial<VelarisControlCenterPreferences>) => {
        updatePreferences({ ...preferences, ...patch });
    }, [ preferences, updatePreferences ]);

    const resetPreferences = useCallback(() => {
        updatePreferences({ ...DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES });
    }, [ updatePreferences ]);

    return {
        preferences,
        patchPreferences,
        resetPreferences,
        userId,
        serverId
    };
};
