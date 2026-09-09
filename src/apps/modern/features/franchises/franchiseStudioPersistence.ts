import {
    EMPTY_FRANCHISE_STUDIO_CONFIG,
    sanitizeFranchiseStudioConfig,
    type FranchiseStudioConfig
} from './franchiseStudio';

const STORAGE_PREFIX = 'velaris:franchise-studio:v2';
const LEGACY_STORAGE_PREFIX = 'velaris:franchise-studio:v1:';
const CHANGE_EVENT_PREFIX = 'velaris:franchise-studio:change:v2';

type FranchiseStudioStorage = Pick<Storage, 'getItem' | 'setItem'>;

const getEmptyConfig = () => sanitizeFranchiseStudioConfig(EMPTY_FRANCHISE_STUDIO_CONFIG);
const encodeScopePart = (value: string) => encodeURIComponent(value.trim() || 'unknown');

export const getVelarisFranchiseStudioStorageKey = (serverId: string, userId: string) => (
    `${STORAGE_PREFIX}:${encodeScopePart(serverId)}:${encodeScopePart(userId)}`
);

export const getVelarisLegacyFranchiseStudioStorageKey = (userId: string) => (
    `${LEGACY_STORAGE_PREFIX}${userId}`
);

export const getVelarisFranchiseStudioChangeEventName = (serverId: string, userId: string) => (
    `${CHANGE_EVENT_PREFIX}:${encodeScopePart(serverId)}:${encodeScopePart(userId)}`
);

const parseConfig = (value: string) => sanitizeFranchiseStudioConfig(JSON.parse(value));

export const readVelarisFranchiseStudioConfig = (
    storage: FranchiseStudioStorage | undefined,
    serverId: string,
    userId: string
): FranchiseStudioConfig => {
    if (!storage) return getEmptyConfig();

    try {
        const storageKey = getVelarisFranchiseStudioStorageKey(serverId, userId);
        const currentValue = storage.getItem(storageKey);
        if (currentValue) return parseConfig(currentValue);

        const legacyValue = storage.getItem(getVelarisLegacyFranchiseStudioStorageKey(userId));
        if (!legacyValue) return getEmptyConfig();

        const migratedConfig = parseConfig(legacyValue);
        try {
            storage.setItem(storageKey, JSON.stringify(migratedConfig));
        } catch (error) {
            console.debug('[FranchiseStudio] unable to persist migrated configuration', error);
        }
        return migratedConfig;
    } catch (error) {
        console.warn('[FranchiseStudio] unable to read configuration', error);
        return getEmptyConfig();
    }
};

export const saveVelarisFranchiseStudioConfig = (
    storage: FranchiseStudioStorage | undefined,
    serverId: string,
    userId: string,
    config: FranchiseStudioConfig
) => {
    if (!storage) return false;

    try {
        storage.setItem(
            getVelarisFranchiseStudioStorageKey(serverId, userId),
            JSON.stringify(sanitizeFranchiseStudioConfig(config))
        );
        return true;
    } catch (error) {
        console.warn('[FranchiseStudio] unable to save configuration', error);
        return false;
    }
};
