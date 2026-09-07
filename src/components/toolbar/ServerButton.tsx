import icon from 'assets/img/velaris/velaris-logo.svg';
import Button from '@mui/material/Button/Button';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';

const ServerButton: FC = () => (
    <Button
        className='velaris-brand-button'
        variant='text'
        size='large'
        color='inherit'
        startIcon={
            <img
                src={icon}
                alt=''
                aria-hidden
                style={{
                    maxHeight: '1.5em',
                    maxWidth: '1.5em'
                }}
            />
        }
        component={Link}
        to='/home'
        aria-label='Velaris'
    >
        Velaris
    </Button>
);

export default ServerButton;
