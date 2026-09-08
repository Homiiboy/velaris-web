import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { describe, expect, it } from 'vitest';

import type { ItemDto } from 'types/base/models/item-dto';

import { buildVelarisFranchiseHubs } from './franchiseEngine';
import {
    assignFranchiseStudioItem,
    createFranchiseStudioHub,
    createFranchiseStudioWatchOrder,
    EMPTY_FRANCHISE_STUDIO_CONFIG,
    excludeFranchiseStudioItem,
    sanitizeFranchiseStudioConfig
} from './franchiseStudio';
import { applyFranchiseStudioConfig } from './franchiseStudioResolver';
import { resolveFranchiseWatchOrders } from './watchOrders';

const createItem = (overrides: Partial<ItemDto>): ItemDto => ({
    Id: overrides.Id || overrides.Name || 'studio-test-item',
    Type: BaseItemKind.Movie,
    ...overrides
} as ItemDto);

describe('Franchise Studio configuration', () => {
    it('repairs malformed stored configuration', () => {
        const config = sanitizeFranchiseStudioConfig({
            version: 99,
            overrides: {
                DC: {
                    groups: [ { id: ' My Group ', name: 'Custom Era' }, { id: '', name: 'Broken' } ],
                    assignments: { item1: ' My Group ' },
                    excludedItemIds: [ 'item2', 'item2', null ],
                    groupOrder: [ ' My Group ', ' My Group ' ]
                }
            },
            customHubs: 'broken',
            watchOrders: []
        });

        expect(config.version).toBe(1);
        expect(config.overrides.dc.groups).toEqual([ { id: 'my-group', name: 'Custom Era' } ]);
        expect(config.overrides.dc.assignments).toEqual({ item1: 'my-group' });
        expect(config.overrides.dc.excludedItemIds).toEqual([ 'item2' ]);
        expect(config.overrides.dc.groupOrder).toEqual([ 'my-group' ]);
        expect(config.customHubs).toEqual([]);
    });

    it('manual assignment overrides automatic group membership without changing library metadata', () => {
        const items = [
            createItem({ Id: 'arrow', Name: 'Arrow', Type: BaseItemKind.Series }),
            createItem({ Id: 'flash', Name: 'The Flash', Type: BaseItemKind.Series })
        ];
        const baseHubs = buildVelarisFranchiseHubs(items);
        const config = assignFranchiseStudioItem(
            sanitizeFranchiseStudioConfig(EMPTY_FRANCHISE_STUDIO_CONFIG),
            'dc',
            'arrow',
            'batman'
        );
        const dc = applyFranchiseStudioConfig(baseHubs, items, config)
            .find(hub => hub.id === 'dc');

        expect(dc?.groups.find(group => group.id === 'arrowverse')?.items.map(item => item.Id))
            .toEqual([ 'flash' ]);
        expect(dc?.groups.find(group => group.id === 'batman')?.items.map(item => item.Id))
            .toEqual([ 'arrow' ]);
    });

    it('can explicitly exclude an automatically matched title', () => {
        const items = [ createItem({ Id: 'arrow', Name: 'Arrow', Type: BaseItemKind.Series }) ];
        const baseHubs = buildVelarisFranchiseHubs(items);
        const config = excludeFranchiseStudioItem(
            sanitizeFranchiseStudioConfig(EMPTY_FRANCHISE_STUDIO_CONFIG),
            'dc',
            'arrow'
        );

        expect(applyFranchiseStudioConfig(baseHubs, items, config).find(hub => hub.id === 'dc'))
            .toBeUndefined();
    });

    it('creates a custom universe that only resolves media present in the library', () => {
        const items = [ createItem({ Id: 'one', Name: 'One' }) ];
        const created = createFranchiseStudioHub(
            sanitizeFranchiseStudioConfig(EMPTY_FRANCHISE_STUDIO_CONFIG),
            'Weekend Saga'
        );
        const hubId = created.hubId as string;
        let config = assignFranchiseStudioItem(created.config, hubId, 'one', 'main');
        config = assignFranchiseStudioItem(config, hubId, 'missing', 'main');

        const customHub = applyFranchiseStudioConfig([], items, config)
            .find(hub => hub.id === hubId);

        expect(customHub?.name).toBe('Weekend Saga');
        expect(customHub?.items.map(item => item.Id)).toEqual([ 'one' ]);
    });

    it('resolves custom Watch Orders only against titles still present in the hub', () => {
        const items = [
            createItem({ Id: 'one', Name: 'One', ProductionYear: 2020 }),
            createItem({ Id: 'two', Name: 'Two', ProductionYear: 2021 })
        ];
        const created = createFranchiseStudioHub(
            sanitizeFranchiseStudioConfig(EMPTY_FRANCHISE_STUDIO_CONFIG),
            'Weekend Saga'
        );
        const hubId = created.hubId as string;
        let config = assignFranchiseStudioItem(created.config, hubId, 'one', 'main');
        config = assignFranchiseStudioItem(config, hubId, 'two', 'main');
        config = createFranchiseStudioWatchOrder(config, hubId, 'Reverse', [ 'two', 'missing', 'one' ]);
        const hub = applyFranchiseStudioConfig([], items, config).find(candidate => candidate.id === hubId);
        const customOrder = hub ? resolveFranchiseWatchOrders(hub, config).find(order => order.kind === 'custom') : undefined;

        expect(customOrder?.items.map(item => item.Id)).toEqual([ 'two', 'one' ]);
    });

    it('suppresses curated Watch Orders until enough matching media exists', () => {
        const items = [ createItem({ Id: 'iron-man', Name: 'Iron Man', ProductionYear: 2008 }) ];
        const marvel = buildVelarisFranchiseHubs(items).find(hub => hub.id === 'marvel');
        const config = sanitizeFranchiseStudioConfig(EMPTY_FRANCHISE_STUDIO_CONFIG);

        expect(marvel && resolveFranchiseWatchOrders(marvel, config).filter(order => order.id === 'marvel-mcu-release'))
            .toEqual([]);
    });
});
