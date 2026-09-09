export const VELARIS_CONTROL_CENTER_VERSION = 1;
export const VELARIS_CONTROL_CENTER_EVENT = 'velaris:control-center-preferences-changed';

export type VelarisThemePreset = 'default' | 'oled' | 'midnight' | 'aurora' | 'custom';
export type VelarisDensity = 'comfortable' | 'compact' | 'spacious';
export type VelarisAnimationMode = 'full' | 'reduced' | 'off';
export type VelarisHeroMode = 'cinematic' | 'compact' | 'hidden';
export type VelarisNavigationMode = 'full' | 'compact';

export interface VelarisControlCenterPreferences {
    version: number
    themePreset: VelarisThemePreset
    customAccent: string
    density: VelarisDensity
    animationMode: VelarisAnimationMode
    heroMode: VelarisHeroMode
    navigationMode: VelarisNavigationMode
    showSmartHome: boolean
    showDiscovery: boolean
    showFranchises: boolean
    advancedPlayerEnabled: boolean
}

export const DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES: VelarisControlCenterPreferences = {
    version: VELARIS_CONTROL_CENTER_VERSION,
    themePreset: 'default',
    customAccent: '#45f3ff',
    density: 'comfortable',
    animationMode: 'full',
    heroMode: 'cinematic',
    navigationMode: 'full',
    showSmartHome: true,
    showDiscovery: true,
    showFranchises: true,
    advancedPlayerEnabled: true
};

const STORAGE_PREFIX = 'velaris:control-center:v1';
const THEME_PRESETS: VelarisThemePreset[] = [ 'default', 'oled', 'midnight', 'aurora', 'custom' ];
const DENSITIES: VelarisDensity[] = [ 'comfortable', 'compact', 'spacious' ];
const ANIMATION_MODES: VelarisAnimationMode[] = [ 'full', 'reduced', 'off' ];
const HERO_MODES: VelarisHeroMode[] = [ 'cinematic', 'compact', 'hidden' ];
const NAVIGATION_MODES: VelarisNavigationMode[] = [ 'full', 'compact' ];
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const isThemePreset = (value: unknown): value is VelarisThemePreset => (
    typeof value === 'string' && THEME_PRESETS.includes(value as VelarisThemePreset)
);

const isDensity = (value: unknown): value is VelarisDensity => (
    typeof value === 'string' && DENSITIES.includes(value as VelarisDensity)
);

const isAnimationMode = (value: unknown): value is VelarisAnimationMode => (
    typeof value === 'string' && ANIMATION_MODES.includes(value as VelarisAnimationMode)
);

const isHeroMode = (value: unknown): value is VelarisHeroMode => (
    typeof value === 'string' && HERO_MODES.includes(value as VelarisHeroMode)
);

const isNavigationMode = (value: unknown): value is VelarisNavigationMode => (
    typeof value === 'string' && NAVIGATION_MODES.includes(value as VelarisNavigationMode)
);

const getBoolean = (value: unknown, fallback: boolean) => (
    typeof value === 'boolean' ? value : fallback
);

const sanitizeAccent = (value: unknown) => (
    typeof value === 'string' && HEX_COLOR_PATTERN.test(value) ?
        value.toLowerCase() :
        DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES.customAccent
);

export const getVelarisControlCenterStorageKey = (serverId: string, userId: string) => (
    `${STORAGE_PREFIX}:${encodeURIComponent(serverId)}:${encodeURIComponent(userId)}`
);

export const sanitizeVelarisControlCenterPreferences = (
    value: unknown
): VelarisControlCenterPreferences => {
    if (!value || typeof value !== 'object') {
        return { ...DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES };
    }

    const candidate = value as Partial<VelarisControlCenterPreferences>;
    return {
        version: VELARIS_CONTROL_CENTER_VERSION,
        themePreset: isThemePreset(candidate.themePreset) ?
            candidate.themePreset :
            DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES.themePreset,
        customAccent: sanitizeAccent(candidate.customAccent),
        density: isDensity(candidate.density) ?
            candidate.density :
            DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES.density,
        animationMode: isAnimationMode(candidate.animationMode) ?
            candidate.animationMode :
            DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES.animationMode,
        heroMode: isHeroMode(candidate.heroMode) ?
            candidate.heroMode :
            DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES.heroMode,
        navigationMode: isNavigationMode(candidate.navigationMode) ?
            candidate.navigationMode :
            DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES.navigationMode,
        showSmartHome: getBoolean(
            candidate.showSmartHome,
            DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES.showSmartHome
        ),
        showDiscovery: getBoolean(
            candidate.showDiscovery,
            DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES.showDiscovery
        ),
        showFranchises: getBoolean(
            candidate.showFranchises,
            DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES.showFranchises
        ),
        advancedPlayerEnabled: getBoolean(
            candidate.advancedPlayerEnabled,
            DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES.advancedPlayerEnabled
        )
    };
};

export const readVelarisControlCenterPreferences = (
    storage: Pick<Storage, 'getItem'>,
    serverId: string,
    userId: string
): VelarisControlCenterPreferences => {
    try {
        const value = storage.getItem(getVelarisControlCenterStorageKey(serverId, userId));
        if (!value) return { ...DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES };
        return sanitizeVelarisControlCenterPreferences(JSON.parse(value));
    } catch (error) {
        console.warn('[VelarisControlCenter] unable to read preferences', error);
        return { ...DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES };
    }
};

export const saveVelarisControlCenterPreferences = (
    storage: Pick<Storage, 'setItem'>,
    serverId: string,
    userId: string,
    preferences: VelarisControlCenterPreferences
) => {
    storage.setItem(
        getVelarisControlCenterStorageKey(serverId, userId),
        JSON.stringify(sanitizeVelarisControlCenterPreferences(preferences))
    );
};
