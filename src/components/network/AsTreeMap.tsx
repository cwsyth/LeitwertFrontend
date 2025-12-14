/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TreeMap } from '@/components/network/TreeMap';
import {
    AsTreeMapProps,
    NetworkStatus,
    TreeMapDataItem,
    TreeMapOthersData,
    OthersMetadata
} from '@/types/network';
import { networkApi } from '@/services/networkApi';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Globe, Hash, Network } from "lucide-react";
import {useTimeRangeStore} from "@/lib/stores/time-range-store";

export function AsTreeMap({
                              countryCode,
                              limit = 10,
                              showLabels,
                              useGradient,
                              sizeMetric = 'ip_count',
                              statusFilter = 'all',
                              onStatusFilterChange,
                              onBackClick
                          }: AsTreeMapProps) {
    const [data, setData] = useState<TreeMapDataItem[]>([]);
    const [others, setOthers] = useState<TreeMapOthersData | undefined>();
    const [countryName, setCountryName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const timeRange = useTimeRangeStore((state) => state.timeRange);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await networkApi.getCountryAs(
                countryCode,
                limit,
                timeRange,
                sizeMetric
            );

            setCountryName(response.country.name);

            const filteredAsNetworks = statusFilter === 'all'
                ? response.country.asNetworks
                : response.country.asNetworks.filter(as => as.status === statusFilter);

            const transformedData: TreeMapDataItem[] = filteredAsNetworks.map(as => {
                let value: number;
                switch (sizeMetric) {
                    case 'ip_count':
                        value = as.ipCount;
                        break;
                    case 'anomaly_count':
                        value = as.anomalyCount;
                        break;
                    default:
                        value = as.ipCount;
                }

                if (as.anomalyCount === undefined) {
                    console.warn(`Missing anomalyCount for AS: ${as.name} (AS${as.asNumber}), defaulting to 0`);
                }

                return {
                    id: as.asNumber.toString(),
                    name: as.name,
                    value: value,
                    status: as.status,
                    anomalyCount: as.anomalyCount ?? 0,
                    metadata: {
                        asNumber: as.asNumber,
                        ipCount: as.ipCount
                    }
                };
            });

            let othersValue: number;
            switch (sizeMetric) {
                case 'ip_count':
                    othersValue = response.others.totalIpCount;
                    break;
                case 'anomaly_count':
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
    }, [countryCode, limit, statusFilter, sizeMetric, timeRange]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
        const isOthersData = (
            item: TreeMapDataItem | TreeMapOthersData
        ): item is TreeMapDataItem & { metadata: OthersMetadata } => {
            return ('metadata' in item &&
                item.metadata !== undefined &&
                'isOthers' in item.metadata && item.metadata.isOthers);
        };

        if (isOthersData(item)) {
            const othersData = item.metadata;
            return (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b pb-2">
                        <Network className="h-4 w-4 text-muted-foreground" />
                        <p className="font-bold text-base">Other AS Networks</p>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">AS Count:</span>
                            <span className="font-semibold ml-auto">{othersData.count.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-muted-foreground">Total Anomalies:</span>
                            <span className="font-semibold ml-auto">{othersData.totalAnomalyCount.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mt-3 pt-2 border-t max-h-40 overflow-y-auto">
                        <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                            Included AS Networks
                        </p>
                        <ul className="text-sm space-y-1">
                            {othersData.items.map(as => (
                                <li key={as.id} className="text-muted-foreground">
                                    AS{as.id} - {as.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            );
        }

        const dataItem = item as TreeMapDataItem;

        const statusColor = {
            healthy: 'bg-green-100 text-green-700 border-green-200',
            warning: 'bg-amber-100 text-amber-700 border-amber-200',
            critical: 'bg-red-100 text-red-700 border-red-200',
            unknown: 'bg-gray-100 text-gray-700 border-gray-200'
        }[dataItem.status];

        return (
            <div className="space-y-3">
                <div className="border-b pb-2">
                    <div className="flex items-center justify-between gap-3 mb-1">
                        <p className="font-bold text-base">{dataItem.name}</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColor}`}>
                        {dataItem.status}
                    </span>
                    </div>
                    {dataItem.metadata && 'asNumber' in dataItem.metadata && (
                        <p className="text-xs text-muted-foreground">AS{dataItem.metadata.asNumber}</p>
                    )}
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-muted-foreground">IP Count:</span>
                        <span className="font-semibold ml-auto">{dataItem.value.toLocaleString()}</span>
                    </div>

                    {dataItem.anomalyCount !== undefined && (
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-muted-foreground">Anomalies:</span>
                            <span className="font-semibold ml-auto">{dataItem.anomalyCount?.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-96 w-full" />
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
            onBackClick={onBackClick}
        />
    );
}
