import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';

export interface FranchiseMatcher {
    titles?: string[]
    titleIncludes?: string[]
    types?: BaseItemKind[]
    year?: number
    minYear?: number
    maxYear?: number
    studios?: string[]
    tags?: string[]
    providerIds?: Record<string, string[]>
}

export interface FranchiseGroupDefinition {
    id: string
    name: string
    matchers: FranchiseMatcher[]
    sortOrder?: string[]
    excludePreviouslyMatched?: boolean
}

export interface FranchiseHubDefinition {
    id: string
    name: string
    eyebrow: string
    description: string
    groups: FranchiseGroupDefinition[]
    fallbackGroupName?: string
    heroTitles?: string[]
}

const movies = [ BaseItemKind.Movie ];
const series = [ BaseItemKind.Series ];

const orderedTitleGroup = (
    id: string,
    name: string,
    titles: string[],
    types?: BaseItemKind[]
): FranchiseGroupDefinition => ({
    id,
    name,
    matchers: [ { titles, types } ],
    sortOrder: titles
});

const mcuPhaseOne = [
    'Iron Man',
    'The Incredible Hulk',
    'Iron Man 2',
    'Thor',
    'Captain America: The First Avenger',
    'The Avengers'
];

const mcuPhaseTwo = [
    'Iron Man 3',
    'Thor: The Dark World',
    'Captain America: The Winter Soldier',
    'Guardians of the Galaxy',
    'Avengers: Age of Ultron',
    'Ant-Man'
];

const mcuPhaseThree = [
    'Captain America: Civil War',
    'Doctor Strange',
    'Guardians of the Galaxy Vol. 2',
    'Spider-Man: Homecoming',
    'Thor: Ragnarok',
    'Black Panther',
    'Avengers: Infinity War',
    'Ant-Man and the Wasp',
    'Captain Marvel',
    'Avengers: Endgame',
    'Spider-Man: Far From Home'
];

const mcuPhaseFour = [
    'Black Widow',
    'Shang-Chi and the Legend of the Ten Rings',
    'Eternals',
    'Spider-Man: No Way Home',
    'Doctor Strange in the Multiverse of Madness',
    'Thor: Love and Thunder',
    'Black Panther: Wakanda Forever'
];

const mcuSeries = [
    'WandaVision',
    'The Falcon and the Winter Soldier',
    'Loki',
    'What If...?',
    'Hawkeye',
    'Moon Knight',
    'Ms. Marvel',
    'She-Hulk: Attorney at Law',
    'Secret Invasion',
    'Echo',
    'Agatha All Along',
    'Daredevil: Born Again'
];

const dceu = [
    'Man of Steel',
    'Batman v Superman: Dawn of Justice',
    'Suicide Squad',
    'Wonder Woman',
    'Justice League',
    'Aquaman',
    'Shazam!',
    'Birds of Prey',
    'Wonder Woman 1984',
    "Zack Snyder's Justice League",
    'The Suicide Squad',
    'Black Adam',
    'Shazam! Fury of the Gods',
    'The Flash',
    'Blue Beetle',
    'Aquaman and the Lost Kingdom'
];

const arrowverse = [
    'Arrow',
    'The Flash',
    'Constantine',
    'Supergirl',
    "DC's Legends of Tomorrow",
    'Legends of Tomorrow',
    'Black Lightning',
    'Batwoman',
    'Vixen',
    'Freedom Fighters: The Ray',
    'Superman & Lois'
];

const skywalkerSaga = [
    'The Phantom Menace',
    'Attack of the Clones',
    'Revenge of the Sith',
    'Star Wars',
    'Star Wars: Episode IV - A New Hope',
    'A New Hope',
    'The Empire Strikes Back',
    'Return of the Jedi',
    'The Force Awakens',
    'The Last Jedi',
    'The Rise of Skywalker'
];

const harryPotter = [
    "Harry Potter and the Philosopher's Stone",
    "Harry Potter and the Sorcerer's Stone",
    'Harry Potter and the Chamber of Secrets',
    'Harry Potter and the Prisoner of Azkaban',
    'Harry Potter and the Goblet of Fire',
    'Harry Potter and the Order of the Phoenix',
    'Harry Potter and the Half-Blood Prince',
    'Harry Potter and the Deathly Hallows: Part 1',
    'Harry Potter and the Deathly Hallows: Part 2'
];

export const VELARIS_FRANCHISE_CATALOG: FranchiseHubDefinition[] = [
    {
        id: 'marvel',
        name: 'Marvel',
        eyebrow: 'Marvel Universe',
        description: 'MCU, Spider-Man, X-Men und weitere Marvel-Welten an einem Ort.',
        fallbackGroupName: 'Weitere Marvel-Titel',
        heroTitles: [ 'Avengers: Endgame', 'The Avengers', 'Iron Man', 'Black Panther' ],
        groups: [
            orderedTitleGroup('mcu-phase-one', 'MCU · Phase 1', mcuPhaseOne, movies),
            orderedTitleGroup('mcu-phase-two', 'MCU · Phase 2', mcuPhaseTwo, movies),
            orderedTitleGroup('mcu-phase-three', 'MCU · Phase 3', mcuPhaseThree, movies),
            orderedTitleGroup('mcu-phase-four', 'MCU · Phase 4', mcuPhaseFour, movies),
            orderedTitleGroup('mcu-series', 'MCU · Serien', mcuSeries, series),
            {
                id: 'spider-man',
                name: 'Spider-Man',
                matchers: [
                    { titleIncludes: [ 'Spider-Man', 'Spider Man' ] },
                    { titles: [ 'Venom', 'Venom: Let There Be Carnage', 'Venom: The Last Dance', 'Morbius', 'Madame Web', 'Kraven the Hunter' ] }
                ]
            },
            {
                id: 'x-men',
                name: 'X-Men',
                matchers: [
                    { titleIncludes: [ 'X-Men', 'X Men', 'Wolverine', 'Deadpool' ] },
                    { titles: [ 'Logan', 'The New Mutants' ] }
                ]
            },
            orderedTitleGroup(
                'defenders',
                'Defenders Saga',
                [ 'Daredevil', 'Jessica Jones', 'Luke Cage', 'Iron Fist', 'The Defenders', 'The Punisher' ],
                series
            ),
            {
                id: 'mcu-other',
                name: 'Weitere MCU-Titel',
                matchers: [ { studios: [ 'Marvel Studios' ] } ],
                excludePreviouslyMatched: true
            }
        ]
    },
    {
        id: 'dc',
        name: 'DC',
        eyebrow: 'DC Universe',
        description: 'DCU, DCEU, Arrowverse, Batman, Superman und Elseworlds dynamisch gebündelt.',
        fallbackGroupName: 'Weitere DC-Titel',
        heroTitles: [ 'Man of Steel', 'The Batman', 'Superman', 'Wonder Woman' ],
        groups: [
            {
                id: 'dcu',
                name: 'DCU',
                matchers: [
                    { studios: [ 'DC Studios' ] },
                    { types: movies, titles: [ 'Superman' ], year: 2025 },
                    { types: series, titles: [ 'Creature Commandos', 'Peacemaker' ] }
                ],
                sortOrder: [ 'Creature Commandos', 'Superman', 'Peacemaker' ]
            },
            orderedTitleGroup('dceu', 'DCEU', dceu, movies),
            orderedTitleGroup('arrowverse', 'Arrowverse', arrowverse, series),
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
            orderedTitleGroup(
                'elseworlds',
                'Elseworlds',
                [ 'Joker', 'The Batman', 'The Penguin', 'Joker: Folie à Deux' ]
            )
        ]
    },
    {
        id: 'star-wars',
        name: 'Star Wars',
        eyebrow: 'A Galaxy Far, Far Away',
        description: 'Filme und Serien aus der Star-Wars-Galaxis nach Erzählwelten sortiert.',
        fallbackGroupName: 'Weitere Star-Wars-Titel',
        heroTitles: [ 'The Empire Strikes Back', 'A New Hope', 'Rogue One: A Star Wars Story', 'The Mandalorian' ],
        groups: [
            orderedTitleGroup('skywalker-saga', 'Skywalker Saga', skywalkerSaga, movies),
            orderedTitleGroup(
                'mandalorian-era',
                'Mandalorian Era',
                [ 'The Mandalorian', 'The Book of Boba Fett', 'Ahsoka' ],
                series
            ),
            orderedTitleGroup(
                'rebellion',
                'Rebellion',
                [ 'Andor', 'Star Wars Rebels', 'Rogue One: A Star Wars Story' ]
            ),
            {
                id: 'animation',
                name: 'Animation',
                matchers: [ { titleIncludes: [ 'Clone Wars', 'The Bad Batch', 'Tales of the Jedi', 'Tales of the Empire' ] } ]
            },
            orderedTitleGroup(
                'anthology',
                'Standalone Stories',
                [ 'Rogue One: A Star Wars Story', 'Solo: A Star Wars Story' ],
                movies
            )
        ]
    },
    {
        id: 'wizarding-world',
        name: 'Wizarding World',
        eyebrow: 'Wizarding World',
        description: 'Harry Potter und Fantastic Beasts in einem gemeinsamen magischen Hub.',
        fallbackGroupName: 'Weitere Wizarding-World-Titel',
        heroTitles: [ 'Harry Potter and the Prisoner of Azkaban', "Harry Potter and the Philosopher's Stone" ],
        groups: [
            {
                id: 'harry-potter',
                name: 'Harry Potter',
                matchers: [ { titleIncludes: [ 'Harry Potter' ] } ],
                sortOrder: harryPotter
            },
            {
                id: 'fantastic-beasts',
                name: 'Fantastic Beasts',
                matchers: [ { titleIncludes: [ 'Fantastic Beasts' ] } ],
                sortOrder: [
                    'Fantastic Beasts and Where to Find Them',
                    'Fantastic Beasts: The Crimes of Grindelwald',
                    'Fantastic Beasts: The Secrets of Dumbledore'
                ]
            }
        ]
    },
    {
        id: 'middle-earth',
        name: 'Middle-earth',
        eyebrow: 'Middle-earth',
        description: 'The Lord of the Rings, The Hobbit und Rings of Power gemeinsam entdecken.',
        fallbackGroupName: 'Weitere Middle-earth-Titel',
        heroTitles: [ 'The Lord of the Rings: The Fellowship of the Ring', 'The Hobbit: An Unexpected Journey' ],
        groups: [
            {
                id: 'lotr',
                name: 'The Lord of the Rings',
                matchers: [ { titleIncludes: [ 'Lord of the Rings' ] } ],
                sortOrder: [
                    'The Lord of the Rings: The Fellowship of the Ring',
                    'The Lord of the Rings: The Two Towers',
                    'The Lord of the Rings: The Return of the King'
                ]
            },
            {
                id: 'hobbit',
                name: 'The Hobbit',
                matchers: [ { titleIncludes: [ 'Hobbit' ] } ],
                sortOrder: [
                    'The Hobbit: An Unexpected Journey',
                    'The Hobbit: The Desolation of Smaug',
                    'The Hobbit: The Battle of the Five Armies'
                ]
            },
            { id: 'rings-of-power', name: 'The Rings of Power', matchers: [ { titleIncludes: [ 'Rings of Power' ] } ] }
        ]
    },
    {
        id: 'walking-dead',
        name: 'The Walking Dead',
        eyebrow: 'The Walking Dead Universe',
        description: 'Hauptserie und Spin-offs als gemeinsames Serien-Universum.',
        fallbackGroupName: 'Weitere Walking-Dead-Titel',
        heroTitles: [ 'The Walking Dead', 'The Walking Dead: Daryl Dixon', 'The Walking Dead: Dead City' ],
        groups: [
            orderedTitleGroup('main-series', 'The Walking Dead', [ 'The Walking Dead' ], series),
            { id: 'fear', name: 'Fear the Walking Dead', matchers: [ { titleIncludes: [ 'Fear the Walking Dead' ] } ] },
            { id: 'daryl-dixon', name: 'Daryl Dixon', matchers: [ { titleIncludes: [ 'Daryl Dixon' ] } ] },
            { id: 'dead-city', name: 'Dead City', matchers: [ { titleIncludes: [ 'Dead City' ] } ] },
            { id: 'ones-who-live', name: 'The Ones Who Live', matchers: [ { titleIncludes: [ 'The Ones Who Live' ] } ] }
        ]
    },
    {
        id: 'breaking-bad',
        name: 'Breaking Bad',
        eyebrow: 'Breaking Bad Universe',
        description: 'Breaking Bad, Better Call Saul und El Camino zusammengeführt.',
        heroTitles: [ 'Breaking Bad', 'Better Call Saul', 'El Camino: A Breaking Bad Movie' ],
        groups: [
            orderedTitleGroup('breaking-bad', 'Breaking Bad', [ 'Breaking Bad' ]),
            orderedTitleGroup('better-call-saul', 'Better Call Saul', [ 'Better Call Saul' ]),
            { id: 'el-camino', name: 'El Camino', matchers: [ { titleIncludes: [ 'El Camino' ] } ] }
        ]
    },
    {
        id: 'game-of-thrones',
        name: 'Game of Thrones',
        eyebrow: 'A World of Ice and Fire',
        description: 'Westeros-Serien als gemeinsames Fantasy-Universum.',
        fallbackGroupName: 'Weitere Westeros-Titel',
        heroTitles: [ 'Game of Thrones', 'House of the Dragon' ],
        groups: [
            orderedTitleGroup(
                'westeros-series',
                'Westeros',
                [ 'Game of Thrones', 'House of the Dragon', 'A Knight of the Seven Kingdoms' ],
                series
            )
        ]
    },
    {
        id: 'star-trek',
        name: 'Star Trek',
        eyebrow: 'Star Trek Universe',
        description: 'Serien und Filme aus mehreren Generationen der Föderation.',
        fallbackGroupName: 'Weitere Star-Trek-Titel',
        heroTitles: [ 'Star Trek: The Next Generation', 'Star Trek', 'Star Trek: Strange New Worlds' ],
        groups: [
            orderedTitleGroup(
                'classic-series',
                'Classic Series',
                [
                    'Star Trek',
                    'Star Trek: The Animated Series',
                    'Star Trek: The Next Generation',
                    'Star Trek: Deep Space Nine',
                    'Star Trek: Voyager',
                    'Star Trek: Enterprise'
                ],
                series
            ),
            orderedTitleGroup(
                'modern-series',
                'Modern Series',
                [
                    'Star Trek: Discovery',
                    'Star Trek: Picard',
                    'Star Trek: Lower Decks',
                    'Star Trek: Prodigy',
                    'Star Trek: Strange New Worlds'
                ],
                series
            ),
            orderedTitleGroup(
                'kelvin-timeline',
                'Kelvin Timeline',
                [ 'Star Trek', 'Star Trek Into Darkness', 'Star Trek Beyond' ],
                movies
            ),
            { id: 'star-trek-films', name: 'Star Trek Films', matchers: [ { types: movies, titleIncludes: [ 'Star Trek' ] } ] }
        ]
    },
    {
        id: 'alien-predator',
        name: 'Alien & Predator',
        eyebrow: 'Alien / Predator Universe',
        description: 'Alien, Predator und die Crossover-Filme als gemeinsamer Sci-Fi-Hub.',
        fallbackGroupName: 'Weitere Alien-/Predator-Titel',
        heroTitles: [ 'Alien', 'Aliens', 'Predator', 'Prey' ],
        groups: [
            orderedTitleGroup(
                'alien',
                'Alien',
                [ 'Alien', 'Aliens', 'Alien 3', 'Alien Resurrection', 'Prometheus', 'Alien: Covenant', 'Alien: Romulus' ]
            ),
            orderedTitleGroup('predator', 'Predator', [ 'Predator', 'Predator 2', 'Predators', 'The Predator', 'Prey' ]),
            { id: 'avp', name: 'Alien vs. Predator', matchers: [ { titleIncludes: [ 'Alien vs. Predator', 'Aliens vs. Predator' ] } ] }
        ]
    },
    {
        id: 'jurassic',
        name: 'Jurassic',
        eyebrow: 'Jurassic Universe',
        description: 'Jurassic Park und Jurassic World als gemeinsamer Abenteuer-Hub.',
        fallbackGroupName: 'Weitere Jurassic-Titel',
        heroTitles: [ 'Jurassic Park', 'Jurassic World' ],
        groups: [
            { id: 'jurassic-park', name: 'Jurassic Park', matchers: [ { titleIncludes: [ 'Jurassic Park' ] } ] },
            { id: 'jurassic-world', name: 'Jurassic World', matchers: [ { titleIncludes: [ 'Jurassic World' ] } ] }
        ]
    },
    {
        id: 'matrix',
        name: 'The Matrix',
        eyebrow: 'The Matrix Universe',
        description: 'Die Matrix-Filme als eigene Cyberpunk-Welt.',
        heroTitles: [ 'The Matrix', 'The Matrix Reloaded' ],
        groups: [
            {
                id: 'matrix-films',
                name: 'The Matrix',
                matchers: [ { titleIncludes: [ 'Matrix' ], types: movies } ],
                sortOrder: [ 'The Matrix', 'The Matrix Reloaded', 'The Matrix Revolutions', 'The Matrix Resurrections' ]
            }
        ]
    },
    {
        id: 'john-wick',
        name: 'John Wick',
        eyebrow: 'John Wick Universe',
        description: 'John Wick und seine Spin-offs in einem gemeinsamen Action-Hub.',
        fallbackGroupName: 'Weitere John-Wick-Titel',
        heroTitles: [ 'John Wick', 'John Wick: Chapter 4' ],
        groups: [
            {
                id: 'john-wick-films',
                name: 'John Wick',
                matchers: [ { titleIncludes: [ 'John Wick' ] } ],
                sortOrder: [ 'John Wick', 'John Wick: Chapter 2', 'John Wick: Chapter 3 – Parabellum', 'John Wick: Chapter 4' ]
            },
            { id: 'john-wick-spinoffs', name: 'Spin-offs', matchers: [ { titles: [ 'The Continental', 'Ballerina', 'From the World of John Wick: Ballerina' ] } ] }
        ]
    },
    {
        id: 'mission-impossible',
        name: 'Mission: Impossible',
        eyebrow: 'Mission: Impossible',
        description: 'Die Mission-Impossible-Reihe als chronologisch sortierter Action-Hub.',
        heroTitles: [ 'Mission: Impossible', 'Mission: Impossible - Fallout' ],
        groups: [
            {
                id: 'mission-impossible-films',
                name: 'Mission: Impossible',
                matchers: [ { titleIncludes: [ 'Mission: Impossible' ], types: movies } ],
                sortOrder: [
                    'Mission: Impossible',
                    'Mission: Impossible II',
                    'Mission: Impossible III',
                    'Mission: Impossible - Ghost Protocol',
                    'Mission: Impossible - Rogue Nation',
                    'Mission: Impossible - Fallout',
                    'Mission: Impossible - Dead Reckoning Part One',
                    'Mission: Impossible – The Final Reckoning',
                    'Mission: Impossible - The Final Reckoning'
                ]
            }
        ]
    },
    {
        id: 'fast-furious',
        name: 'Fast & Furious',
        eyebrow: 'Fast Saga',
        description: 'Die Fast-Saga und ihre Spin-offs in einem gemeinsamen Hub.',
        fallbackGroupName: 'Weitere Fast-Saga-Titel',
        heroTitles: [ 'Fast Five', 'Furious 7', 'Fast X' ],
        groups: [
            {
                id: 'fast-saga',
                name: 'Fast Saga',
                matchers: [
                    { titleIncludes: [ 'Fast & Furious', 'Fast and Furious' ] },
                    { titles: [ 'The Fast and the Furious', '2 Fast 2 Furious', 'The Fast and the Furious: Tokyo Drift', 'Fast Five', 'Furious 7', 'The Fate of the Furious', 'F9', 'Fast X' ] }
                ],
                sortOrder: [
                    'The Fast and the Furious',
                    '2 Fast 2 Furious',
                    'The Fast and the Furious: Tokyo Drift',
                    'Fast & Furious',
                    'Fast Five',
                    'Fast & Furious 6',
                    'Furious 7',
                    'The Fate of the Furious',
                    'F9',
                    'Fast X'
                ]
            },
            { id: 'fast-spinoffs', name: 'Spin-offs', matchers: [ { titleIncludes: [ 'Hobbs & Shaw' ] } ] }
        ]
    },
    {
        id: 'dragon-ball',
        name: 'Dragon Ball',
        eyebrow: 'Anime Universe',
        description: 'Dragon Ball Serien und Filme automatisch in einem Anime-Hub.',
        fallbackGroupName: 'Weitere Dragon-Ball-Titel',
        heroTitles: [ 'Dragon Ball Z', 'Dragon Ball Super', 'Dragon Ball' ],
        groups: [
            { id: 'dragon-ball', name: 'Dragon Ball', matchers: [ { titleIncludes: [ 'Dragon Ball' ] } ] },
            { id: 'dragon-ball-super', name: 'Dragon Ball Super', matchers: [ { titleIncludes: [ 'Dragon Ball Super' ] } ] }
        ]
    },
    {
        id: 'naruto',
        name: 'Naruto',
        eyebrow: 'Anime Universe',
        description: 'Naruto, Shippuden und Boruto als zusammenhängende Anime-Welt.',
        fallbackGroupName: 'Weitere Naruto-Titel',
        heroTitles: [ 'Naruto: Shippuden', 'Naruto', 'Boruto: Naruto Next Generations' ],
        groups: [
            { id: 'naruto', name: 'Naruto', matchers: [ { titleIncludes: [ 'Naruto' ] } ] },
            { id: 'boruto', name: 'Boruto', matchers: [ { titleIncludes: [ 'Boruto' ] } ] }
        ]
    },
    {
        id: 'one-piece',
        name: 'One Piece',
        eyebrow: 'Anime Universe',
        description: 'One Piece Serien, Filme und Specials in einem gemeinsamen Hub.',
        fallbackGroupName: 'Weitere One-Piece-Titel',
        heroTitles: [ 'One Piece' ],
        groups: [
            { id: 'one-piece', name: 'One Piece', matchers: [ { titleIncludes: [ 'One Piece' ] } ] }
        ]
    }
];
