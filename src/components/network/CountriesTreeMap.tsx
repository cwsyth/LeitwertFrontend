/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import { useState, useEffect } from 'react';
import { TreeMap } from '@/components/network/TreeMap';
import {
    TreeMapDataItem, TreeMapOthersData, NetworkStatus,
    CountriesTreeMapProps
} from '@/types/network';
import { networkApi } from '@/services/networkApi';

export function CountriesTreeMap({ limit = 50, onCountryClick }: CountriesTreeMapProps) {
    const [data, setData] = useState<TreeMapDataItem[]>([]);
    const [others, setOthers] = useState<TreeMapOthersData | undefined>();
    const [statusFilter, setStatusFilter] = useState<NetworkStatus | 'all'>('all');
    const [isLoading, setIsLoading] = useState(true);

    const handleItemClick = (item: TreeMapDataItem) => {
        if (onCountryClick) {
            onCountryClick(item.id); // item.id ist der Country Code
        }
    };

    useEffect(() => {
        loadData();
    }, [limit, statusFilter]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await networkApi.getCountriesSummary(
                limit,
                statusFilter === 'all' ? undefined : statusFilter
            );

            const transformedData: TreeMapDataItem[] = response.countries.map(country => ({
                id: country.code,
                name: country.name,
                value: country.asCount,
                status: country.status,
                anomalyCount: country.anomalyCount,
                metadata: { ipCount: country.ipCount }
            }));

            const othersData: TreeMapOthersData = {
                name: 'Others',
                value: response.others.totalAsCount,
                count: response.others.countryCount,
                totalAnomalyCount: response.others.totalAnomalyCount,
                items: response.others.countries.map(c => ({ id: c.code, name: c.name }))
            };

            setData(transformedData);
            setOthers(othersData);
        } catch (error) {
            console.error('Failed to load countries data:', error);
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
                    <p className="font-bold">Other Countries</p>
                    <p>Countries: {othersData.count}</p>
                    <p>Total Anomalies: {othersData.totalAnomalyCount}</p>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                        <p className="text-sm font-semibold mb-1">Countries:</p>
                        <ul className="text-sm space-y-1">
                            {othersData.items.map(country => (
                                <li key={country.id}>{country.name}</li>
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
                <p>AS Count: {dataItem.value}</p>
                <p>Anomalies: {dataItem.anomalyCount}</p>
                <p className="capitalize">Status: {dataItem.status}</p>
                {dataItem.metadata?.ipCount && (
                    <p>IP Count: {dataItem.metadata.ipCount.toLocaleString()}</p>
                )}
            </div>
        );
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <TreeMap
            data={data}
            others={others}
            title="Countries by AS Count"
            onStatusFilter={setStatusFilter}
            currentStatus={statusFilter}
            renderTooltip={renderTooltip}
            onItemClick={handleItemClick}
        />
    );
}