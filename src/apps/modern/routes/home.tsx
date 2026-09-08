import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import VelarisFranchiseShelf from 'apps/modern/features/franchises/VelarisFranchiseShelf';
import VelarisHomeDestinations from 'apps/modern/features/home/VelarisHomeDestinations';
import VelarisHomeHero from 'apps/modern/features/home/VelarisHomeHero';
import {
    isVelarisHomeTabIndex,
    parseVelarisHomeTabIndex,
    type VelarisHomeTabIndex
} from 'apps/modern/utils/velarisRouting';
import globalize from '../../../lib/globalize';
import { clearBackdrop } from '../../../components/backdrop/backdrop';
import layoutManager from '../../../components/layoutManager';
import Page from '../../../components/Page';
import { EventType } from 'constants/eventType';
import Events from 'utils/events';

import '../../../elements/emby-tabs/emby-tabs';
import '../../../elements/emby-button/emby-button';
import '../../../elements/emby-scroller/emby-scroller';

type OnResumeOptions = {
    autoFocus?: boolean;
    refresh?: boolean
};

type ControllerProps = {
    onResume: (
        options: OnResumeOptions
    ) => void;
    refreshed: boolean;
    onPause: () => void;
    destroy: () => void;
};

const Home = () => {
    const [ searchParams ] = useSearchParams();
    const initialTabIndex = parseVelarisHomeTabIndex(searchParams.get('tab'));

    const libraryMenu = useMemo(async () => ((await import('../../../scripts/libraryMenu')).default), []);
    const mainTabsManager = useMemo(() => import('../../../components/maintabsmanager'), []);
    const tabController = useRef<ControllerProps | null>();
    const tabControllers = useMemo<ControllerProps[]>(() => [], []);

    const documentRef = useRef<Document>(document);
    const element = useRef<HTMLDivElement>(null);

    const setTitle = useCallback(async () => {
        (await libraryMenu).setTitle(null);
    }, [ libraryMenu ]);

    const getTabs = () => {
        return [{
            name: globalize.translate('Home')
        }, {
            name: globalize.translate('Favorites')
        }];
    };

    const getTabContainers = () => {
        return element.current?.querySelectorAll('.tabContent');
    };

    const getTabController = useCallback((index: VelarisHomeTabIndex) => {
        const depends = index === 0 ? 'hometab' : 'favorites';

        return import(/* webpackChunkName: "[request]" */ `../../../apps/legacy/controllers/${depends}`).then(({ default: ControllerFactory }) => {
            let controller = tabControllers[index];

            if (!controller) {
                const tabContent = element.current?.querySelector(".tabContent[data-index='" + index + "']");
                if (!tabContent) {
                    throw new Error(`[Home] missing tab container for index ${index}`);
                }

                controller = new ControllerFactory(tabContent, null);
                tabControllers[index] = controller;
            }

            return controller;
        });
    }, [ tabControllers ]);

    const loadTab = useCallback((index: VelarisHomeTabIndex, previousIndex: VelarisHomeTabIndex | null) => {
        getTabController(index).then((controller) => {
            const refresh = !controller.refreshed;

            controller.onResume({
                autoFocus: previousIndex == null && layoutManager.tv,
                refresh: refresh
            });

            controller.refreshed = true;
            tabController.current = controller;
        }).catch(err => {
            console.error('[Home] failed to get tab controller', err);
        });
    }, [ getTabController ]);

    const onTabChange = useCallback((e: { detail: { selectedTabIndex: string; previousIndex: number | null }; }) => {
        const newIndex = parseInt(e.detail.selectedTabIndex, 10);
        if (!isVelarisHomeTabIndex(newIndex)) {
            console.warn('[Home] ignoring unsupported tab index', e.detail.selectedTabIndex);
            return;
        }

        const previousIndex = e.detail.previousIndex;
        const validPreviousIndex = previousIndex != null && isVelarisHomeTabIndex(previousIndex) ?
            previousIndex :
            null;

        const previousTabController = validPreviousIndex == null ? null : tabControllers[validPreviousIndex];
        if (previousTabController?.onPause) {
            previousTabController.onPause();
        }

        loadTab(newIndex, validPreviousIndex);
    }, [ loadTab, tabControllers ]);

    const onSetTabs = useCallback(async () => {
        (await mainTabsManager).setTabs(element.current, initialTabIndex, getTabs, getTabContainers, null, onTabChange, false);
    }, [ initialTabIndex, mainTabsManager, onTabChange ]);

    const onResume = useCallback(async () => {
        void setTitle();
        clearBackdrop();

        const currentTabController = tabController.current;

        if (!currentTabController) {
            (await mainTabsManager).selectedTabIndex(initialTabIndex);
        } else if (currentTabController?.onResume) {
            currentTabController.onResume({});
        }

        const header = documentRef.current.querySelector('.skinHeader');
        header?.classList.add('noHomeButtonHeader', 'velaris-home-active');
    }, [ initialTabIndex, mainTabsManager, setTitle ]);

    const onPause = useCallback(() => {
        const currentTabController = tabController.current;
        if (currentTabController?.onPause) {
            currentTabController.onPause();
        }

        const header = documentRef.current.querySelector('.skinHeader');
        header?.classList.remove('noHomeButtonHeader', 'velaris-home-active');
    }, []);

    const renderHome = useCallback(() => {
        void onSetTabs();
        void onResume();
    }, [ onResume, onSetTabs ]);

    useEffect(() => {
        if (documentRef.current?.querySelector('.headerTabs')) {
            renderHome();
        }

        return () => {
            onPause();
        };
    }, [ onPause, renderHome ]);

    useEffect(() => {
        const doc = documentRef.current;
        if (doc) Events.on(doc, EventType.HEADER_RENDERED, renderHome);

        return () => {
            if (doc) Events.off(doc, EventType.HEADER_RENDERED, renderHome);
        };
    }, [ renderHome ]);

    return (
        <div ref={element}>
            <Page
                id='indexPage'
                className='mainAnimatedPage homePage libraryPage allLibraryPage pageWithAbsoluteTabs withTabs velaris-home-page'
                isBackButtonEnabled={false}
                backDropType={[
                    BaseItemKind.Movie,
                    BaseItemKind.Series,
                    BaseItemKind.Book
                ]}
            >
                <div
                    className='tabContent pageTabContent velaris-home-tab'
                    id='homeTab'
                    data-index='0'
                >
                    <VelarisHomeHero />
                    <VelarisHomeDestinations />

                    <div className='velaris-home-rows'>
                        <div className='sections velaris-home__legacy'></div>
                        <VelarisFranchiseShelf />
                    </div>
                </div>

                <div
                    className='tabContent pageTabContent velaris-favorites-tab'
                    id='favoritesTab'
                    data-index='1'
                >
                    <div className='sections'></div>
                </div>
            </Page>
        </div>
    );
};

export default Home;
