import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';

export interface FranchiseMatcher {
    titles?: string[]
    titleIncludes?: string[]
    types?: BaseItemKind[]
    year?: number
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
        id: 'marvel', name: 'Marvel', eyebrow: 'Marvel Universe',
        description: 'MCU, Spider-Man, X-Men und weitere Marvel-Welten an einem Ort.',
        fallbackGroupName: 'Weitere Marvel-Titel',
        groups: [
            {
                id: 'mcu', name: 'Marvel Cinematic Universe', matchers: [
                    { studios: [ 'Marvel Studios' ] },
                    { titleIncludes: [ 'Iron Man', 'Avengers', 'Captain America', 'Thor', 'Guardians of the Galaxy', 'Ant-Man', 'Doctor Strange', 'Black Panther', 'Captain Marvel', 'Black Widow', 'Shang-Chi', 'WandaVision', 'Loki', 'Hawkeye', 'Moon Knight', 'Ms. Marvel', 'She-Hulk', 'Secret Invasion', 'Agatha All Along', 'Daredevil: Born Again' ] }
                ]
            },
            {
                id: 'spider-man', name: 'Spider-Man', matchers: [
                    { titleIncludes: [ 'Spider-Man', 'Spider Man', 'Venom', 'Morbius', 'Madame Web', 'Kraven' ] }
                ]
            },
            {
                id: 'x-men', name: 'X-Men', matchers: [
                    { titleIncludes: [ 'X-Men', 'X Men', 'Wolverine', 'Deadpool' ] },
                    { titles: [ 'Logan', 'The New Mutants' ] }
                ]
            },
            {
                id: 'defenders', name: 'Defenders Saga', matchers: [
                    { types: series, titles: [ 'Daredevil', 'Jessica Jones', 'Luke Cage', 'Iron Fist', 'The Defenders', 'The Punisher' ] }
                ]
            }
        ]
    },
    {
        id: 'dc', name: 'DC', eyebrow: 'DC Universe',
        description: 'DCU, DCEU, Arrowverse, Batman, Superman und Elseworlds dynamisch gebündelt.',
        fallbackGroupName: 'Weitere DC-Titel',
        groups: [
            {
                id: 'dcu', name: 'DCU', matchers: [
                    { studios: [ 'DC Studios' ] },
                    { types: movies, titles: [ 'Superman' ], year: 2025 },
                    { types: series, titles: [ 'Creature Commandos', 'Peacemaker' ] }
                ]
            },
            {
                id: 'dceu', name: 'DCEU', matchers: [
                    { types: movies, titles: [ 'Man of Steel', 'Batman v Superman: Dawn of Justice', 'Suicide Squad', 'Wonder Woman', 'Justice League', 'Aquaman', 'Shazam!', 'Birds of Prey', 'Wonder Woman 1984', "Zack Snyder's Justice League", 'The Suicide Squad', 'Black Adam', 'Blue Beetle', 'Aquaman and the Lost Kingdom' ] },
                    { types: movies, titles: [ 'The Flash' ], year: 2023 }
                ]
            },
            {
                id: 'arrowverse', name: 'Arrowverse', matchers: [
                    { types: series, titles: [ 'Arrow', 'The Flash', 'Supergirl', "DC's Legends of Tomorrow", 'Legends of Tomorrow', 'Batwoman', 'Black Lightning', 'Constantine', 'Vixen', 'Freedom Fighters: The Ray', 'Superman & Lois' ] }
                ]
            },
            {
                id: 'batman', name: 'Batman', matchers: [
                    { titleIncludes: [ 'Batman' ] },
                    { titles: [ 'Gotham', 'The Penguin' ] }
                ]
            },
            {
                id: 'superman', name: 'Superman', matchers: [
                    { titleIncludes: [ 'Superman' ] },
                    { types: series, titles: [ 'Smallville', 'Lois & Clark: The New Adventures of Superman' ] }
                ]
            },
            {
                id: 'elseworlds', name: 'Elseworlds', matchers: [
                    { titles: [ 'The Batman', 'The Penguin', 'Joker', 'Joker: Folie à Deux' ] }
                ]
            }
        ]
    },
    {
        id: 'star-wars', name: 'Star Wars', eyebrow: 'A Galaxy Far, Far Away',
        description: 'Filme und Serien aus der Star-Wars-Galaxis nach Erzählwelten sortiert.',
        fallbackGroupName: 'Weitere Star-Wars-Titel',
        groups: [
            { id: 'skywalker-saga', name: 'Skywalker Saga', matchers: [ { titleIncludes: [ 'Star Wars' ] } ] },
            { id: 'mandalorian-era', name: 'Mandalorian Era', matchers: [ { types: series, titles: [ 'The Mandalorian', 'Ahsoka', 'The Book of Boba Fett' ] } ] },
            { id: 'rebellion', name: 'Rebellion', matchers: [ { titles: [ 'Andor', 'Star Wars Rebels', 'Rogue One: A Star Wars Story' ] } ] },
            { id: 'animation', name: 'Animation', matchers: [ { titleIncludes: [ 'Clone Wars', 'The Bad Batch', 'Tales of the Jedi', 'Tales of the Empire' ] } ] }
        ]
    },
    {
        id: 'wizarding-world', name: 'Wizarding World', eyebrow: 'Wizarding World',
        description: 'Harry Potter und Fantastic Beasts in einem gemeinsamen magischen Hub.',
        fallbackGroupName: 'Weitere Wizarding-World-Titel',
        groups: [
            { id: 'harry-potter', name: 'Harry Potter', matchers: [ { titleIncludes: [ 'Harry Potter' ] } ] },
            { id: 'fantastic-beasts', name: 'Fantastic Beasts', matchers: [ { titleIncludes: [ 'Fantastic Beasts' ] } ] }
        ]
    },
    {
        id: 'middle-earth', name: 'Middle-earth', eyebrow: 'Middle-earth',
        description: 'The Lord of the Rings, The Hobbit und Rings of Power gemeinsam entdecken.',
        fallbackGroupName: 'Weitere Middle-earth-Titel',
        groups: [
            { id: 'lotr', name: 'The Lord of the Rings', matchers: [ { titleIncludes: [ 'Lord of the Rings' ] } ] },
            { id: 'hobbit', name: 'The Hobbit', matchers: [ { titleIncludes: [ 'Hobbit' ] } ] },
            { id: 'rings-of-power', name: 'The Rings of Power', matchers: [ { titleIncludes: [ 'Rings of Power' ] } ] }
        ]
    },
    {
        id: 'walking-dead', name: 'The Walking Dead', eyebrow: 'The Walking Dead Universe',
        description: 'Hauptserie und Spin-offs als gemeinsames Serien-Universum.',
        fallbackGroupName: 'Weitere Walking-Dead-Titel',
        groups: [
            { id: 'main-series', name: 'The Walking Dead', matchers: [ { types: series, titles: [ 'The Walking Dead' ] } ] },
            { id: 'fear', name: 'Fear the Walking Dead', matchers: [ { titleIncludes: [ 'Fear the Walking Dead' ] } ] },
            { id: 'daryl-dixon', name: 'Daryl Dixon', matchers: [ { titleIncludes: [ 'Daryl Dixon' ] } ] },
            { id: 'dead-city', name: 'Dead City', matchers: [ { titleIncludes: [ 'Dead City' ] } ] },
            { id: 'ones-who-live', name: 'The Ones Who Live', matchers: [ { titleIncludes: [ 'The Ones Who Live' ] } ] }
        ]
    },
    {
        id: 'breaking-bad', name: 'Breaking Bad', eyebrow: 'Breaking Bad Universe',
        description: 'Breaking Bad, Better Call Saul und El Camino zusammengeführt.',
        groups: [
            { id: 'breaking-bad', name: 'Breaking Bad', matchers: [ { titles: [ 'Breaking Bad' ] } ] },
            { id: 'better-call-saul', name: 'Better Call Saul', matchers: [ { titles: [ 'Better Call Saul' ] } ] },
            { id: 'el-camino', name: 'El Camino', matchers: [ { titleIncludes: [ 'El Camino' ] } ] }
        ]
    },
    {
        id: 'dragon-ball', name: 'Dragon Ball', eyebrow: 'Anime Universe',
        description: 'Dragon Ball Serien und Filme automatisch in einem Anime-Hub.',
        fallbackGroupName: 'Weitere Dragon-Ball-Titel',
        groups: [
            { id: 'dragon-ball', name: 'Dragon Ball', matchers: [ { titleIncludes: [ 'Dragon Ball' ] } ] },
            { id: 'dragon-ball-super', name: 'Dragon Ball Super', matchers: [ { titleIncludes: [ 'Dragon Ball Super' ] } ] }
        ]
    },
    {
        id: 'naruto', name: 'Naruto', eyebrow: 'Anime Universe',
        description: 'Naruto, Shippuden und Boruto als zusammenhängende Anime-Welt.',
        fallbackGroupName: 'Weitere Naruto-Titel',
        groups: [
            { id: 'naruto', name: 'Naruto', matchers: [ { titleIncludes: [ 'Naruto' ] } ] },
            { id: 'boruto', name: 'Boruto', matchers: [ { titleIncludes: [ 'Boruto' ] } ] }
        ]
    },
    {
        id: 'one-piece', name: 'One Piece', eyebrow: 'Anime Universe',
        description: 'One Piece Serien, Filme und Specials in einem gemeinsamen Hub.',
        fallbackGroupName: 'Weitere One-Piece-Titel',
        groups: [
            { id: 'one-piece', name: 'One Piece', matchers: [ { titleIncludes: [ 'One Piece' ] } ] }
        ]
    }
];
