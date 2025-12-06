/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import { useEffect, useState } from 'react';
import { TreeMap } from '@/components/network/TreeMap';
import {
    AsTreeMapProps,
    NetworkStatus,
    TreeMapDataItem,
    TreeMapOthersData
} from '@/types/network';
import { networkApi } from '@/services/networkApi';

export function AsTreeMap({ countryCode, limit = 10 }: AsTreeMapProps) {
    const [data, setData] = useState<TreeMapDataItem[]>([]);
    const [others, setOthers] = useState<TreeMapOthersData | undefined>();
    const [statusFilter, setStatusFilter] = useState<NetworkStatus | 'all'>('all');
    const [countryName, setCountryName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [countryCode, limit, statusFilter]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await networkApi.getCountryAs(
                countryCode,
                limit,
                statusFilter === 'all' ? undefined : statusFilter
            );

            setCountryName(response.country.name);

            const transformedData: TreeMapDataItem[] = response.country.asNetworks.map(as => ({
                id: as.asNumber.toString(),
                name: as.name,
                value: as.ipCount,
                status: as.status,
                anomalyCount: as.anomalyCount,
                metadata: { asNumber: as.asNumber }
            }));

            const othersData: TreeMapOthersData = {
                name: 'Others',
                value: response.others.totalIpCount,
                count: response.others.asCount,
                totalAnomalyCount: response.others.totalAnomalyCount,
                items: response.others.asNetworks.map(as => ({
                    id: as.asNumber.toString(),
                    name: as.name
                }))
            };

            setData(transformedData);
            setOthers(othersData);
        } catch (error) {
            console.error('Failed to load AS data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderTooltip = (item: TreeMapDataItem | TreeMapOthersData) => {
        if ('metadata' in item && item.metadata?.isOthers) {
            const othersData = item.metadata as TreeMapOthersData;
            return (
                <div className="space-y-2">
                    <p className="font-bold">Other AS Networks</p>
                    <p>AS Count: {othersData.count}</p>
                    <p>Total Anomalies: {othersData.totalAnomalyCount}</p>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                        <p className="text-sm font-semibold mb-1">AS Networks:</p>
                        <ul className="text-sm space-y-1">
                            {othersData.items.map(as => (
                                <li key={as.id}>AS{as.id} - {as.name}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-1">
                <p className="font-bold">{item.name}</p>
                {item.metadata?.asNumber && <p>AS{item.metadata.asNumber}</p>}
                <p>IP Count: {item.value.toLocaleString()}</p>
                <p>Anomalies: {item.anomalyCount}</p>
                <p className="capitalize">Status: {item.status}</p>
            </div>
        );
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <TreeMap
            data={data}
            others={others}
            title={`AS Networks in ${countryName}`}
            onStatusFilter={setStatusFilter}
            currentStatus={statusFilter}
            renderTooltip={renderTooltip}
        />
    );
}