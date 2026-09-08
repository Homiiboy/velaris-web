import { describe, expect, it } from 'vitest';

import {
    isVelarisHomeTabIndex,
    parseVelarisHomeTabIndex,
    toReactRoute
} from './velarisRouting';

describe('toReactRoute', () => {
    it('converts legacy hash routes', () => {
        expect(toReactRoute('#/details?id=1')).toBe('/details?id=1');
        expect(toReactRoute('#!/details?id=1')).toBe('/details?id=1');
    });

    it('keeps modern routes intact', () => {
        expect(toReactRoute('/home')).toBe('/home');
    });
});

describe('parseVelarisHomeTabIndex', () => {
    it('only accepts the favorites tab explicitly', () => {
        expect(parseVelarisHomeTabIndex('1')).toBe(1);
        expect(parseVelarisHomeTabIndex('0')).toBe(0);
        expect(parseVelarisHomeTabIndex('99')).toBe(0);
        expect(parseVelarisHomeTabIndex('invalid')).toBe(0);
        expect(parseVelarisHomeTabIndex(null)).toBe(0);
    });
});

describe('isVelarisHomeTabIndex', () => {
    it('only accepts supported tab indexes', () => {
        expect(isVelarisHomeTabIndex(0)).toBe(true);
        expect(isVelarisHomeTabIndex(1)).toBe(true);
        expect(isVelarisHomeTabIndex(-1)).toBe(false);
        expect(isVelarisHomeTabIndex(2)).toBe(false);
    });
});
