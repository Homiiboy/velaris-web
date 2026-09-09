import { describe, expect, it } from 'vitest';

import { getVelarisControlCenterStorageKey } from 'apps/modern/features/controlCenter/controlCenter';

import {
    DEFAULT_VELARIS_ADVANCED_PLAYER_PREFERENCES,
    formatVelarisChapterTime,
    getVelarisAdvancedPlayerStorageKey,
    getVelarisPlayMethodLabel,
    getVelarisQualityPreset,
    getVelarisQueueWindow,
    readVelarisAdvancedPlayerPreferences,
    sanitizeVelarisAdvancedPlayerPreferences
} from './velarisAdvancedPlayer';

class MemoryStorage {
    private readonly values = new Map<string, string>();

    getItem(key: string) {
        return this.values.get(key) ?? null;
    }

    setItem(key: string, value: string) {
        this.values.set(key, value);
    }
}

describe('Velaris advanced player preferences', () => {
    it('repairs malformed values', () => {
        expect(sanitizeVelarisAdvancedPlayerPreferences({
            version: 99,
            qualityPreset: 'ultra',
            technicalOverlay: 'yes',
            segmentTransitions: null
        })).toEqual(DEFAULT_VELARIS_ADVANCED_PLAYER_PREFERENCES);
    });

    it('scopes persisted player settings to server and user', () => {
        expect(getVelarisAdvancedPlayerStorageKey('server-a', 'user-a'))
            .not.toBe(getVelarisAdvancedPlayerStorageKey('server-b', 'user-a'));
        expect(getVelarisAdvancedPlayerStorageKey('server-a', 'user-a'))
            .not.toBe(getVelarisAdvancedPlayerStorageKey('server-a', 'user-b'));
    });

    it('reads valid persisted settings', () => {
        const storage = new MemoryStorage();
        storage.setItem(getVelarisAdvancedPlayerStorageKey('server', 'user'), JSON.stringify({
            version: 1,
            qualityPreset: 'balanced',
            technicalOverlay: true,
            segmentTransitions: false
        }));

        expect(readVelarisAdvancedPlayerPreferences(storage, 'server', 'user')).toEqual({
            version: 1,
            qualityPreset: 'balanced',
            technicalOverlay: true,
            segmentTransitions: false
        });
    });

    it('neutralizes advanced behavior while the Control Center feature is disabled', () => {
        const storage = new MemoryStorage();
        storage.setItem(getVelarisAdvancedPlayerStorageKey('server', 'user'), JSON.stringify({
            version: 1,
            qualityPreset: 'data-saver',
            technicalOverlay: true,
            segmentTransitions: true
        }));
        storage.setItem(getVelarisControlCenterStorageKey('server', 'user'), JSON.stringify({
            advancedPlayerEnabled: false
        }));

        expect(readVelarisAdvancedPlayerPreferences(storage, 'server', 'user')).toEqual({
            version: 1,
            qualityPreset: 'auto',
            technicalOverlay: false,
            segmentTransitions: false
        });
    });
});

describe('Velaris quality presets', () => {
    it('maps automatic and constrained presets to safe bitrate settings', () => {
        expect(getVelarisQualityPreset('auto')).toMatchObject({ automatic: true, maxBitrate: 0 });
        expect(getVelarisQualityPreset('data-saver')).toMatchObject({ automatic: false, maxBitrate: 8_000_000 });
    });
});

describe('Velaris advanced player presentation helpers', () => {
    it('uses viewer-facing playback method labels', () => {
        expect(getVelarisPlayMethodLabel('DirectPlay')).toBe('Direct Play');
        expect(getVelarisPlayMethodLabel('DirectStream')).toBe('Remux');
        expect(getVelarisPlayMethodLabel('Transcode')).toBe('Transcoding');
        expect(getVelarisPlayMethodLabel()).toBe('Unbekannt');
    });

    it('formats chapter timestamps with and without hours', () => {
        expect(formatVelarisChapterTime(650_000_000)).toBe('1:05');
        expect(formatVelarisChapterTime(37_250_000_000)).toBe('1:02:05');
    });

    it('returns only upcoming queue entries', () => {
        expect(getVelarisQueueWindow([ 'one', 'two', 'three', 'four' ], 1, 2))
            .toEqual([ 'three', 'four' ]);
        expect(getVelarisQueueWindow([ 'one' ], 0, 5)).toEqual([]);
    });
});
