/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TreeMap } from '@/components/network/TreeMap';
import {
    TreeMapDataItem, TreeMapOthersData, NetworkStatus,
    CountriesTreeMapProps, OthersMetadata
} from '@/types/network';
import { networkApi } from '@/services/networkApi';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Building2, Globe } from "lucide-react";
import {useTimeRangeStore} from "@/lib/stores/time-range-store";

export function CountriesTreeMap({
                                     limit = 50,
                                     onCountryClick,
                                     showLabels,
                                     useGradient,
                                     sizeMetric = 'as_count',
                                     statusFilter = 'all',
                                     onStatusFilterChange
                                 }: CountriesTreeMapProps) {
    const [data, setData] = useState<TreeMapDataItem[]>([]);
    const [others, setOthers] = useState<TreeMapOthersData | undefined>();
    const [isLoading, setIsLoading] = useState(true);

    const timeRange = useTimeRangeStore((state) => state.timeRange);

    const handleItemClick = (item: TreeMapDataItem) => {
        if (onCountryClick) {
            onCountryClick(item.id);
        }
    };

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await networkApi.getCountriesSummary(limit, timeRange, sizeMetric);

            const filteredCountries = statusFilter === 'all'
                ? response.countries
                : response.countries.filter(country => country.status === statusFilter);

            const transformedData: TreeMapDataItem[] = filteredCountries.map(country => {
                let value: number;
                switch (sizeMetric) {
                    case 'as_count':
                        value = country.asCount;
                        break;
                    case 'anomaly_count':
                        value = country.anomalyCount;
                        break;
                    case 'ip_count':
                        value = country.ipCount;
                        break;
                    default:
                        value = country.asCount;
                }

                if (country.anomalyCount === undefined) {
                    console.warn(`Missing anomalyCount for country: ${country.name} (${country.code}), defaulting to 0`);
                }

                return {
                    id: country.code,
                    name: country.name,
                    value: value,
                    status: country.status,
                    anomalyCount: country.anomalyCount ?? 0,
                    metadata: { ipCount: country.ipCount }
                }
            });

            let othersValue: number;
            switch (sizeMetric) {
                case 'as_count':
                    othersValue = response.others.totalAsCount;
                    break;
                case 'anomaly_count':
                    othersValue = response.others.totalAnomalyCount;
                    break;
                default:
                    othersValue = response.others.totalAsCount;
            }

            const othersData: TreeMapOthersData = {
                name: 'Others',
                value: othersValue,
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
    }, [limit, statusFilter, sizeMetric, timeRange]);

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
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <p className="font-bold text-base">Other Countries</p>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Countries:</span>
                            <span className="font-semibold ml-auto">{othersData.count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-muted-foreground">Total Anomalies:</span>
                            <span className="font-semibold ml-auto">{othersData.totalAnomalyCount.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mt-3 pt-2 border-t max-h-40 overflow-y-auto">
                        <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                            Included Countries
                        </p>
                        <ul className="text-sm space-y-1">
                            {othersData.items.map(country => (
                                <li key={country.id} className="text-muted-foreground">
                                    {country.name}
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
                <div className="flex items-center justify-between gap-3 border-b pb-2">
                    <p className="font-bold text-base">{dataItem.name}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColor}`}>
                    {dataItem.status}
                </span>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">AS Count:</span>
                        <span className="font-semibold ml-auto">{dataItem.value.toLocaleString()}</span>
                    </div>

                    {dataItem.anomalyCount !== undefined && (
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-muted-foreground">Anomalies:</span>
                            <span className="font-semibold ml-auto">{dataItem.anomalyCount.toLocaleString()}</span>
                        </div>
                    )}

                    {dataItem.metadata && 'ipCount' in dataItem.metadata && (
                        <div className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-muted-foreground">IP Count:</span>
                            <span className="font-semibold ml-auto">{dataItem.metadata.ipCount.toLocaleString()}</span>
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
            title="Globale Übersicht"
            onStatusFilter={onStatusFilterChange}
            currentStatus={statusFilter}
            renderTooltip={renderTooltip}
            onItemClick={handleItemClick}
            showLabels={showLabels}
            useGradient={useGradient}
            anomalyRanges={anomalyRanges}
        />
    );
}
