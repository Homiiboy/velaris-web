import { describe, expect, it } from 'vitest';

import {
    findVelarisTvFocusTarget,
    getVelarisViewportClass,
    hasVelarisBlockingOverlay,
    shouldRestoreVelarisTvFocus
} from './velarisTvExperience';

describe('Velaris TV focus helpers', () => {
    it('prefers an explicit TV focus target and ignores hidden or inert targets', () => {
        document.body.innerHTML = `
            <main id="main">
                <button class="hide" data-velaris-tv-focus="primary">Hidden</button>
                <div inert><button data-velaris-tv-focus="primary">Inert</button></div>
                <a href="/home" aria-current="page">Current</a>
                <button data-velaris-tv-focus="primary">Primary</button>
            </main>
        `;

        const main = document.querySelector('#main');
        expect(main).not.toBeNull();
        expect(findVelarisTvFocusTarget(main as HTMLElement)?.textContent).toBe('Primary');
    });

    it('keeps focus inside active content and dialogs', () => {
        document.body.innerHTML = `
            <main id="main"><button id="inside">Inside</button></main>
            <div role="dialog"><button id="dialog">Dialog</button></div>
            <button id="outside">Outside</button>
        `;

        const main = document.querySelector('#main') as HTMLElement;
        const inside = document.querySelector('#inside');
        const dialog = document.querySelector('#dialog');
        const outside = document.querySelector('#outside');

        expect(shouldRestoreVelarisTvFocus(inside, main)).toBe(false);
        expect(shouldRestoreVelarisTvFocus(dialog, main)).toBe(false);
        expect(shouldRestoreVelarisTvFocus(outside, main)).toBe(true);
    });

    it('detects blocking modal overlays before restoring TV focus', () => {
        document.body.innerHTML = `
            <main id="main"><button>Content</button></main>
            <div role="dialog" aria-modal="true">Profile chooser</div>
        `;

        expect(hasVelarisBlockingOverlay(document)).toBe(true);
        document.querySelector('[role="dialog"]')?.remove();
        expect(hasVelarisBlockingOverlay(document)).toBe(false);
    });

    it('classifies compact, tablet and desktop viewports', () => {
        expect(getVelarisViewportClass(480)).toBe('compact');
        expect(getVelarisViewportClass(900)).toBe('tablet');
        expect(getVelarisViewportClass(1600)).toBe('desktop');
    });
});
