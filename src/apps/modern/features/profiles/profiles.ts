export const VELARIS_PROFILE_PREFERENCES_VERSION = 2;

export const VELARIS_PROFILE_ACCENTS = [
    'cyan',
    'blue',
    'violet',
    'magenta',
    'pink'
] as const;

export type VelarisProfileAccent = typeof VELARIS_PROFILE_ACCENTS[number];

export interface VelarisProfilePreferences {
    version: typeof VELARIS_PROFILE_PREFERENCES_VERSION
    accent: VelarisProfileAccent
    kidsMode: boolean
}

export interface VelarisPublicProfile {
    Id?: string | null
    Name?: string | null
    HasPassword?: boolean | null
    PrimaryImageTag?: string | null
}

interface StorageLike {
    getItem: (key: string) => string | null
    setItem: (key: string, value: string) => void
    removeItem?: (key: string) => void
}

export const DEFAULT_VELARIS_PROFILE_PREFERENCES: VelarisProfilePreferences = {
    version: VELARIS_PROFILE_PREFERENCES_VERSION,
    accent: 'cyan',
    kidsMode: false
};

const PROFILE_STORAGE_PREFIX = `velaris:profiles:v${VELARIS_PROFILE_PREFERENCES_VERSION}`;
const PROFILE_SESSION_PREFIX = 'velaris:profiles:startup:v1';

const isProfileAccent = (value: unknown): value is VelarisProfileAccent => (
    typeof value === 'string' && VELARIS_PROFILE_ACCENTS.includes(value as VelarisProfileAccent)
);

const encodeScopePart = (value: string) => encodeURIComponent(value.trim() || 'unknown');

export const getVelarisProfileStorageKey = (serverId: string, userId: string) => (
    `${PROFILE_STORAGE_PREFIX}:${encodeScopePart(serverId)}:${encodeScopePart(userId)}`
);

export const getVelarisProfileSessionKey = (serverId: string) => (
    `${PROFILE_SESSION_PREFIX}:${encodeScopePart(serverId)}`
);

export const sanitizeVelarisProfilePreferences = (value: unknown): VelarisProfilePreferences => {
    if (!value || typeof value !== 'object') {
        return { ...DEFAULT_VELARIS_PROFILE_PREFERENCES };
    }

    const candidate = value as Partial<VelarisProfilePreferences>;
    return {
        version: VELARIS_PROFILE_PREFERENCES_VERSION,
        accent: isProfileAccent(candidate.accent) ? candidate.accent : DEFAULT_VELARIS_PROFILE_PREFERENCES.accent,
        kidsMode: candidate.kidsMode === true
    };
};

export const readVelarisProfilePreferences = (
    storage: StorageLike,
    serverId: string,
    userId: string
): VelarisProfilePreferences => {
    try {
        const rawValue = storage.getItem(getVelarisProfileStorageKey(serverId, userId));
        return rawValue ? sanitizeVelarisProfilePreferences(JSON.parse(rawValue)) :
            { ...DEFAULT_VELARIS_PROFILE_PREFERENCES };
    } catch (error) {
        console.warn('[VelarisProfiles] unable to read profile preferences', error);
        return { ...DEFAULT_VELARIS_PROFILE_PREFERENCES };
    }
};

export const saveVelarisProfilePreferences = (
    storage: StorageLike,
    serverId: string,
    userId: string,
    preferences: VelarisProfilePreferences
) => {
    const sanitizedPreferences = sanitizeVelarisProfilePreferences(preferences);
    storage.setItem(
        getVelarisProfileStorageKey(serverId, userId),
        JSON.stringify(sanitizedPreferences)
    );
};

export const getChosenVelarisProfileId = (storage: StorageLike, serverId: string) => {
    try {
        return storage.getItem(getVelarisProfileSessionKey(serverId));
    } catch {
        return null;
    }
};

export const markVelarisProfileChosen = (
    storage: StorageLike,
    serverId: string,
    userId: string
) => {
    try {
        storage.setItem(getVelarisProfileSessionKey(serverId), userId);
    } catch (error) {
        console.debug('[VelarisProfiles] unable to persist startup profile choice', error);
    }
};

export const clearVelarisProfileChoice = (storage: StorageLike, serverId: string) => {
    try {
        storage.removeItem?.(getVelarisProfileSessionKey(serverId));
    } catch (error) {
        console.debug('[VelarisProfiles] unable to clear startup profile choice', error);
    }
};

export const shouldShowVelarisProfilePicker = (
    profiles: VelarisPublicProfile[],
    currentUserId: string,
    chosenUserId: string | null
) => {
    const validProfiles = profiles.filter(profile => profile.Id && profile.Name);
    if (validProfiles.length < 2) return false;
    if (!validProfiles.some(profile => profile.Id === currentUserId)) return false;

    return chosenUserId !== currentUserId;
};

export const isValidVelarisProfilePin = (value: string) => /^\d{4,8}$/.test(value);
