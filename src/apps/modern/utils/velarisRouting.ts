export type VelarisHomeTabIndex = 0 | 1;

/**
 * Convert legacy hash-prefixed application routes into React Router paths
 * without corrupting already-modern routes.
 */
export const toReactRoute = (url: string) => {
    if (url.startsWith('#!')) return url.substring(2);
    if (url.startsWith('#')) return url.substring(1);
    return url;
};

export const parseVelarisHomeTabIndex = (
    value: string | null | undefined
): VelarisHomeTabIndex => value === '1' ? 1 : 0;

export const isVelarisHomeTabIndex = (
    value: number
): value is VelarisHomeTabIndex => value === 0 || value === 1;
