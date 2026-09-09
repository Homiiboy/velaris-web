import { describe, expect, it } from 'vitest';

import {
    DEFAULT_SMART_HOME_PREFERENCES,
    type SmartHomePreferences
} from './smartHome';
import {
    getVelarisLegacySmartHomeStorageKey,
    getVelarisSmartHomeStorageKey,
    readVelarisSmartHomePreferences,
    saveVelarisSmartHomePreferences
} from './smartHomePersistence';

class MemoryStorage {
    private readonly values = new Map<string, string>();

    getItem(key: string) {
        return this.values.get(key) ?? null;
    }

    setItem(key: string, value: string) {
        this.values.set(key, value);
    }
}

const createPreferences = (disabled: SmartHomePreferences['disabled']): SmartHomePreferences => ({
    ...DEFAULT_SMART_HOME_PREFERENCES,
    disabled
});

describe('Velaris Smart Home persistence', () => {
    it('scopes preferences by server and user', () => {
        expect(getVelarisSmartHomeStorageKey('server-a', 'user-a'))
            .not.toBe(getVelarisSmartHomeStorageKey('server-b', 'user-a'));
        expect(getVelarisSmartHomeStorageKey('server-a', 'user-a'))
            .not.toBe(getVelarisSmartHomeStorageKey('server-a', 'user-b'));
    });

    it('migrates the V0.x user-only key into the server-scoped key', () => {
        const storage = new MemoryStorage();
        storage.setItem(
            getVelarisLegacySmartHomeStorageKey('user'),
            JSON.stringify(createPreferences([ 'short' ]))
        );

        const migrated = readVelarisSmartHomePreferences(storage, 'server', 'user');

        expect(migrated.disabled).toEqual([ 'short' ]);
        expect(storage.getItem(getVelarisSmartHomeStorageKey('server', 'user'))).toBe(
            JSON.stringify(migrated)
        );
    });

    it('prefers server-scoped preferences after migration', () => {
        const storage = new MemoryStorage();
        storage.setItem(
            getVelarisLegacySmartHomeStorageKey('user'),
            JSON.stringify(createPreferences([ 'short' ]))
        );
        storage.setItem(
            getVelarisSmartHomeStorageKey('server', 'user'),
            JSON.stringify(createPreferences([ 'because' ]))
        );

        expect(readVelarisSmartHomePreferences(storage, 'server', 'user').disabled).toEqual([ 'because' ]);
    });

    it('sanitizes saves and fails safely without browser storage', () => {
        const storage = new MemoryStorage();
        expect(saveVelarisSmartHomePreferences(storage, 'server', 'user', {
            order: [ 'continue', 'continue', 'short' ],
            disabled: [ 'short', 'short' ]
        })).toBe(true);

        const restored = readVelarisSmartHomePreferences(storage, 'server', 'user');
        expect(restored.order).toEqual([ 'continue', 'short', 'because', 'tonight', 'unwatched' ]);
        expect(restored.disabled).toEqual([ 'short' ]);
        expect(readVelarisSmartHomePreferences(undefined, 'server', 'user'))
            .toEqual(DEFAULT_SMART_HOME_PREFERENCES);
        expect(saveVelarisSmartHomePreferences(undefined, 'server', 'user', DEFAULT_SMART_HOME_PREFERENCES))
            .toBe(false);
    });
});
