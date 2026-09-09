const TV_PLAYER_FOCUS_SELECTOR = [
    '.velaris-player-primary-action',
    '.btnPause',
    '.btnPlayPause',
    '.btnVelarisAdvanced',
    '.btnVideoOsdSettings'
].join(',');

export const findVelarisTvPlayerFocusTarget = (
    root: ParentNode,
    isFocusable: (element: HTMLElement) => boolean
) => (
    Array.from(root.querySelectorAll<HTMLElement>(TV_PLAYER_FOCUS_SELECTOR))
        .find(isFocusable) || null
);
