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

export const VELARIS_FRANCHISE_CATALOG: FranchiseHubDefinition[] = [
    {
        id: 'marvel',
        name: 'Marvel',
        eyebrow: 'Marvel Universe',
        description: 'MCU, Spider-Man, X-Men und weitere Marvel-Welten an einem Ort.',
        fallbackGroupName: 'Weitere Marvel-Titel',
        heroTitles: [ 'Avengers: Endgame', 'The Avengers', 'Iron Man', 'Black Panther' ],
        groups: [
            {
                id: 'mcu-phase-one',
                name: 'MCU · Phase 1',
                matchers: [ {
                    types: movies,
                    titles: [
                        'Iron Man',
                        'The Incredible Hulk',
                        'Iron Man 2',
                        'Thor',
                        'Captain America: The First Avenger',
                        'The Avengers'
                    ]
                } ],
                sortOrder: [
                    'Iron Man',
                    'The Incredible Hulk',
                    'Iron Man 2',
                    'Thor',
                    'Captain America: The First Avenger',
                    'The Avengers'
                ]
            },
            {
                id: 'mcu-phase-two',
                name: 'MCU · Phase 2',
                matchers: [ {
                    types: movies,
                    titles: [
                        'Iron Man 3',
                        'Thor: The Dark World',
                        'Captain America: The Winter Soldier',
                        'Guardians of the Galaxy',
                        'Avengers: Age of Ultron',
                        'Ant-Man'
                    ]
                } ],
                sortOrder: [
                    'Iron Man 3',
                    'Thor: The Dark World',
                    'Captain America: The Winter Soldier',
                    'Guardians of the Galaxy',
                    'Avengers: Age of Ultron',
                    'Ant-Man'
                ]
            },
            {
                id: 'mcu-phase-three',
                name: 'MCU · Phase 3',
                matchers: [ {
                    types: movies,
                    titles: [
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
                    ]
                } ],
                sortOrder: [
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
                ]
            },
            {
                id: 'mcu-phase-four',
                name: 'MCU · Phase 4',
                matchers: [ {
                    types: movies,
                    titles: [
                        'Black Widow',
                        'Shang-Chi and the Legend of the Ten Rings',
                        'Eternals',
                        'Spider-Man: No Way Home',
                        'Doctor Strange in the Multiverse of Madness',
                        'Thor: Love and Thunder',
                        'Black Panther: Wakanda Forever'
                    ]
                } ],
                sortOrder: [
                    'Black Widow',
                    'Shang-Chi and the Legend of the Ten Rings',
                    'Eternals',
                    'Spider-Man: No Way Home',
                    'Doctor Strange in the Multiverse of Madness',
                    'Thor: Love and Thunder',
                    'Black Panther: Wakanda Forever'
                ]
            },
            {
                id: 'mcu-series',
                name: 'MCU · Serien',
                matchers: [ {
                    types: series,
                    titles: [
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
                    ]
                } ],
                sortOrder: [
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
                ]
            },
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
            {
                id: 'defenders',
                name: 'Defenders Saga',
                matchers: [
                    { types: series, titles: [ 'Daredevil', 'Jessica Jones', 'Luke Cage', 'Iron Fist', 'The Defenders', 'The Punisher' ] }
                ],
                sortOrder: [ 'Daredevil', 'Jessica Jones', 'Luke Cage', 'Iron Fist', 'The Defenders', 'The Punisher' ]
            },
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
                            "Zack Snyder's Justice League",
                            'The Suicide Squad',
                            'Black Adam',
                            'Shazam! Fury of the Gods',
                            'The Flash',
                            'Blue Beetle',
                            'Aquaman and the Lost Kingdom'
                        ]
                    }
                ],
                sortOrder: [
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
                            'Constantine',
                            'Supergirl',
                            "DC's Legends of Tomorrow",
                            'Legends of Tomorrow',
                            'Black Lightning',
                            'Batwoman',
                            'Vixen',
                            'Freedom Fighters: The Ray',
                            'Superman & Lois'
                        ]
                    }
                ],
                sortOrder: [
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
                    { titles: [ 'The Batman', 'The Penguin', 'Joker', 'Joker: Folie à Deux' ] }
                ],
                sortOrder: [ 'Joker', 'The Batman', 'The Penguin', 'Joker: Folie à Deux' ]
            }
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
            {
                id: 'skywalker-saga',
                name: 'Skywalker Saga',
                matchers: [ {
                    types: movies,
                    titles: [
                        'Star Wars',
                        'Star Wars: Episode IV - A New Hope',
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
                } ],
                sortOrder: [
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
                ]
            },
            {
                id: 'mandalorian-era',
                name: 'Mandalorian Era',
                matchers: [
                    { types: series, titles: [ 'The Mandalorian', 'The Book of Boba Fett', 'Ahsoka' ] }
                ],
                sortOrder: [ 'The Mandalorian', 'The Book of Boba Fett', 'Ahsoka' ]
            },
            {
                id: 'rebellion',
                name: 'Rebellion',
                matchers: [
                    { titles: [ 'Andor', 'Star Wars Rebels', 'Rogue One: A Star Wars Story' ] }
                ],
                sortOrder: [ 'Andor', 'Star Wars Rebels', 'Rogue One: A Star Wars Story' ]
            },
            {
                id: 'animation',
                name: 'Animation',
                matchers: [
                    { titleIncludes: [ 'Clone Wars', 'The Bad Batch', 'Tales of the Jedi', 'Tales of the Empire' ] }
                ]
            },
            {
                id: 'anthology',
                name: 'Standalone Stories',
                matchers: [
                    { types: movies, titles: [ 'Rogue One: A Star Wars Story', 'Solo: A Star Wars Story' ] }
                ],
                sortOrder: [ 'Rogue One: A Star Wars Story', 'Solo: A Star Wars Story' ]
            }
        ]
    },
    {
        id: 'wizarding-world',
        name: 'Wizarding World',
        eyebrow: 'Wizarding World',
        description: 'Harry Potter und Fantastic Beasts in einem gemeinsamen magischen Hub.',
        fallbackGroupName: 'Weitere Wizarding-World-Titel',
        heroTitles: [ 'Harry Potter and the Prisoner of Azkaban', 'Harry Potter and the Philosopher\'s Stone' ],
        groups: [
            {
                id: 'harry-potter',
                name: 'Harry Potter',
                matchers: [ { titleIncludes: [ 'Harry Potter' ] } ],
                sortOrder: [
                    "Harry Potter and the Philosopher's Stone",
                    "Harry Potter and the Sorcerer's Stone",
                    'Harry Potter and the Chamber of Secrets',
                    'Harry Potter and the Prisoner of Azkaban',
                    'Harry Potter and the Goblet of Fire',
                    'Harry Potter and the Order of the Phoenix',
                    'Harry Potter and the Half-Blood Prince',
                    'Harry Potter and the Deathly Hallows: Part 1',
                    'Harry Potter and the Deathly Hallows: Part 2'
                ]
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
            {
                id: 'rings-of-power',
                name: 'The Rings of Power',
                matchers: [ { titleIncludes: [ 'Rings of Power' ] } ]
            }
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
            { id: 'main-series', name: 'The Walking Dead', matchers: [ { types: series, titles: [ 'The Walking Dead' ] } ] },
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
            { id: 'breaking-bad', name: 'Breaking Bad', matchers: [ { titles: [ 'Breaking Bad' ] } ] },
            { id: 'better-call-saul', name: 'Better Call Saul', matchers: [ { titles: [ 'Better Call Saul' ] } ] },
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
            {
                id: 'westeros-series',
                name: 'Westeros',
                matchers: [
                    { types: series, titles: [ 'Game of Thrones', 'House of the Dragon', 'A Knight of the Seven Kingdoms' ] }
                ],
                sortOrder: [ 'Game of Thrones', 'House of the Dragon', 'A Knight of the Seven Kingdoms' ]
            }
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
            {
                id: 'classic-series',
                name: 'Classic Series',
                matchers: [
                    {
                        types: series,
                        titles: [
                            'Star Trek',
                            'Star Trek: The Animated Series',
                            'Star Trek: The Next Generation',
                            'Star Trek: Deep Space Nine',
                            'Star Trek: Voyager',
                            'Star Trek: Enterprise'
                        ]
                    }
                ],
                sortOrder: [
                    'Star Trek',
                    'Star Trek: The Animated Series',
                    'Star Trek: The Next Generation',
                    'Star Trek: Deep Space Nine',
                    'Star Trek: Voyager',
                    'Star Trek: Enterprise'
                ]
            },
            {
                id: 'modern-series',
                name: 'Modern Series',
                matchers: [
                    {
                        types: series,
                        titles: [
                            'Star Trek: Discovery',
                            'Star Trek: Picard',
                            'Star Trek: Lower Decks',
                            'Star Trek: Prodigy',
                            'Star Trek: Strange New Worlds'
                        ]
                    }
                ],
                sortOrder: [
                    'Star Trek: Discovery',
                    'Star Trek: Picard',
                    'Star Trek: Lower Decks',
                    'Star Trek: Prodigy',
                    'Star Trek: Strange New Worlds'
                ]
            },
            {
                id: 'kelvin-timeline',
                name: 'Kelvin Timeline',
                matchers: [
                    { types: movies, titles: [ 'Star Trek', 'Star Trek Into Darkness', 'Star Trek Beyond' ] }
                ],
                sortOrder: [ 'Star Trek', 'Star Trek Into Darkness', 'Star Trek Beyond' ]
            },
            {
                id: 'star-trek-films',
                name: 'Star Trek Films',
                matchers: [
                    { types: movies, titleIncludes: [ 'Star Trek' ] }
                ]
            }
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
            {
                id: 'alien',
                name: 'Alien',
                matchers: [
                    { titles: [ 'Alien', 'Aliens', 'Alien 3', 'Alien Resurrection', 'Prometheus', 'Alien: Covenant', 'Alien: Romulus' ] }
                ],
                sortOrder: [ 'Alien', 'Aliens', 'Alien 3', 'Alien Resurrection', 'Prometheus', 'Alien: Covenant', 'Alien: Romulus' ]
            },
            {
                id: 'predator',
                name: 'Predator',
                matchers: [
                    { titles: [ 'Predator', 'Predator 2', 'Predators', 'The Predator', 'Prey' ] }
                ],
                sortOrder: [ 'Predator', 'Predator 2', 'Predators', 'The Predator', 'Prey' ]
            },
            {
                id: 'avp',
                name: 'Alien vs. Predator',
                matchers: [
                    { titleIncludes: [ 'Alien vs. Predator', 'Aliens vs. Predator' ] }
                ]
            }
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
            {
                id: 'john-wick-spinoffs',
                name: 'Spin-offs',
                matchers: [ { titles: [ 'The Continental', 'Ballerina', 'From the World of John Wick: Ballerina' ] } ]
            }
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
                    { titles: [ 'The Fast and the Furious', '2 Fast 2 Furious', 'The Fast and the Furious: Tokyo Drift', 'Fast Five', 'Fast & Furious 6', 'Furious 7', 'The Fate of the Furious', 'F9', 'Fast X' ] }
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
            {
                id: 'fast-spinoffs',
                name: 'Spin-offs',
                matchers: [ { titleIncludes: [ 'Hobbs & Shaw' ] } ]
            }
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