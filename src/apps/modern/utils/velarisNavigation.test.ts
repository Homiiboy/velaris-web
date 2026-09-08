import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models/base-item-dto';
import { describe, expect, it } from 'vitest';

import {
    getVelarisLibraryCategory,
    sortVelarisLibraries
} from './velarisNavigation';

const createLibrary = (
    name: string,
    collectionType?: string
): BaseItemDto => ({
    Id: name,
    Name: name,
    CollectionType: collectionType
} as BaseItemDto);

describe('getVelarisLibraryCategory', () => {
    it('recognizes the core English and German library categories', () => {
        expect(getVelarisLibraryCategory(createLibrary('Movies'))).toBe('movies');
        expect(getVelarisLibraryCategory(createLibrary('Filme'))).toBe('movies');
        expect(getVelarisLibraryCategory(createLibrary('Series'))).toBe('series');
        expect(getVelarisLibraryCategory(createLibrary('Serien'))).toBe('series');
        expect(getVelarisLibraryCategory(createLibrary('Anime'))).toBe('anime');
        expect(getVelarisLibraryCategory(createLibrary('Anime Movies'))).toBe('anime-movies');
        expect(getVelarisLibraryCategory(createLibrary('Anime Filme'))).toBe('anime-movies');
        expect(getVelarisLibraryCategory(createLibrary('Collections'))).toBe('collections');
        expect(getVelarisLibraryCategory(createLibrary('Sammlungen'))).toBe('collections');
    });

    it('keeps anime movies distinct when the server collection type is movies', () => {
        expect(getVelarisLibraryCategory(createLibrary('Anime', 'movies')))
            .toBe('anime-movies');
    });
});

describe('sortVelarisLibraries', () => {
    it('keeps core destinations predictable and custom libraries stable', () => {
        const input = [
            createLibrary('Documentaries'),
            createLibrary('Anime Movies'),
            createLibrary('Series'),
            createLibrary('Concerts'),
            createLibrary('Collections'),
            createLibrary('Movies'),
            createLibrary('Anime')
        ];

        expect(sortVelarisLibraries(input).map(item => item.Name)).toEqual([
            'Movies',
            'Series',
            'Anime',
            'Anime Movies',
            'Collections',
            'Documentaries',
            'Concerts'
        ]);

        expect(input.map(item => item.Name)).toEqual([
            'Documentaries',
            'Anime Movies',
            'Series',
            'Concerts',
            'Collections',
            'Movies',
            'Anime'
        ]);
    });
});
