import {
    DEFAULT_SMART_HOME_PREFERENCES,
    sanitizeSmartHomePreferences,
    type SmartHomePreferences
} from './smartHome';

const STORAGE_PREFIX = 'velaris:smart-home:v2';
const LEGACY_STORAGE_PREFIX = 'velaris:smart-home:v1:';

type SmartHomeStorage = Pick<Storage, 'getItem' | 'setItem'>;

const getDefaultPreferences = () => sanitizeSmartHomePreferences(DEFAULT_SMART_HOME_PREFERENCES);
const encodeScopePart = (value: string) => encodeURIComponent(value.trim() || 'unknown');

export const getVelarisSmartHomeStorageKey = (serverId: string, userId: string) => (
    `${STORAGE_PREFIX}:${encodeScopePart(serverId)}:${encodeScopePart(userId)}`
);

export const getVelarisLegacySmartHomeStorageKey = (userId: string) => (
    `${LEGACY_STORAGE_PREFIX}${userId}`
);

const parsePreferences = (value: string) => sanitizeSmartHomePreferences(JSON.parse(value));

export const readVelarisSmartHomePreferences = (
    storage: SmartHomeStorage | undefined,
    serverId: string,
    userId: string
): SmartHomePreferences => {
    if (!storage) return getDefaultPreferences();

    try {
        const storageKey = getVelarisSmartHomeStorageKey(serverId, userId);
        const currentValue = storage.getItem(storageKey);
        if (currentValue) return parsePreferences(currentValue);

        const legacyValue = storage.getItem(getVelarisLegacySmartHomeStorageKey(userId));
        if (!legacyValue) return getDefaultPreferences();

        const migratedPreferences = parsePreferences(legacyValue);
        try {
            storage.setItem(storageKey, JSON.stringify(migratedPreferences));
        } catch (error) {
            console.debug('[VelarisSmartHome] unable to persist migrated preferences', error);
        }
        return migratedPreferences;
    } catch (error) {
        console.warn('[VelarisSmartHome] unable to read preferences', error);
        return getDefaultPreferences();
    }
};

export const saveVelarisSmartHomePreferences = (
    storage: SmartHomeStorage | undefined,
    serverId: string,
    userId: string,
    preferences: SmartHomePreferences
) => {
    if (!storage) return false;

    try {
        storage.setItem(
            getVelarisSmartHomeStorageKey(serverId, userId),
            JSON.stringify(sanitizeSmartHomePreferences(preferences))
        );
        return true;
    } catch (error) {
        console.warn('[VelarisSmartHome] unable to save preferences', error);
        return false;
    }
};
