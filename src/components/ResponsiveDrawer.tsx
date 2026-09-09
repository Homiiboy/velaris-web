import type { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { type FC, type KeyboardEvent, type PropsWithChildren, useCallback } from 'react';

import browser from 'scripts/browser';

export const DRAWER_WIDTH = 240;

export interface ResponsiveDrawerProps {
    open: boolean
    onClose: () => void
    onOpen: () => void
}

export const shouldCloseResponsiveDrawerOnKey = (key: string) => key === 'Escape';

const ResponsiveDrawer: FC<PropsWithChildren<ResponsiveDrawerProps>> = ({
    children,
    open = false,
    onClose,
    onOpen
}) => {
    const isMediumScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
    const onDrawerKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
        if (shouldCloseResponsiveDrawerOnKey(event.key)) onClose();
    }, [ onClose ]);

    return ( isMediumScreen ? (
        /* DESKTOP DRAWER */
        <Drawer
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    paddingBottom: '4.2rem', // Padding for now playing bar
                    boxSizing: 'border-box'
                }
            }}
            variant='permanent'
            anchor='left'
        >
            {children}
        </Drawer>
    ) : (
        /* MOBILE DRAWER */
        <SwipeableDrawer
            anchor='left'
            open={open}
            sx={{
                '& .MuiDrawer-paper': {
                    paddingBottom: '4.2rem', // Padding for now playing bar
                    boxSizing: 'border-box'
                }
            }}
            onClose={onClose}
            onOpen={onOpen}
            // Disable swipe to open on iOS since it interferes with back navigation
            disableDiscovery={browser.iOS}
            ModalProps={{
                keepMounted: true // Better open performance on mobile.
            }}
        >
            <Box
                role='presentation'
                // Close after activating drawer content, but keep keyboard navigation usable.
                onClick={onClose}
                onKeyDown={onDrawerKeyDown}
            >
                {children}
            </Box>
        </SwipeableDrawer>
    ));
};

export default ResponsiveDrawer;
