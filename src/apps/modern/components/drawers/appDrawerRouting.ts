import { matchPath } from 'react-router-dom';

const normalizeRoutePath = (path: string) => path.startsWith('/') ? path : `/${path}`;

export const matchesVelarisDrawerRoute = (
    pathname: string,
    routePatterns: string[]
) => routePatterns.some(routePath => Boolean(matchPath({
    path: normalizeRoutePath(routePath),
    end: true
}, pathname)));
