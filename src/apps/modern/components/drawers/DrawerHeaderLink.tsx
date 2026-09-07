import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';

import ListItemLink from 'components/ListItemLink';

import appIcon from 'assets/img/velaris/velaris-logo.svg';

const DrawerHeaderLink = () => (
    <ListItemLink
        to='/home'
        className='velaris-drawer-brand'
    >
        <ListItemIcon sx={{ minWidth: 56 }}>
            <Box
                component='img'
                src={appIcon}
                alt=''
                aria-hidden
                sx={{ height: '2.75rem' }}
            />
        </ListItemIcon>
        <ListItemText
            primary='Velaris'
            slotProps={{
                primary: { variant: 'h6' }
            }}
        />
    </ListItemLink>
);

export default DrawerHeaderLink;
