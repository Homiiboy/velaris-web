import { describe, expect, it } from 'vitest';

import {
    clearVelarisProfileChoice,
    DEFAULT_VELARIS_PROFILE_PREFERENCES,
    getChosenVelarisProfileId,
    getVelarisProfileStorageKey,
    isValidVelarisProfilePin,
    markVelarisProfileChosen,
    readVelarisProfilePreferences,
    sanitizeVelarisProfilePreferences,
    shouldShowVelarisProfilePicker
} from './profiles';

class MemoryStorage {
    private readonly values = new Map<string, string>();

    getItem(key: string) {
        return this.values.get(key) ?? null;
    }

    setItem(key: string, value: string) {
        this.values.set(key, value);
    }

    removeItem(key: string) {
        this.values.delete(key);
    }
}

describe('Velaris profile preferences', () => {
    it('sanitizes malformed stored preferences', () => {
        expect(sanitizeVelarisProfilePreferences({
            version: 99,
            accent: 'unknown',
            kidsMode: 'yes'
        })).toEqual(DEFAULT_VELARIS_PROFILE_PREFERENCES);
    });

    it('scopes preferences by server and user', () => {
        expect(getVelarisProfileStorageKey('server-a', 'user-a'))
            .not.toBe(getVelarisProfileStorageKey('server-b', 'user-a'));
        expect(getVelarisProfileStorageKey('server-a', 'user-a'))
            .not.toBe(getVelarisProfileStorageKey('server-a', 'user-b'));
    });

    it('reads a valid persisted accent and kids mode', () => {
        const storage = new MemoryStorage();
        storage.setItem(getVelarisProfileStorageKey('server', 'user'), JSON.stringify({
            version: 2,
            accent: 'violet',
            kidsMode: true
        }));

        expect(readVelarisProfilePreferences(storage, 'server', 'user')).toEqual({
            version: 2,
            accent: 'violet',
            kidsMode: true
        });
    });
});

describe('Velaris profile startup flow', () => {
    const profiles = [
        { Id: 'one', Name: 'One' },
        { Id: 'two', Name: 'Two', HasPassword: true }
    ];

    it('shows the picker once until the active profile is acknowledged', () => {
        expect(shouldShowVelarisProfilePicker(profiles, 'one', null)).toBe(true);
        expect(shouldShowVelarisProfilePicker(profiles, 'one', 'one')).toBe(false);
    });

    it('does not show a chooser for a single or hidden active profile', () => {
        expect(shouldShowVelarisProfilePicker([ profiles[0] ], 'one', null)).toBe(false);
        expect(shouldShowVelarisProfilePicker(profiles, 'hidden', null)).toBe(false);
    });

    it('records the selected profile only for the active server session', () => {
        const storage = new MemoryStorage();
        markVelarisProfileChosen(storage, 'server-a', 'one');
        expect(shouldShowVelarisProfilePicker(profiles, 'one', storage.getItem('velaris:profiles:startup:v1:server-a'))).toBe(false);
        expect(shouldShowVelarisProfilePicker(profiles, 'one', storage.getItem('velaris:profiles:startup:v1:server-b'))).toBe(true);
    });

    it('reopens the chooser after the active server profile choice is cleared', () => {
        const storage = new MemoryStorage();
        markVelarisProfileChosen(storage, 'server-a', 'one');
        expect(getChosenVelarisProfileId(storage, 'server-a')).toBe('one');

        clearVelarisProfileChoice(storage, 'server-a');

        const chosenProfileId = getChosenVelarisProfileId(storage, 'server-a');
        expect(chosenProfileId).toBeNull();
        expect(shouldShowVelarisProfilePicker(profiles, 'one', chosenProfileId)).toBe(true);
    });
});

describe('Velaris profile PIN validation', () => {
    it('accepts numeric PINs from four through eight digits', () => {
        expect(isValidVelarisProfilePin('1234')).toBe(true);
        expect(isValidVelarisProfilePin('12345678')).toBe(true);
    });

    it('rejects short, long and non-numeric values', () => {
        expect(isValidVelarisProfilePin('123')).toBe(false);
        expect(isValidVelarisProfilePin('123456789')).toBe(false);
        expect(isValidVelarisProfilePin('12a4')).toBe(false);
    });
});
