import { describe, expect, it } from 'vitest';

import { isDrawerPath } from './AppDrawer';

describe('Velaris app drawer routing', () => {
    it('supports dynamic Velaris routes', () => {
        expect(isDrawerPath('/franchise/mcu')).toBe(true);
        expect(isDrawerPath('/franchise/star-wars')).toBe(true);
    });

    it('keeps standard user routes drawer-enabled', () => {
        expect(isDrawerPath('/home')).toBe(true);
        expect(isDrawerPath('/discovery')).toBe(true);
        expect(isDrawerPath('/releases')).toBe(true);
        expect(isDrawerPath('/insights')).toBe(true);
    });

    it('keeps the video player drawerless', () => {
        expect(isDrawerPath('/video')).toBe(false);
    });
});
