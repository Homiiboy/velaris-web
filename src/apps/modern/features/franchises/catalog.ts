import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';

export interface FranchiseMatcher {
    titles?: string[]
    titleIncludes?: string[]
    titlePatterns?: RegExp[]
    types?: BaseItemKind[]
    year?: number
    minYear?: number
    maxYear?: number
    studios?: string[]
    tags?: string[]
}

export interface FranchiseGroupDefinition {
    id: string
    name: string
    matchers: FranchiseMatcher[]
}

export interface FranchiseHubDefinition {
    id: string
    name: string
    eyebrow: string
    description: string
    groups: FranchiseGroupDefinition[]
    fallbackGroupName?: string
}

const movies = [ BaseItemKind.Movie ];
const series = [ BaseItemKind.Series ];

export const VELARIS_FRANCHISE_CATALOG: FranchiseHubDefinition[] = [
    {
        id: 'marvel',
        name: 'Marvel',
        eyebrow: 'Marvel Universe',
        description: 'MCU, Spider-Man, X-Men und weitere Marvel-Welten an einem Ort.',
        fallbackGroupName: 'Weitere Marvel-Titel',
        groups: [
            {
                id: 'mcu',
                name: 'Marvel Cinematic Universe',
                matchers: [
                    { studios: [ 'Marvel Studios' ] },
                    {
                        titlePatterns: [
                            /^iron man( \d)?$/,
                            /^thor( |$)/,
                            /^captain america/,
                            /^the avengers$/,
                            /^avengers/,
                            /^guardians of the galaxy/,
                            /^ant man/,
                            /^doctor strange/,
                            /^black panther/,
                            /^captain marvel$/,
                            /^black widow$/,
                            /^shang chi/,
                            /^eternals$/,
                            /^spider man homecoming$/,
                            /^spider man far from home$/,
                            /^spider man no way home$/,
                            /^wandavision$/,
                            /^the falcon and the winter soldier$/,
                            /^loki$/,
                            /^hawkeye$/,
                            /^moon knight$/,
                            /^ms marvel$/,
                            /^she hulk/,
                            /^secret invasion$/,
                            /^echo$/,
                            /^agatha all along$/,
                            /^daredevil born again$/,
                            /^what if/
                        ]
                    }
                ]
            },
            {
                id: 'spider-man',
                name: 'Spider-Man',
                matchers: [
                    {
                        titlePatterns: [
                            /^spider man/,
                            /^the amazing spider man/,
                            /^spider man into the spider verse$/,
                            /^spider man across the spider verse$/,
                            /^venom( |$)/,
                            /^morbius$/,
                            /^madame web$/,
                            /^kraven the hunter$/
                        ]
                    }
                ]
            },
            {
                id: 'x-men',
                name: 'X-Men',
                matchers: [
                    {
                        titlePatterns: [
                            /^x men/,
                            /^the wolverine$/,
                            /^x men origins wolverine$/,
                            /^logan$/,
                            /^deadpool( |$)/,
                            /^the new mutants$/
                        ]
                    }
                ]
            },
            {
                id: 'defenders',
                name: 'Defenders Saga',
                matchers: [
                    {
                        types: series,
                        titles: [
                            'Daredevil',
                            'Jessica Jones',
                            'Luke Cage',
                            'Iron Fist',
                            'The Defenders',
                            'The Punisher'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'dc',
        name: 'DC',
        eyebrow: 'DC Universe',
        description: 'DCU, DCEU, Arrowverse, Batman, Superman und Elseworlds dynamisch gebündelt.',
        fallbackGroupName: 'Weitere DC-Titel',
        groups: [
            {
                id: 'dcu',
                name: 'DCU',
                matchers: [
                    { studios: [ 'DC Studios' ] },
                    { types: movies, titles: [ 'Superman' ], year: 2025 },
                    { types: series, titles: [ 'Creature Commandos', 'Peacemaker' ] }
                ]
            },
            {
                id: 'dceu',
                name: 'DCEU',
                matchers: [
                    {
                        types: movies,
                        titles: [
                            'Man of Steel',
                            'Batman v Superman: Dawn of Justice',
                            'Suicide Squad',
                            'Wonder Woman',
                            'Justice League',
                            'Aquaman',
                            'Shazam!',
                            'Birds of Prey',
                            'Wonder Woman 1984',
                            'Zack Snyder\'s Justice League',
                            'The Suicide Squad',
                            'Black Adam',
                            'Blue Beetle',
                            'Aquaman and the Lost Kingdom'
                        ]
                    },
                    { types: movies, titles: [ 'The Flash' ], year: 2023 }
                ]
            },
            {
                id: 'arrowverse',
                name: 'Arrowverse',
                matchers: [
                    {
                        types: series,
                        titles: [
                            'Arrow',
                            'The Flash',
                            'Supergirl',
                            'DC\'s Legends of Tomorrow',
                            'Legends of Tomorrow',
                            'Batwoman',
                            'Black Lightning',
                            'Constantine',
                            'Vixen',
                            'Freedom Fighters: The Ray',
                            'Superman & Lois'
                        ]
                    }
                ]
            },
            {
                id: 'batman',
                name: 'Batman',
                matchers: [
                    { titleIncludes: [ 'Batman' ] },
                    { titles: [ 'Gotham', 'The Penguin' ] }
                ]
            },
            {
                id: 'superman',
                name: 'Superman',
                matchers: [
                    { titleIncludes: [ 'Superman' ] },
                    { types: series, titles: [ 'Smallville', 'Lois & Clark: The New Adventures of Superman' ] }
                ]
            },
            {
                id: 'elseworlds',
                name: 'Elseworlds',
                matchers: [
                    {
                        titles: [
                            'The Batman',
                            'The Penguin',
                            'Joker',
                            'Joker: Folie à Deux'
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'star-wars',
        name: 'Star Wars',
        eyebrow: 'A Galaxy Far, Far Away',
        description: 'Filme und Serien aus der Star-Wars-Galaxis nach Epochen und Erzählwelten sortiert.',
        fallbackGroupName: 'Weitere Star-Wars-Titel',
        groups: [
            {
                id: 'skywalker-saga',
                name: 'Skywalker Saga',
                matchers: [
                    { titlePatterns: [ /^star wars episode/ ] },
                    {
                        titles: [
                            'Star Wars',
                            'A New Hope',
                            'The Empire Strikes Back',
                            'Return of the Jedi',
                            'The Phantom Menace',
                            'Attack of the Clones',
                            'Revenge of the Sith',
                            'The Force Awakens',
                            'The Last Jedi',
                            'The Rise of Skywalker'
                        ]
                    }
                ]
            },
            {
                id: 'star-w