/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { TreeMap } from '@/components/network/TreeMap';
import {
    AsTreeMapProps,
    NetworkStatus,
    TreeMapDataItem,
    TreeMapOthersData
} from '@/types/network';
import { networkApi } from '@/services/networkApi';
import { Skeleton } from "@/components/ui/skeleton";

export function AsTreeMap({
                              countryCode,
                              limit = 10,
                              showLabels,
                              useGradient,
                              sizeMetric = 'ipCount',
                              statusFilter = 'all',
                              onStatusFilterChange
                          }: AsTreeMapProps) {
    const [data, setData] = useState<TreeMapDataItem[]>([]);
    const [others, setOthers] = useState<TreeMapOthersData | undefined>();
    const [countryName, setCountryName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [countryCode, limit, statusFilter, sizeMetric]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await networkApi.getCountryAs(
                countryCode,
                limit,
                statusFilter === 'all' ? undefined : statusFilter
            );

            setCountryName(response.country.name);

            const transformedData: TreeMapDataItem[] = response.country.asNetworks.map(as => {
                let value: number;
                switch (sizeMetric) {
                    case 'ipCount':
                        value = as.ipCount;
                        break;
                    case 'anomalyCount':
                        value = as.anomalyCount;
                        break;
                    default:
                        value = as.ipCount;
                }

                return {
                    id: as.asNumber.toString(),
                    name: as.name,
                    value: value,
                    status: as.status,
                    anomalyCount: as.anomalyCount,
                    metadata: {
                        asNumber: as.asNumber,
                        ipCount: as.ipCount
                    }
                };
            });

            let othersValue: number;
            switch (sizeMetric) {
                case 'ipCount':
                    othersValue = response.others.totalIpCount;
                    break;
                case 'anomalyCount':
                    othersValue = response.others.totalAnomalyCount;
                    break;
                default:
                    othersValue = response.others.totalIpCount;
            }

            const othersData: TreeMapOthersData = {
                name: 'Others',
                value: othersValue,
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

    const anomalyRanges = React.useMemo(() => {
        if (!useGradient || data.length === 0) return undefined;

        // Group anomaly counts by status
        const byStatus = data.reduce((acc, item) => {
            (acc[item.status] ||= []).push(item.anomalyCount);
            return acc;
        }, {} as Record<NetworkStatus, number[]>);

        // Calculate min and max for each status
        return Object.entries(byStatus).reduce((acc, [status, counts]) => {
            acc[status as NetworkStatus] = {
                min: Math.min(...counts),
                max: Math.max(...counts)
            };
            return acc;
        }, {} as Record<NetworkStatus, { min: number; max: number }>);
    }, [data, useGradient]);

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
                <p>Anomalies: {dataItem.anomalyCount.toLocaleString()}</p>
                <p className="capitalize">Status: {dataItem.status}</p>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" /> {/* Titel */}
                </div>
                <Skeleton className="h-96 w-full" /> {/* TreeMap */}
            </div>
        );
    }

    return (
        <TreeMap
            data={data}
            others={others}
            title={`${countryName} - Autonome Systeme`}
            onStatusFilter={onStatusFilterChange}
            currentStatus={statusFilter}
            renderTooltip={renderTooltip}
            showLabels={showLabels}
            useGradient={useGradient}
            anomalyRanges={anomalyRanges}
        />
    );
}