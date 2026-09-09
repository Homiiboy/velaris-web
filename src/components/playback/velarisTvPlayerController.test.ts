import { describe, expect, it } from 'vitest';

import { findVelarisTvPlayerFocusTarget } from './velarisTvPlayerFocus';

describe('Velaris TV player focus', () => {
    it('skips unavailable earlier controls and falls through to a usable action', () => {
        document.body.innerHTML = `
            <div id="osd">
                <button class="btnPause" disabled>Pause</button>
                <button class="btnPlayPause hide">Play/Pause hidden</button>
                <button class="btnVelarisAdvanced">Advanced</button>
                <button class="btnVideoOsdSettings">Settings</button>
            </div>
        `;

        const osd = document.querySelector('#osd') as HTMLElement;
        const target = findVelarisTvPlayerFocusTarget(
            osd,
            element => !element.hasAttribute('disabled') && !element.classList.contains('hide')
        );

        expect(target?.textContent).toBe('Advanced');
    });

    it('returns null when no player action is focusable', () => {
        document.body.innerHTML = `
            <div id="osd">
                <button class="btnPause" disabled>Pause</button>
            </div>
        `;

        const osd = document.querySelector('#osd') as HTMLElement;
        expect(findVelarisTvPlayerFocusTarget(osd, () => false)).toBeNull();
    });
});
