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

export function AsTreeMap({ countryCode, limit = 10, showLabels }: AsTreeMapProps) {
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
        const isOthersData = (item: TreeMapDataItem | TreeMapOthersData): boolean => {
            return 'metadata' in item && item.metadata?.isOthers === true;
        };

        if (isOthersData(item)) {
            const othersData = (item as TreeMapDataItem).metadata as TreeMapOthersData;
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

        const dataItem = item as TreeMapDataItem;
        return (
            <div className="space-y-1">
                <p className="font-bold">{dataItem.name}</p>
                {dataItem.metadata?.asNumber && <p>AS{dataItem.metadata.asNumber}</p>}
                <p>IP Count: {dataItem.value.toLocaleString()}</p>
                <p>Anomalies: {dataItem.anomalyCount}</p>
                <p className="capitalize">Status: {dataItem.status}</p>
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
            showLabels={showLabels}
        />
    );
}