import { describe, expect, it } from 'vitest';

import {
    EMPTY_DISCOVERY_STORE,
    type VelarisDiscoveryStore
} from './discovery';
import {
    getVelarisDiscoveryStorageKey,
    getVelarisLegacyDiscoveryStorageKey,
    readVelarisDiscoveryStore,
    saveVelarisDiscoveryStore
} from './discoveryStorePersistence';

class MemoryStorage {
    private readonly values = new Map<string, string>();

    getItem(key: string) {
        return this.values.get(key) ?? null;
    }

    setItem(key: string, value: string) {
        this.values.set(key, value);
    }
}

const createStore = (itemId: string): VelarisDiscoveryStore => ({
    ...EMPTY_DISCOVERY_STORE,
    watchlist: [ itemId ]
});

describe('Velaris Discovery persistence', () => {
    it('scopes list storage by server and user', () => {
        expect(getVelarisDiscoveryStorageKey('server-a', 'user-a'))
            .not.toBe(getVelarisDiscoveryStorageKey('server-b', 'user-a'));
        expect(getVelarisDiscoveryStorageKey('server-a', 'user-a'))
            .not.toBe(getVelarisDiscoveryStorageKey('server-a', 'user-b'));
    });

    it('migrates the V0.x user-only key into the server-scoped V1 key', () => {
        const storage = new MemoryStorage();
        storage.setItem(
            getVelarisLegacyDiscoveryStorageKey('user'),
            JSON.stringify(createStore('legacy-item'))
        );

        const migrated = readVelarisDiscoveryStore(storage, 'server', 'user');

        expect(migrated.watchlist).toEqual([ 'legacy-item' ]);
        expect(storage.getItem(getVelarisDiscoveryStorageKey('server', 'user'))).toBe(
            JSON.stringify(migrated)
        );
    });

    it('prefers already migrated server-scoped data over the legacy fallback', () => {
        const storage = new MemoryStorage();
        storage.setItem(
            getVelarisLegacyDiscoveryStorageKey('user'),
            JSON.stringify(createStore('legacy-item'))
        );
        storage.setItem(
            getVelarisDiscoveryStorageKey('server', 'user'),
            JSON.stringify(createStore('server-item'))
        );

        expect(readVelarisDiscoveryStore(storage, 'server', 'user').watchlist).toEqual([ 'server-item' ]);
    });

    it('sanitizes data before saving and fails safely without browser storage', () => {
        const storage = new MemoryStorage();
        expect(saveVelarisDiscoveryStore(storage, 'server', 'user', {
            version: 99,
            watchlist: [ 'one', 'one' ],
            customLists: []
        } as VelarisDiscoveryStore)).toBe(true);

        expect(readVelarisDiscoveryStore(storage, 'server', 'user').watchlist).toEqual([ 'one' ]);
        expect(readVelarisDiscoveryStore(undefined, 'server', 'user')).toEqual(EMPTY_DISCOVERY_STORE);
        expect(saveVelarisDiscoveryStore(undefined, 'server', 'user', EMPTY_DISCOVERY_STORE)).toBe(false);
    });
});
