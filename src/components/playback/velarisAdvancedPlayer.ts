import { readVelarisControlCenterPreferences } from 'apps/modern/features/controlCenter/controlCenter';

export const VELARIS_ADVANCED_PLAYER_VERSION = 1;

export const VELARIS_QUALITY_PRESETS = [
    { id: 'auto', label: 'Automatisch', maxBitrate: 0, automatic: true },
    { id: 'high', label: 'Hoch', maxBitrate: 80_000_000, automatic: false },
    { id: 'balanced', label: 'Ausgewogen', maxBitrate: 20_000_000, automatic: false },
    { id: 'data-saver', label: 'Datensparend', maxBitrate: 8_000_000, automatic: false }
] as const;

export type VelarisQualityPreset = typeof VELARIS_QUALITY_PRESETS[number]['id'];

export interface VelarisAdvancedPlayerPreferences {
    version: typeof VELARIS_ADVANCED_PLAYER_VERSION
    qualityPreset: VelarisQualityPreset
    technicalOverlay: boolean
    segmentTransitions: boolean
}

interface StorageLike {
    getItem: (key: string) => string | null
    setItem: (key: string, value: string) => void
}

export const DEFAULT_VELARIS_ADVANCED_PLAYER_PREFERENCES: VelarisAdvancedPlayerPreferences = {
    version: VELARIS_ADVANCED_PLAYER_VERSION,
    qualityPreset: 'auto',
    technicalOverlay: false,
    segmentTransitions: true
};

const DISABLED_VELARIS_ADVANCED_PLAYER_PREFERENCES: VelarisAdvancedPlayerPreferences = {
    ...DEFAULT_VELARIS_ADVANCED_PLAYER_PREFERENCES,
    segmentTransitions: false
};

const STORAGE_PREFIX = `velaris:advanced-player:v${VELARIS_ADVANCED_PLAYER_VERSION}`;

const encodeScope = (value: string) => encodeURIComponent(value.trim() || 'unknown');

export const getVelarisAdvancedPlayerStorageKey = (serverId: string, userId: string) => (
    `${STORAGE_PREFIX}:${encodeScope(serverId)}:${encodeScope(userId)}`
);

const isQualityPreset = (value: unknown): value is VelarisQualityPreset => (
    typeof value === 'string' && VELARIS_QUALITY_PRESETS.some(preset => preset.id === value)
);

export const sanitizeVelarisAdvancedPlayerPreferences = (
    value: unknown
): VelarisAdvancedPlayerPreferences => {
    if (!value || typeof value !== 'object') {
        return { ...DEFAULT_VELARIS_ADVANCED_PLAYER_PREFERENCES };
    }

    const candidate = value as Partial<VelarisAdvancedPlayerPreferences>;
    return {
        version: VELARIS_ADVANCED_PLAYER_VERSION,
        qualityPreset: isQualityPreset(candidate.qualityPreset) ?
            candidate.qualityPreset :
            DEFAULT_VELARIS_ADVANCED_PLAYER_PREFERENCES.qualityPreset,
        technicalOverlay: candidate.technicalOverlay === true,
        segmentTransitions: candidate.segmentTransitions !== false
    };
};

export const readVelarisAdvancedPlayerPreferences = (
    storage: StorageLike,
    serverId: string,
    userId: string
): VelarisAdvancedPlayerPreferences => {
    const controlCenterPreferences = readVelarisControlCenterPreferences(storage, serverId, userId);
    if (!controlCenterPreferences.advancedPlayerEnabled) {
        return { ...DISABLED_VELARIS_ADVANCED_PLAYER_PREFERENCES };
    }

    try {
        const rawValue = storage.getItem(getVelarisAdvancedPlayerStorageKey(serverId, userId));
        return rawValue ?
            sanitizeVelarisAdvancedPlayerPreferences(JSON.parse(rawValue)) :
            { ...DEFAULT_VELARIS_ADVANCED_PLAYER_PREFERENCES };
    } catch (error) {
        console.warn('[VelarisAdvancedPlayer] unable to read preferences', error);
        return { ...DEFAULT_VELARIS_ADVANCED_PLAYER_PREFERENCES };
    }
};

export const saveVelarisAdvancedPlayerPreferences = (
    storage: StorageLike,
    serverId: string,
    userId: string,
    preferences: VelarisAdvancedPlayerPreferences
) => {
    storage.setItem(
        getVelarisAdvancedPlayerStorageKey(serverId, userId),
        JSON.stringify(sanitizeVelarisAdvancedPlayerPreferences(preferences))
    );
};

export const getVelarisQualityPreset = (id: VelarisQualityPreset) => (
    VELARIS_QUALITY_PRESETS.find(preset => preset.id === id) ?? VELARIS_QUALITY_PRESETS[0]
);

export const getVelarisPlayMethodLabel = (playMethod?: string | null) => {
    switch (playMethod) {
        case 'DirectPlay':
            return 'Direct Play';
        case 'DirectStream':
            return 'Remux';
        case 'Transcode':
            return 'Transcoding';
        default:
            return 'Unbekannt';
    }
};

export const formatVelarisChapterTime = (ticks?: number | null) => {
    const seconds = Math.max(0, Math.floor((ticks || 0) / 10_000_000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

export const getVelarisQueueWindow = <T>(items: T[], currentIndex: number, limit = 5) => {
    const startIndex = Math.max(0, currentIndex + 1);
    return items.slice(startIndex, startIndex + Math.max(0, limit));
};
