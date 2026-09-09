import { describe, expect, it } from 'vitest';

import { matchesVelarisDrawerRoute } from './appDrawerRouting';

const ROUTES = [
    'home',
    'discovery',
    'releases',
    'insights',
    'franchise/:hubId'
];

describe('Velaris app drawer routing', () => {
    it('supports dynamic Velaris routes', () => {
        expect(matchesVelarisDrawerRoute('/franchise/mcu', ROUTES)).toBe(true);
        expect(matchesVelarisDrawerRoute('/franchise/star-wars', ROUTES)).toBe(true);
    });

    it('supports standard user routes', () => {
        expect(matchesVelarisDrawerRoute('/home', ROUTES)).toBe(true);
        expect(matchesVelarisDrawerRoute('/discovery', ROUTES)).toBe(true);
        expect(matchesVelarisDrawerRoute('/releases', ROUTES)).toBe(true);
        expect(matchesVelarisDrawerRoute('/insights', ROUTES)).toBe(true);
    });

    it('does not match drawerless or unrelated routes', () => {
        expect(matchesVelarisDrawerRoute('/video', ROUTES)).toBe(false);
        expect(matchesVelarisDrawerRoute('/unknown', ROUTES)).toBe(false);
    });
});
