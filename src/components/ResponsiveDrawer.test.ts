import { describe, expect, it } from 'vitest';

import { shouldCloseResponsiveDrawerOnKey } from './ResponsiveDrawer';

describe('ResponsiveDrawer keyboard behavior', () => {
    it('keeps navigation keys inside the drawer', () => {
        expect(shouldCloseResponsiveDrawerOnKey('Tab')).toBe(false);
        expect(shouldCloseResponsiveDrawerOnKey('ArrowDown')).toBe(false);
        expect(shouldCloseResponsiveDrawerOnKey('ArrowUp')).toBe(false);
        expect(shouldCloseResponsiveDrawerOnKey('Enter')).toBe(false);
    });

    it('closes only on Escape', () => {
        expect(shouldCloseResponsiveDrawerOnKey('Escape')).toBe(true);
    });
});
