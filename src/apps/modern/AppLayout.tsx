import React, { StrictMode, useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { type Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import AppBody from 'components/AppBody';
import CustomCss from 'components/CustomCss';
import OffsetAppBar from 'components/OffsetAppBar';
import ThemeCss from 'components/ThemeCss';
import { useApi } from 'hooks/useApi';

import AppToolbar from './components/AppToolbar';
import AppDrawer, { isDrawerPath } from './components/drawers/AppDrawer';
import { isVelarisControlCenterRouteEnabled } from './features/controlCenter/controlCenter';
import { useVelarisControlCenterPreferences } from './features/controlCenter/useVelarisControlCenterPreferences';
import VelarisProfileGate from './features/profiles/VelarisProfileGate';
import { useVelarisProfilePreferences } from './features/profiles/useVelarisProfilePreferences';
import VelarisAppExperience from './features/tv/VelarisAppExperience';
import LibraryToolbar from './features/libraries/components/LibraryToolbar';
import { LibraryProvider } from './features/libraries/hooks/useLibrary';
import { isLibraryPath } from './features/libraries/utils/path';

import './AppOverrides.scss';

export const Component = () => {
    const [ isDrawerActive, setIsDrawerActive ] = useState(false);
    const { user } = useApi();
    const location = useLocation();
    useVelarisProfilePreferences();
    const { preferences: controlCenterPreferences } = useVelarisControlCenterPreferences();

    const isMediumScreen = useMediaQuery((t: Theme) => t.breakpoints.up('md'));
    const isDrawerAvailable = isDrawerPath(location.pathname) && Boolean(user) && !isMediumScreen;
    const isDrawerOpen = isDrawerActive && isDrawerAvailable;

    useEffect(() => {
        setIsDrawerActive(false);
    }, [ location.pathname, location.search ]);

    const onToggleDrawer = useCallback(() => {
        setIsDrawerActive(current => !current);
    }, []);

    const onOpenDrawer = useCallback(() => {
        setIsDrawerActive(true);
    }, []);

    const onCloseDrawer = useCallback(() => {
        setIsDrawerActive(false);
    }, []);

    if (!isVelarisControlCenterRouteEnabled(location.pathname, controlCenterPreferences)) {
        return <Navigate to='/home' replace />;
    }

    return (
        <LibraryProvider>
            <VelarisProfileGate />
            <VelarisAppExperience />
            <Box
                className='velaris-app-shell'
                sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                }}
            >
                <StrictMode>
                    <OffsetAppBar dense className='velaris-appbar'>
                        <AppToolbar
                            isDrawerAvailable={!isMediumScreen && isDrawerAvailable}
                            isDrawerOpen={isDrawerOpen}
                            onDrawerButtonClick={onToggleDrawer}
                        />
                        {isLibraryPath(location.pathname) && <LibraryToolbar />}
                    </OffsetAppBar>

                    {
                        isDrawerAvailable && (
                            <AppDrawer
                                open={isDrawerOpen}
                                onClose={onCloseDrawer}
                                onOpen={onOpenDrawer}
                            />
                        )
                    }
                </StrictMode>

                <Box
                    component='main'
                    className='velaris-app-main'
                    sx={{
                        position: 'relative',
                        width: '100%',
                        flexGrow: 1
                    }}
                >
                    <AppBody>
                        <Outlet />
                    </AppBody>
                </Box>
            </Box>
            <ThemeCss />
            <CustomCss />
        </LibraryProvider>
    );
};
