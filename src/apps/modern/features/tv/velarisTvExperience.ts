export type VelarisViewportClass = 'compact' | 'tablet' | 'desktop';

const PRIMARY_FOCUS_SELECTOR = '[data-velaris-tv-focus="primary"]';
const CURRENT_PAGE_SELECTOR = '[aria-current="page"]';
const SELECTED_SELECTOR = '.Mui-selected';
const FALLBACK_FOCUS_SELECTOR = [
    'button:not(:disabled):not([tabindex="-1"])',
    'a[href]:not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])',
    '.focusable'
].join(',');

const hasUnavailableAncestor = (element: HTMLElement) => {
    let current: HTMLElement | null = element;

    while (current) {
        if (current.hidden
            || current.getAttribute('aria-hidden') === 'true'
            || current.classList.contains('hide')
        ) {
            return true;
        }
        current = current.parentElement;
    }

    return false;
};

const hasDialogAncestor = (element: Element) => {
    let current: Element | null = element;

    while (current) {
        const isOpenDialog = current.tagName === 'DIALOG' && current.hasAttribute('open');
        if (isOpenDialog || current.getAttribute('role') === 'dialog') return true;
        current = current.parentElement;
    }

    return false;
};

const isUnavailable = (element: HTMLElement) => {
    if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
        return true;
    }

    return hasUnavailableAncestor(element);
};

const findFirstAvailable = (root: ParentNode, selector: string) => {
    const candidates = root.querySelectorAll<HTMLElement>(selector);
    return Array.from(candidates).find(candidate => !isUnavailable(candidate));
};

export const findVelarisTvFocusTarget = (root: ParentNode) => (
    findFirstAvailable(root, PRIMARY_FOCUS_SELECTOR)
    || findFirstAvailable(root, CURRENT_PAGE_SELECTOR)
    || findFirstAvailable(root, SELECTED_SELECTOR)
    || findFirstAvailable(root, FALLBACK_FOCUS_SELECTOR)
    || null
);

export const shouldRestoreVelarisTvFocus = (
    activeElement: Element | null,
    main: HTMLElement
) => {
    if (!activeElement || activeElement === document.body) return true;
    if (hasDialogAncestor(activeElement)) return false;
    if (main.contains(activeElement)) return false;
    return true;
};

export const getVelarisViewportClass = (width: number): VelarisViewportClass => {
    if (width < 600) return 'compact';
    if (width < 1200) return 'tablet';
    return 'desktop';
};
