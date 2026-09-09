import Event from '@mui/icons-material/Event';
import Explore from '@mui/icons-material/Explore';
import Insights from '@mui/icons-material/Insights';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React, { type FC } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useVelarisControlCenterPreferences } from 'apps/modern/features/controlCenter/useVelarisControlCenterPreferences';
import { appRouter, PUBLIC_PATHS } from 'components/router/appRouter';
import BaseToolbar from 'components/toolbar/AppToolbar';
import ServerButton from 'components/toolbar/ServerButton';

import RemotePlayButton from './RemotePlayButton';
import SyncPlayButton from './SyncPlayButton';
import SearchButton from './SearchButton';
import UserViewNav from './userViews/UserViewNav';

interface AppToolbarProps {
    isDrawerAvailable: boolean
    isDrawerOpen: boolean
    onDrawerButtonClick: (event: React.MouseEvent<HTMLElement>) => void
}

const AppToolbar: FC<AppToolbarProps> = ({
    isDrawerAvailable,
    isDrawerOpen,
    onDrawerButtonClick
}) => {
    const location = useLocation();
    const { preferences } = useVelarisControlCenterPreferences();

    if (location.pathname === '/video') return null;

    const isBackButtonAvailable = window.NativeShell && appRouter.canGoBack(location.pathname);
    const isPublicPath = PUBLIC_PATHS.includes(location.pathname);
    const isDiscoverySelected = location.pathname === '/discovery';
    const isReleaseHubSelected = location.pathname === '/releases';
    const isInsightsSelected = location.pathname === '/insights';

    return (
        <BaseToolbar
            buttons={!isPublicPath && (
                <>
                    <SyncPlayButton />
                    <RemotePlayButton />
                    <SearchButton />
                </>
            )}
            isDrawerAvailable={isDrawerAvailable}
            isDrawerOpen={isDrawerOpen}
            onDrawerButtonClick={onDrawerButtonClick}
            isBackButtonAvailable={isBackButtonAvailable}
            isUserMenuAvailable={!isPublicPath}
            className='velaris-app-toolbar padded-left padded-right'
        >
            {!isDrawerAvailable && (
                <Stack
                    className='velaris-primary-nav'
                    direction='row'
                    spacing={0.25}
                >
                    <ServerButton />

                    {!isPublicPath && (
                        <>
                            <Button
                                className='velaris-release-hub-entry'
                                variant='text'
                                color={isReleaseHubSelected ? 'primary' : 'inherit'}
                                startIcon={<Event />}
                                component={Link}
                                to='/releases'
                            >
                                Releases
                            </Button>
                            <Button
                                className='velaris-insights-entry'
                                variant='text'
                                color={isInsightsSelected ? 'primary' : 'inherit'}
                                startIcon={<Insights />}
                                component={Link}
                                to='/insights'
                            >
                                Insights
                            </Button>
                            {preferences.showDiscovery && (
                                <Button
                                    className='velaris-discovery-entry'
                                    variant='text'
                                    color={isDiscoverySelected ? 'primary' : 'inherit'}
                                    startIcon={<Explore />}
                                    component={Link}
                                    to='/discovery'
                                >
                                    Entdecken
                                </Button>
                            )}
                            <UserViewNav />
                        </>
                    )}
                </Stack>
            )}
        </BaseToolbar>
    );
};

export default AppToolbar;
