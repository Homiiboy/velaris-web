import ListItemButton, { ListItemButtonBaseProps } from '@mui/material/ListItemButton';
import React, { FC } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

interface ListItemLinkProps extends ListItemButtonBaseProps {
    to: string
    includePaths?: string[]
    excludePaths?: string[]
    className?: string
}

const isMatchingParams = (routeParams: URLSearchParams, currentParams: URLSearchParams) => {
    for (const param of routeParams) {
        if (currentParams.get(param[0]) !== param[1]) {
            return false;
        }
    }

    return true;
};

const ListItemLink: FC<ListItemLinkProps> = ({
    children,
    to,
    includePaths = [],
    excludePaths = [],
    ...params
}) => {
    const location = useLocation();
    const [ searchParams ] = useSearchParams();

    const [ toPath, toParams ] = to.split('?');
    const toSearchParams = new URLSearchParams(`?${toParams}`);
    const selectedPaths = [ toPath, ...includePaths ];

    const routeSelected = selectedPaths.includes(location.pathname)
        && !excludePaths.includes(location.pathname + location.search)
        && (!toParams || isMatchingParams(toSearchParams, searchParams));
    const selected = params.selected ?? routeSelected;

    return (
        <ListItemButton
            component={Link}
            to={to}
            selected={selected}
            {...params}
            aria-current={selected ? 'page' : undefined}
        >
            {children}
        </ListItemButton>
    );
};

export default ListItemLink;
