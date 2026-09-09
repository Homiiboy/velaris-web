const FOCUSABLE_SELECTOR = [
    'button:not(:disabled):not([tabindex="-1"])',
    'input:not(:disabled):not([tabindex="-1"])',
    'select:not(:disabled):not([tabindex="-1"])',
    'textarea:not(:disabled):not([tabindex="-1"])',
    'a[href]:not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

const hasUnavailableAncestor = (element: HTMLElement, boundary: HTMLElement) => {
    let current: HTMLElement | null = element;

    while (current) {
        if (current.hidden
            || current.hasAttribute('inert')
            || current.getAttribute('aria-hidden') === 'true'
        ) {
            return true;
        }
        if (current === boundary) break;
        current = current.parentElement;
    }

    return false;
};

export const getVelarisDialogFocusableElements = (dialog: HTMLElement) => (
    Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter(element => !hasUnavailableAncestor(element, dialog))
);

export const getVelarisDialogFocusWrapTarget = (
    activeElement: Element | null,
    focusableElements: HTMLElement[],
    shiftKey: boolean
) => {
    if (focusableElements.length === 0) return null;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const activeIndex = activeElement ? focusableElements.indexOf(activeElement as HTMLElement) : -1;

    if (shiftKey && (activeIndex <= 0)) return last;
    if (!shiftKey && (activeIndex < 0 || activeElement === last)) return first;
    return null;
};
