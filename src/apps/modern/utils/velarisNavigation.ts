import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models/base-item-dto';

export type VelarisLibraryCategory =
    | 'movies'
    | 'series'
    | 'anime'
    | 'anime-movies'
    | 'collections'
    | 'other';

const normalizeLibraryValue = (value: string | null | undefined) => (
    (value || '')
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s_-]+/g, ' ')
        .trim()
);

export const getVelarisLibraryCategory = (
    library: BaseItemDto
): VelarisLibraryCategory => {
    const name = normalizeLibraryValue(library.Name);
    const collectionType = normalizeLibraryValue(String(library.CollectionType || ''));

    const isAnime = name.includes('anime');
    const isMovie = name.includes('movie')
        || name.includes('film')
        || collectionType.includes('movie');
    const isSeries = name.includes('series')
        || name.includes('serie')
        || name.includes('tv show')
        || collectionType.includes('tvshow');
    const isCollection = name.includes('collection')
        || name.includes('sammlung')
        || collectionType.includes('boxset');

    if (isAnime && isMovie) return 'anime-movies';
    if (isAnime) return 'anime';
    if (isCollection) return 'collections';
    if (isSeries) return 'series';
    if (isMovie) return 'movies';

    return 'other';
};

const CATEGORY_PRIORITY: Record<VelarisLibraryCategory, number> = {
    movies: 10,
    series: 20,
    anime: 30,
    'anime-movies': 40,
    collections: 50,
    other: 100
};

/**
 * Keep Velaris' primary streaming destinations in a predictable order while
 * preserving the server-defined order for any additional custom libraries.
 */
export const sortVelarisLibraries = (libraries: BaseItemDto[]) => (
    libraries
        .map((library, index) => ({ library, index }))
        .sort((a, b) => (
            CATEGORY_PRIORITY[getVelarisLibraryCategory(a.library)]
            - CATEGORY_PRIORITY[getVelarisLibraryCategory(b.library)]
            || a.index - b.index
        ))
        .map(({ library }) => library)
);
