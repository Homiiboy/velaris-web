import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import focusManager from 'components/focusManager';
import layoutManager from 'components/layoutManager';
import Events from 'utils/events';

import {
    findVelarisTvFocusTarget,
    getVelarisViewportClass,
    shouldRestoreVelarisTvFocus
} from './velarisTvExperience';

const TV_FOCUS_DELAY_MS = 80;

const VelarisAppExperience = () => {
    const location = useLocation();
    const [ isOnline, setIsOnline ] = useState(() => navigator.onLine);
    const [ isTv, setIsTv ] = useState(() => Boolean(layoutManager.tv));
    const [ viewportClass, setViewportClass ] = useState(() => getVelarisViewportClass(window.innerWidth));

    const syncNetworkState = useCallback(() => {
        setIsOnline(navigator.onLine);
    }, []);

    const syncLayoutState = useCallback(() => {
        setIsTv(Boolean(layoutManager.tv));
    }, []);

    const syncViewport = useCallback(() => {
        setViewportClass(getVelarisViewportClass(window.innerWidth));
    }, []);

    const onRetryConnection = useCallback(() => {
        if (navigator.onLine) {
            window.location.reload();
            return;
        }

        setIsOnline(false);
    }, []);

    useEffect(() => {
        window.addEventListener('online', syncNetworkState);
        window.addEventListener('offline', syncNetworkState);
        window.addEventListener('focus', syncNetworkState);
        window.addEventListener('resize', syncViewport);
        Events.on(layoutManager, 'modechange', syncLayoutState);

        return () => {
            window.removeEventListener('online', syncNetworkState);
            window.removeEventListener('offline', syncNetworkState);
            window.removeEventListener('focus', syncNetworkState);
            window.removeEventListener('resize', syncViewport);
            Events.off(layoutManager, 'modechange', syncLayoutState);
        };
    }, [ syncLayoutState, syncNetworkState, syncViewport ]);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('velaris-tv-experience', isTv);
        root.classList.toggle('velaris-offline', !isOnline);
        root.dataset.velarisViewport = viewportClass;

        return () => {
            root.classList.remove('velaris-tv-experience', 'velaris-offline');
            delete root.dataset.velarisViewport;
        };
    }, [ isOnline, isTv, viewportClass ]);

    useEffect(() => {
        const root = document.documentElement;
        const readyTimer = window.setTimeout(() => {
            root.classList.add('velaris-app-ready');
        }, 0);

        return () => {
            window.clearTimeout(readyTimer);
            root.classList.remove('velaris-app-ready');
        };
    }, []);

    useEffect(() => {
        if (!isTv) return;

        const focusTimer = window.setTimeout(() => {
            const main = document.querySelector<HTMLElement>('.velaris-app-main');
            if (!main || !shouldRestoreVelarisTvFocus(document.activeElement, main)) return;

            const target = findVelarisTvFocusTarget(main);
            if (target) focusManager.focus(target);
        }, TV_FOCUS_DELAY_MS);

        return () => window.clearTimeout(focusTimer);
    }, [ isTv, location.pathname ]);

    if (isOnline) return null;

    return (
        <aside
            className='velaris-connectivity-banner'
            role='status'
            aria-live='polite'
        >
            <span className='material-icons wifi_off' aria-hidden='true' />
            <span className='velaris-connectivity-banner__copy'>
                <strong>Keine Netzwerkverbindung</strong>
                <span>Velaris verbindet sich automatisch wieder, sobald das Gerät online ist.</span>
            </span>
            <button
                type='button'
                className='velaris-connectivity-banner__action'
                onClick={onRetryConnection}
            >
                Verbindung prüfen
            </button>
        </aside>
    );
};

export default VelarisAppExperience;
