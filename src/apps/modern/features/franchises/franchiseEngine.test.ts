import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { describe, expect, it } from 'vitest';

import type { ItemDto } from 'types/base/models/item-dto';

import { buildVelarisFranchiseHubs } from './franchiseEngine';

const createItem = (overrides: Partial<ItemDto>): ItemDto => ({
    Id: overrides.Id || overrides.Name || Math.random().toString(),
    Type: BaseItemKind.Movie,
    ...overrides
} as ItemDto);

describe('buildVelarisFranchiseHubs', () => {
    it('does not create empty hubs for unrelated media', () => {
        const hubs = buildVelarisFranchiseHubs([
            createItem({ Name: 'Unrelated Movie' })
        ]);

        expect(hubs).toHaveLength(0);
    });

    it('matches localized titles through OriginalTitle metadata', () => {
        const hubs = buildVelarisFranchiseHubs([
            createItem({
                Name: 'The First Avenger: Captain America',
                OriginalTitle: 'Captain America: The First Avenger',
                ProductionYear: 2011
            })
        ]);
        const marvel = hubs.find(hub => hub.id === 'marvel');

        expect(marvel).toBeDefined();
        expect(marvel?.groups.find(group => group.id === 'mcu-phase-one')?.items)
            .toHaveLength(1);
    });

    it('keeps curated Arrowverse series order independent of input order', () => {
        const hubs = buildVelarisFranchiseHubs([
            createItem({ Id: 'supergirl', Type: BaseItemKind.Series, Name: 'Supergirl', ProductionYear: 2015 }),
            createItem({ Id: 'flash', Type: BaseItemKind.Series, Name: 'The Flash', ProductionYear: 2014 }),
            createItem({ Id: 'arrow', Type: BaseItemKind.Series, Name: 'Arrow', ProductionYear: 2012 })
        ]);
        const arrowverse = hubs
            .find(hub => hub.id === 'dc')
            ?.groups.find(group => group.id === 'arrowverse');

        expect(arrowverse?.items.map(item => item.Name)).toEqual([
            'Arrow',
            'The Flash',
            'Supergirl'
        ]);
    });

    it('suppresses every DC subgroup that has no matching media', () => {
        const hubs = buildVelarisFranchiseHubs([
            createItem({ Id: 'arrow', Type: BaseItemKind.Series, Name: 'Arrow' })
        ]);
        const dc = hubs.find(hub => hub.id === 'dc');

        expect(dc?.groups.map(group => group.id)).toEqual([ 'arrowverse' ]);
    });

    it('supports manual franchise assignment tags as a fallback', () => {
        const hubs = buildVelarisFranchiseHubs([
            createItem({
                Name: 'Custom DC Special',
                Tags: [ 'velaris:franchise:dc' ]
            })
        ]);
        const dc = hubs.find(hub => hub.id === 'dc');
        const fallback = dc?.groups.find(group => group.id === 'other');

        expect(fallback?.items.map(item => item.Name)).toEqual([ 'Custom DC Special' ]);
    });

    it('does not duplicate known MCU titles into the MCU remainder row', () => {
        const hubs = buildVelarisFranchiseHubs([
            createItem({
                Name: 'Iron Man',
                ProductionYear: 2008,
                Studios: [ { Name: 'Marvel Studios' } ]
            })
        ]);
        const marvel = hubs.find(hub => hub.id === 'marvel');

        expect(marvel?.groups.some(group => group.id === 'mcu-phase-one')).toBe(true);
        expect(marvel?.groups.some(group => group.id === 'mcu-other')).toBe(false);
    });
});
