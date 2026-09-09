import { describe, expect, it } from 'vitest';

import {
    DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES,
    getVelarisControlCenterStorageKey,
    readVelarisControlCenterPreferences,
    sanitizeVelarisControlCenterPreferences,
    saveVelarisControlCenterPreferences
} from './controlCenter';

class MemoryStorage {
    private readonly values = new Map<string, string>();

    getItem(key: string) {
        return this.values.get(key) ?? null;
    }

    setItem(key: string, value: string) {
        this.values.set(key, value);
    }
}

describe('Velaris Control Center preferences', () => {
    it('repairs malformed values to supported defaults', () => {
        expect(sanitizeVelarisControlCenterPreferences({
            themePreset: 'unknown',
            customAccent: 'cyan',
            density: 'tiny',
            animationMode: 'warp',
            heroMode: 'giant',
            navigationMode: 'icons',
            showSmartHome: 'yes',
            showDiscovery: null,
            showFranchises: 1,
            advancedPlayerEnabled: undefined
        })).toEqual(DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES);
    });

    it('accepts supported theme and experience choices', () => {
        expect(sanitizeVelarisControlCenterPreferences({
            version: 99,
            themePreset: 'custom',
            customAccent: '#AABBCC',
            density: 'compact',
            animationMode: 'reduced',
            heroMode: 'compact',
            navigationMode: 'compact',
            showSmartHome: false,
            showDiscovery: false,
            showFranchises: false,
            advancedPlayerEnabled: false
        })).toEqual({
            version: 1,
            themePreset: 'custom',
            customAccent: '#aabbcc',
            density: 'compact',
            animationMode: 'reduced',
            heroMode: 'compact',
            navigationMode: 'compact',
            showSmartHome: false,
            showDiscovery: false,
            showFranchises: false,
            advancedPlayerEnabled: false
        });
    });

    it('scopes persisted preferences by server and user', () => {
        const storage = new MemoryStorage();
        saveVelarisControlCenterPreferences(storage, 'server-a', 'user-a', {
            ...DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES,
            themePreset: 'oled'
        });

        expect(readVelarisControlCenterPreferences(storage, 'server-a', 'user-a').themePreset).toBe('oled');
        expect(readVelarisControlCenterPreferences(storage, 'server-a', 'user-b').themePreset).toBe('default');
        expect(readVelarisControlCenterPreferences(storage, 'server-b', 'user-a').themePreset).toBe('default');
    });

    it('uses encoded stable storage keys', () => {
        expect(getVelarisControlCenterStorageKey('server/a', 'user b')).toBe(
            'velaris:control-center:v1:server%2Fa:user%20b'
        );
    });

    it('falls back safely when stored JSON is invalid', () => {
        const storage = new MemoryStorage();
        storage.setItem(getVelarisControlCenterStorageKey('server', 'user'), '{broken');

        expect(readVelarisControlCenterPreferences(storage, 'server', 'user')).toEqual(
            DEFAULT_VELARIS_CONTROL_CENTER_PREFERENCES
        );
    });
});
