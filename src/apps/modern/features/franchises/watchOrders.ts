import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';

import type { ItemDto } from 'types/base/models/item-dto';

import type { ResolvedFranchiseHub } from './franchiseEngine';
import type { FranchiseStudioConfig } from './franchiseStudio';

export type FranchiseWatchOrderKind = 'release' | 'chronological' | 'custom';

interface FranchiseWatchOrderEntry {
    title: string
    type?: BaseItemKind
    year?: number
}

interface FranchiseWatchOrderDefinition {
    id: string
    hubId: string
    name: string
    description: string
    kind: Exclude<FranchiseWatchOrderKind, 'custom'>
    entries: FranchiseWatchOrderEntry[]
}

export interface ResolvedFranchiseWatchOrder {
    id: string
    name: string
    description: string
    kind: FranchiseWatchOrderKind
    items: ItemDto[]
}

const entry = (
    title: string,
    type?: BaseItemKind,
    year?: number
): FranchiseWatchOrderEntry => ({ title, type, year });

const mcuReleaseEntries = [
    entry('Iron Man', BaseItemKind.Movie),
    entry('The Incredible Hulk', BaseItemKind.Movie),
    entry('Iron Man 2', BaseItemKind.Movie),
    entry('Thor', BaseItemKind.Movie),
    entry('Captain America: The First Avenger', BaseItemKind.Movie),
    entry('The Avengers', BaseItemKind.Movie),
    entry('Iron Man 3', BaseItemKind.Movie),
    entry('Thor: The Dark World', BaseItemKind.Movie),
    entry('Captain America: The Winter Soldier', BaseItemKind.Movie),
    entry('Guardians of the Galaxy', BaseItemKind.Movie),
    entry('Avengers: Age of Ultron', BaseItemKind.Movie),
    entry('Ant-Man', BaseItemKind.Movie),
    entry('Captain America: Civil War', BaseItemKind.Movie),
    entry('Doctor Strange', BaseItemKind.Movie),
    entry('Guardians of the Galaxy Vol. 2', BaseItemKind.Movie),
    entry('Spider-Man: Homecoming', BaseItemKind.Movie),
    entry('Thor: Ragnarok', BaseItemKind.Movie),
    entry('Black Panther', BaseItemKind.Movie),
    entry('Avengers: Infinity War', BaseItemKind.Movie),
    entry('Ant-Man and the Wasp', BaseItemKind.Movie),
    entry('Captain Marvel', BaseItemKind.Movie),
    entry('Avengers: Endgame', BaseItemKind.Movie),
    entry('Spider-Man: Far From Home', BaseItemKind.Movie),
    entry('WandaVision', BaseItemKind.Series),
    entry('The Falcon and the Winter Soldier', BaseItemKind.Series),
    entry('Loki', BaseItemKind.Series),
    entry('Black Widow', BaseItemKind.Movie),
    entry('What If...?', BaseItemKind.Series),
    entry('Shang-Chi and the Legend of the Ten Rings', BaseItemKind.Movie),
    entry('Eternals', BaseItemKind.Movie),
    entry('Hawkeye', BaseItemKind.Series),
    entry('Spider-Man: No Way Home', BaseItemKind.Movie),
    entry('Moon Knight', BaseItemKind.Series),
    entry('Doctor Strange in the Multiverse of Madness', BaseItemKind.Movie),
    entry('Ms. Marvel', BaseItemKind.Series),
    entry('Thor: Love and Thunder', BaseItemKind.Movie),
    entry('She-Hulk: Attorney at Law', BaseItemKind.Series),
    entry('Black Panther: Wakanda Forever', BaseItemKind.Movie),
    entry('Secret Invasion', BaseItemKind.Series),
    entry('Echo', BaseItemKind.Series),
    entry('Agatha All Along', BaseItemKind.Series),
    entry('Daredevil: Born Again', BaseItemKind.Series)
];

const mcuChronologicalEntries = [
    entry('Captain America: The First Avenger', BaseItemKind.Movie),
    entry('Captain Marvel', BaseItemKind.Movie),
    entry('Iron Man', BaseItemKind.Movie),
    entry('Iron Man 2', BaseItemKind.Movie),
    entry('The Incredible Hulk', BaseItemKind.Movie),
    entry('Thor', BaseItemKind.Movie),
    entry('The Avengers', BaseItemKind.Movie),
    entry('Iron Man 3', BaseItemKind.Movie),
    entry('Thor: The Dark World', BaseItemKind.Movie),
    entry('Captain America: The Winter Soldier', BaseItemKind.Movie),
    entry('Guardians of the Galaxy', BaseItemKind.Movie),
    entry('Guardians of the Galaxy Vol. 2', BaseItemKind.Movie),
    entry('Avengers: Age of Ultron', BaseItemKind.Movie),
    entry('Ant-Man', BaseItemKind.Movie),
    entry('Captain America: Civil War', BaseItemKind.Movie),
    entry('Black Widow', BaseItemKind.Movie),
    entry('Black Panther', BaseItemKind.Movie),
    entry('Spider-Man: Homecoming', BaseItemKind.Movie),
    entry('Doctor Strange', BaseItemKind.Movie),
    entry('Thor: Ragnarok', BaseItemKind.Movie),
    entry('Ant-Man and the Wasp', BaseItemKind.Movie),
    entry('Avengers: Infinity War', BaseItemKind.Movie),
    entry('Avengers: Endgame', BaseItemKind.Movie),
    entry('Loki', BaseItemKind.Series),
    entry('What If...?', BaseItemKind.Series),
    entry('WandaVision', BaseItemKind.Series),
    entry('The Falcon and the Winter Soldier', BaseItemKind.Series),
    entry('Shang-Chi and the Legend of the Ten Rings', BaseItemKind.Movie),
    entry('Eternals', BaseItemKind.Movie),
    entry('Spider-Man: Far From Home', BaseItemKind.Movie),
    entry('Spider-Man: No Way Home', BaseItemKind.Movie),
    entry('Doctor Strange in the Multiverse of Madness', BaseItemKind.Movie),
    entry('Hawkeye', BaseItemKind.Series),
    entry('Moon Knight', BaseItemKind.Series),
    entry('Black Panther: Wakanda Forever', BaseItemKind.Movie),
    entry('She-Hulk: Attorney at Law', BaseItemKind.Series),
    entry('Ms. Marvel', BaseItemKind.Series),
    entry('Thor: Love and Thunder', BaseItemKind.Movie),
    entry('Secret Invasion', BaseItemKind.Series),
    entry('Echo', BaseItemKind.Series),
    entry('Agatha All Along', BaseItemKind.Series),
    entry('Daredevil: Born Again', BaseItemKind.Series)
];

const starWarsReleaseEntries = [
    entry('A New Hope', BaseItemKind.Movie),
    entry('The Empire Strikes Back', BaseItemKind.Movie),
    entry('Return of the Jedi', BaseItemKind.Movie),
    entry('The Phantom Menace', BaseItemKind.Movie),
    entry('Attack of the Clones', BaseItemKind.Movie),
    entry('Revenge of the Sith', BaseItemKind.Movie),
    entry('The Clone Wars', BaseItemKind.Movie),
    entry('The Clone Wars', BaseItemKind.Series),
    entry('Star Wars Rebels', BaseItemKind.Series),
    entry('The Force Awakens', BaseItemKind.Movie),
    entry('Rogue One', BaseItemKind.Movie),
    entry('The Last Jedi', BaseItemKind.Movie),
    entry('Solo', BaseItemKind.Movie),
    entry('Star Wars Resistance', BaseItemKind.Series),
    entry('The Mandalorian', BaseItemKind.Series),
    entry('The Rise of Skywalker', BaseItemKind.Movie),
    entry('The Bad Batch', BaseItemKind.Series),
    entry('The Book of Boba Fett', BaseItemKind.Series),
    entry('Obi-Wan Kenobi', BaseItemKind.Series),
    entry('Andor', BaseItemKind.Series),
    entry('Ahsoka', BaseItemKind.Series),
    entry('The Acolyte', BaseItemKind.Series)
];

const starWarsChronologicalEntries = [
    entry('The Acolyte', BaseItemKind.Series),
    entry('The Phantom Menace', BaseItemKind.Movie),
    entry('Attack of the Clones', BaseItemKind.Movie),
    entry('The Clone Wars', BaseItemKind.Movie),
    entry('The Clone Wars', BaseItemKind.Series),
    entry('Revenge of the Sith', BaseItemKind.Movie),
    entry('The Bad Batch', BaseItemKind.Series),
    entry('Solo', BaseItemKind.Movie),
    entry('Obi-Wan Kenobi', BaseItemKind.Series),
    entry('Andor', BaseItemKind.Series),
    entry('Star Wars Rebels', BaseItemKind.Series),
    entry('Rogue One', BaseItemKind.Movie),
    entry('A New Hope', BaseItemKind.Movie),
    entry('The Empire Strikes Back', BaseItemKind.Movie),
    entry('Return of the Jedi', BaseItemKind.Movie),
    entry('The Mandalorian', BaseItemKind.Series),
    entry('The Book of Boba Fett', BaseItemKind.Series),
    entry('Ahsoka', BaseItemKind.Series),
    entry('Star Wars Resistance', BaseItemKind.Series),
    entry('The Force Awakens', BaseItemKind.Movie),
    entry('The Last Jedi', BaseItemKind.Movie),
    entry('The Rise of Skywalker', BaseItemKind.Movie)
];

const arrowverseEntries = [
    entry('Arrow', BaseItemKind.Series),
    entry('The Flash', BaseItemKind.Series),
    entry('Constantine', BaseItemKind.Series),
    entry('Supergirl', BaseItemKind.Series),
    entry("DC's Legends of Tomorrow", BaseItemKind.Series),
    entry('Legends of Tomorrow', BaseItemKind.Series),
    entry('Black Lightning', BaseItemKind.Series),
    entry('Batwoman', BaseItemKind.Series),
    entry('Superman & Lois', BaseItemKind.Series)
];

export const BUILT_IN_FRANCHISE_WATCH_ORDERS: FranchiseWatchOrderDefinition[] = [
    {
        id: 'marvel-mcu-release',
        hubId: 'marvel',
        name: 'MCU Release Order',
        description: 'Kuratiert nach Veröffentlichungsreihenfolge der MCU-Titel.',
        kind: 'release',
        entries: mcuReleaseEntries
    },
    {
        id: 'marvel-mcu-chronological',
        hubId: 'marvel',
        name: 'MCU Chronologisch',
        description: 'Kuratiertes MCU-Gerüst nach Story-Zeitlinie. Nur vorhandene Titel werden angezeigt.',
        kind: 'chronological',
        entries: mcuChronologicalEntries
    },
    {
        id: 'star-wars-release',
        hubId: 'star-wars',
        name: 'Star Wars Release Order',
        description: 'Filme und Serien in kuratierter Veröffentlichungsreihenfolge.',
        kind: 'release',
        entries: starWarsReleaseEntries
    },
    {
        id: 'star-wars-chronological',
        hubId: 'star-wars',
        name: 'Star Wars Chronologisch',
        description: 'Kuratiertes Story-Zeitlinien-Gerüst mit automatischer Ausblendung fehlender Titel.',
        kind: 'chronological',
        entries: starWarsChronologicalEntries
    },
    {
        id: 'dc-arrowverse-chronological',
        hubId: 'dc',
        name: 'Arrowverse Serien-Reihenfolge',
        description: 'Serienebene nach Einstieg in das gemeinsame TV-Universum; Episoden-Crossovers bleiben serienintern.',
        kind: 'chronological',
        entries: arrowverseEntries
    }
];

const normalizeText = (value: string | null | undefined) => (
    (value || '')
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
);

const getSearchableTitles = (item: ItemDto) => (
    [ item.Name, item.OriginalTitle, item.SortName, item.SeriesName ]
        .map(normalizeText)
        .filter(Boolean)
);

const resolveEntries = (items: ItemDto[], entries: FranchiseWatchOrderEntry[]) => {
    const usedIds = new Set<string>();
    const resolved: ItemDto[] = [];

    entries.forEach(orderEntry => {
        const normalizedTitle = normalizeText(orderEntry.title);
        const match = items.find(item => {
            if (!item.Id || usedIds.has(item.Id)) return false;
            if (orderEntry.type && item.Type !== orderEntry.type) return false;
            if (orderEntry.year && item.ProductionYear !== orderEntry.year) return false;
            return getSearchableTitles(item).includes(normalizedTitle);
        });

        if (match?.Id) {
            usedIds.add(match.Id);
            resolved.push(match);
        }
    });

    return resolved;
};

const getReleaseTime = (item: ItemDto) => {
    const premiere = item.PremiereDate ? Date.parse(item.PremiereDate) : Number.NaN;
    if (!Number.isNaN(premiere)) return premiere;
    if (item.ProductionYear) return Date.UTC(item.ProductionYear, 0, 1);
    return Number.MAX_SAFE_INTEGER;
};

const buildGenericReleaseOrder = (hub: ResolvedFranchiseHub): ResolvedFranchiseWatchOrder | undefined => {
    if (hub.items.length < 2) return undefined;

    return {
        id: `${hub.id}-release-all`,
        name: 'Release-Reihenfolge',
        description: 'Der gesamte Hub nach vorhandenen Veröffentlichungsdaten sortiert.',
        kind: 'release',
        items: [ ...hub.items ].sort((a, b) => {
            const dateDifference = getReleaseTime(a) - getReleaseTime(b);
            if (dateDifference !== 0) return dateDifference;
            return (a.SortName || a.Name || '').localeCompare(b.SortName || b.Name || '');
        })
    };
};

export const resolveFranchiseWatchOrders = (
    hub: ResolvedFranchiseHub,
    config: FranchiseStudioConfig
): ResolvedFranchiseWatchOrder[] => {
    const orders: ResolvedFranchiseWatchOrder[] = [];
    const genericRelease = buildGenericReleaseOrder(hub);
    if (genericRelease) orders.push(genericRelease);

    BUILT_IN_FRANCHISE_WATCH_ORDERS
        .filter(definition => definition.hubId === hub.id)
        .forEach(definition => {
            const items = resolveEntries(hub.items, definition.entries);
            if (items.length < 2) return;

            orders.push({
                id: definition.id,
                name: definition.name,
                description: definition.description,
                kind: definition.kind,
                items
            });
        });

    const hubItemsById = new Map(
        hub.items.filter(item => item.Id).map(item => [ item.Id as string, item ])
    );
    config.watchOrders
        .filter(order => order.hubId === hub.id)
        .forEach(order => {
            const items = order.itemIds
                .map(itemId => hubItemsById.get(itemId))
                .filter((item): item is ItemDto => Boolean(item));
            if (items.length === 0) return;

            orders.push({
                id: order.id,
                name: order.name,
                description: 'Eigene Watch Order aus dem Velaris Franchise Studio.',
                kind: 'custom',
                items
            });
        });

    return orders;
};
