import React, { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import { CardShape } from 'components/cardbuilder/utils/shape';
import SectionContainer from 'components/common/SectionContainer';
import { useApi } from 'hooks/useApi';

import type { ResolvedFranchiseHub } from './franchiseEngine';
import type { FranchiseStudioConfig } from './franchiseStudio';
import {
    resolveFranchiseWatchOrders,
    type ResolvedFranchiseWatchOrder
} from './watchOrders';

interface FranchiseWatchOrdersProps {
    hub: ResolvedFranchiseHub
    config: FranchiseStudioConfig
}

const ORDER_KIND_LABELS: Record<ResolvedFranchiseWatchOrder['kind'], string> = {
    release: 'Release',
    chronological: 'Chronologisch',
    custom: 'Eigene Reihenfolge'
};

const FranchiseWatchOrders: FC<FranchiseWatchOrdersProps> = ({ hub, config }) => {
    const { __legacyApiClient__ } = useApi();
    const orders = useMemo(
        () => resolveFranchiseWatchOrders(hub, config),
        [ config, hub ]
    );
    const [ activeOrderId, setActiveOrderId ] = useState<string | undefined>(orders[0]?.id);

    useEffect(() => {
        if (!orders.some(order => order.id === activeOrderId)) {
            setActiveOrderId(orders[0]?.id);
        }
    }, [ activeOrderId, orders ]);

    const onOrderClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const orderId = event.currentTarget.dataset.orderId;
        if (orderId) setActiveOrderId(orderId);
    }, []);

    if (orders.length === 0) return null;

    const activeOrder = orders.find(order => order.id === activeOrderId) || orders[0];

    return (
        <section className='velaris-watch-orders' aria-labelledby={`velaris-watch-orders-${hub.id}`}>
            <div className='velaris-watch-orders__heading'>
                <div>
                    <span className='velaris-watch-orders__eyebrow'>WATCH ORDERS</span>
                    <h2 id={`velaris-watch-orders-${hub.id}`}>Reihenfolgen</h2>
                    <p>Nur Titel, die in deiner Mediathek vorhanden sind, erscheinen in diesen Reihenfolgen.</p>
                </div>
            </div>

            <div className='velaris-watch-orders__tabs' role='tablist' aria-label={`${hub.name} Watch Orders`}>
                {orders.map(order => (
                    <button
                        key={order.id}
                        type='button'
                        role='tab'
                        className={`velaris-watch-orders__tab${order.id === activeOrder.id ? ' velaris-watch-orders__tab--active' : ''}`}
                        data-order-id={order.id}
                        aria-selected={order.id === activeOrder.id}
                        onClick={onOrderClick}
                    >
                        <span>{order.name}</span>
                        <small>{ORDER_KIND_LABELS[order.kind]} · {order.items.length}</small>
                    </button>
                ))}
            </div>

            <div className='velaris-watch-orders__active' role='tabpanel'>
                <p className='velaris-watch-orders__description'>{activeOrder.description}</p>
                <SectionContainer
                    className='velaris-watch-orders__row'
                    items={activeOrder.items}
                    cardOptions={{
                        scalable: true,
                        overlayPlayButton: true,
                        showTitle: true,
                        centerText: true,
                        cardLayout: false,
                        shape: CardShape.PortraitOverflow,
                        showYear: true,
                        serverId: __legacyApiClient__?.serverId()
                    }}
                />
            </div>
        </section>
    );
};

export default FranchiseWatchOrders;
