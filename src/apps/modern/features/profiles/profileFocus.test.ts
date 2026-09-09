import { describe, expect, it } from 'vitest';

import {
    getVelarisDialogFocusableElements,
    getVelarisDialogFocusWrapTarget
} from './profileFocus';

describe('Velaris profile dialog focus', () => {
    it('collects usable controls while ignoring hidden and inert descendants', () => {
        document.body.innerHTML = `
            <div id="dialog" role="dialog">
                <button id="first">First</button>
                <div hidden><button id="hidden">Hidden</button></div>
                <div inert><button id="inert">Inert</button></div>
                <input id="input" />
                <button id="last">Last</button>
            </div>
        `;

        const dialog = document.querySelector('#dialog') as HTMLElement;
        expect(getVelarisDialogFocusableElements(dialog).map(element => element.id))
            .toEqual([ 'first', 'input', 'last' ]);
    });

    it('wraps Tab and Shift+Tab at modal boundaries', () => {
        document.body.innerHTML = `
            <div id="dialog">
                <button id="first">First</button>
                <button id="last">Last</button>
            </div>
        `;

        const dialog = document.querySelector('#dialog') as HTMLElement;
        const focusable = getVelarisDialogFocusableElements(dialog);
        const first = focusable[0];
        const last = focusable[1];

        expect(getVelarisDialogFocusWrapTarget(last, focusable, false)).toBe(first);
        expect(getVelarisDialogFocusWrapTarget(first, focusable, true)).toBe(last);
        expect(getVelarisDialogFocusWrapTarget(document.body, focusable, false)).toBe(first);
        expect(getVelarisDialogFocusWrapTarget(first, focusable, false)).toBeNull();
    });
});
