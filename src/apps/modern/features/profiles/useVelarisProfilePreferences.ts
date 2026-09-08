import { useCallback, useEffect, useMemo, useState } from 'react';

import { useApi } from 'hooks/useApi';

import {
    DEFAULT_VELARIS_PROFILE_PREFERENCES,
    getVelarisProfileStorageKey,
    readVelarisProfilePreferences,
    sanitizeVelarisProfilePreferences,
    saveVelarisProfilePreferences,
    type VelarisProfilePreferences
} from './profiles';

const PROFILE_PREFERENCES_EVENT = 'velaris:profile-preferences-changed';

export const useVelarisProfilePreferences = () => {
    const { user, __legacyApiClient__ } = useApi();
    const userId = user?.Id;
    const serverId = __legacyApiClient__?.serverId();
    const storageKey = useMemo(() => (
        userId && serverId ? getVelarisProfileStorageKey(serverId, userId) : undefined
    ), [ serverId, userId ]);
    const [ preferences, setPreferences ] = useState<VelarisProfilePreferences>(
        DEFAULT_VELARIS_PROFILE_PREFERENCES
    );

    useEffect(() => {
        if (!userId || !serverId) {
            setPreferences({ ...DEFAULT_VELARIS_PROFILE_PREFERENCES });
            return;
        }

        setPreferences(readVelarisProfilePreferences(window.localStorage, serverId, userId));
    }, [ serverId, userId ]);

    useEffect(() => {
        if (!userId || !serverId) return;

        document.documentElement.dataset.velarisProfileAccent = preferences.accent;
        document.documentElement.classList.toggle('velaris-kids-mode', preferences.kidsMode);

        return () => {
            document.documentElement.classList.remove('velaris-kids-mode');
        };
    }, [ preferences, serverId, userId ]);

    useEffect(() => {
        if (!storageKey || !userId || !serverId) return;

        const onStorage = (event: StorageEvent) => {
            if (event.key === storageKey) {
                setPreferences(readVelarisProfilePreferences(window.localStorage, serverId, userId));
            }
        };
        const onProfilePreferencesChanged = () => {
            setPreferences(readVelarisProfilePreferences(window.localStorage, serverId, userId));
        };

        window.addEventListener('storage', onStorage);
        window.addEventListener(PROFILE_PREFERENCES_EVENT, onProfilePreferencesChanged);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener(PROFILE_PREFERENCES_EVENT, onProfilePreferencesChanged);
        };
    }, [ serverId, storageKey, userId ]);

    const updatePreferences = useCallback((next: VelarisProfilePreferences) => {
        if (!userId || !serverId) return;

        const sanitized = sanitizeVelarisProfilePreferences(next);
        setPreferences(sanitized);
        try {
            saveVelarisProfilePreferences(window.localStorage, serverId, userId, sanitized);
            window.dispatchEvent(new Event(PROFILE_PREFERENCES_EVENT));
        } catch (error) {
            console.warn('[VelarisProfiles] unable to save profile preferences', error);
        }
    }, [ serverId, userId ]);

    const patchPreferences = useCallback((patch: Partial<VelarisProfilePreferences>) => {
        updatePreferences({ ...preferences, ...patch });
    }, [ preferences, updatePreferences ]);

    return {
        preferences,
        patchPreferences,
        userId,
        serverId
    };
};
