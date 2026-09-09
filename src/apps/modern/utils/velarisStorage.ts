export type VelarisStorageKind = 'localStorage' | 'sessionStorage';

export const getVelarisBrowserStorage = (kind: VelarisStorageKind): Storage | undefined => {
    if (typeof window === 'undefined') return undefined;

    try {
        return window[kind];
    } catch (error) {
        console.debug(`[VelarisStorage] ${kind} unavailable`, error);
        return undefined;
    }
};

export const getVelarisLocalStorage = () => getVelarisBrowserStorage('localStorage');
export const getVelarisSessionStorage = () => getVelarisBrowserStorage('sessionStorage');
