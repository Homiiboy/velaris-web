import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models/base-item-dto';

const normalizeLibraryValue = (value: string | null | undefined) => (
    (value || '')
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s_-]+/g, ' ')
        .trim()
);

const getVelarisLibraryPriority = (library: BaseItemDto) => {
    const name = normalizeLibraryValue(library.Name);
    const collectionType = normalizeLibraryValue(String(library.CollectionType || ''));

    const isAnime = name.includes('anime');
    const isMovie = name.includes('movie') || name.includes('film') || collectionType.includes('movie');
    const isSeries = name.includes('series') || name.includes('serie') || name.includes('tv show') || collectionType.includes('tvshow');
    const isCollection = name.includes('collection') || name.includes('sammlung') || collectionType.includes('boxset');

    if (isAnime && isMovie) return 40;
    if (isAnime) return 30;
    if (isCollection) return 50;
    if (isSeries) return 20;
    if (isMovie) return 10;

    return 100;
};

/**
 * Keep Velaris' primary streaming destinations in a predictable order while
 * preserving the server-defined order for any additional custom libraries.
 */
export const sortVelarisLibraries = (libraries: BaseItemDto[]) => (
    libraries
        .map((library, index) => ({ library, index }))
        .sort((a, b) => (
            getVelarisLibraryPriority(a.library) - getVelarisLibraryPriority(b.library)
            || a.index - b.index
        ))
        .map(({ library }) => library)
);
