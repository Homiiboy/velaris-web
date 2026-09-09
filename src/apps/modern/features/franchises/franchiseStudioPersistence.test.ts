import { describe, expect, it } from 'vitest';

import {
    EMPTY_FRANCHISE_STUDIO_CONFIG,
    type FranchiseStudioConfig
} from './franchiseStudio';
import {
    getVelarisFranchiseStudioStorageKey,
    getVelarisLegacyFranchiseStudioStorageKey,
    readVelarisFranchiseStudioConfig,
    saveVelarisFranchiseStudioConfig
} from './franchiseStudioPersistence';

class MemoryStorage {
    private readonly values = new Map<string, string>();

    getItem(key: string) {
        return this.values.get(key) ?? null;
    }

    setItem(key: string, value: string) {
        this.values.set(key, value);
    }
}

const createConfig = (itemId: string): FranchiseStudioConfig => ({
    ...EMPTY_FRANCHISE_STUDIO_CONFIG,
    overrides: {
        mcu: {
            groups: [],
            assignments: {},
            excludedItemIds: [ itemId ],
            groupOrder: [],
            itemOrder: {}
        }
    }
});

describe('Franchise Studio persistence', () => {
    it('scopes configuration by server and user', () => {
        expect(getVelarisFranchiseStudioStorageKey('server-a', 'user-a'))
            .not.toBe(getVelarisFranchiseStudioStorageKey('server-b', 'user-a'));
        expect(getVelarisFranchiseStudioStorageKey('server-a', 'user-a'))
            .not.toBe(getVelarisFranchiseStudioStorageKey('server-a', 'user-b'));
    });

    it('migrates the V0.x user-only key into the server-scoped key', () => {
        const storage = new MemoryStorage();
        storage.setItem(
            getVelarisLegacyFranchiseStudioStorageKey('user'),
            JSON.stringify(createConfig('legacy-item'))
        );

        const migrated = readVelarisFranchiseStudioConfig(storage, 'server', 'user');

        expect(migrated.overrides.mcu.excludedItemIds).toEqual([ 'legacy-item' ]);
        expect(storage.getItem(getVelarisFranchiseStudioStorageKey('server', 'user'))).toBe(
            JSON.stringify(migrated)
        );
    });

    it('prefers server-scoped data after migration', () => {
        const storage = new MemoryStorage();
        storage.setItem(
            getVelarisLegacyFranchiseStudioStorageKey('user'),
            JSON.stringify(createConfig('legacy-item'))
        );
        storage.setItem(
            getVelarisFranchiseStudioStorageKey('server', 'user'),
            JSON.stringify(createConfig('server-item'))
        );

        expect(readVelarisFranchiseStudioConfig(storage, 'server', 'user').overrides.mcu.excludedItemIds)
            .toEqual([ 'server-item' ]);
    });

    it('sanitizes saves and fails safely without browser storage', () => {
        const storage = new MemoryStorage();
        const duplicateConfig = createConfig('one');
        duplicateConfig.overrides.mcu.excludedItemIds.push('one');

        expect(saveVelarisFranchiseStudioConfig(storage, 'server', 'user', duplicateConfig)).toBe(true);
        expect(readVelarisFranchiseStudioConfig(storage, 'server', 'user').overrides.mcu.excludedItemIds)
            .toEqual([ 'one' ]);
        expect(readVelarisFranchiseStudioConfig(undefined, 'server', 'user'))
            .toEqual(EMPTY_FRANCHISE_STUDIO_CONFIG);
        expect(saveVelarisFranchiseStudioConfig(undefined, 'server', 'user', EMPTY_FRANCHISE_STUDIO_CONFIG))
            .toBe(false);
    });
});
