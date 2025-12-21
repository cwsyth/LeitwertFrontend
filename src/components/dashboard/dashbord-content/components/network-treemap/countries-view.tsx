/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import React, {useCallback, useEffect, useState} from 'react';
import {
    TreeMap
} from '@/components/dashboard/dashbord-content/components/network-treemap/tree-map';
import {
    CountriesViewProps,
    TreeMapDataItem,
    TreeMapOthersData
} from '@/types/network';
import {networkApi} from '@/services/networkApi';
import {Skeleton} from "@/components/ui/skeleton";
import {useTimeRangeStore} from "@/lib/stores/time-range-store";
import {determineStatus} from "@/lib/anomaly-status";
import {
    OthersTooltip
} from "@/components/dashboard/dashbord-content/components/network-treemap/tooltips/others-tooltip";
import {
    CountryTooltip
} from "@/components/dashboard/dashbord-content/components/network-treemap/tooltips/country-tooltip";
import {isOthersData} from "@/lib/type-guards";

export function CountriesView({
                                  limit = 50,
                                  onCountryClick,
                                  showLabels,
                                  useGradient,
                                  sizeMetric = 'as_count',
                                  thresholds
                              }: CountriesViewProps) {
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

            const transformedData: TreeMapDataItem[] = response.countries.map(country => {
                const metricValue = country[sizeMetric === 'as_count' ? 'asCount' : sizeMetric === 'ip_count' ? 'ipCount' : 'anomalyCount'];
                const anomalyCount = country.anomalyCount ?? 0;

                return {
                    id: country.code,
                    name: country.name,
                    value: metricValue,
                    status: determineStatus(anomalyCount, thresholds),  // ← NEU
                    anomalyCount: anomalyCount,
                    metadata: {
                        asCount: country.asCount,
                        ipCount: country.ipCount
                    }
                };
            });

            const allValuesZero = transformedData.every(item => item.value === 0);

            if (allValuesZero) {
                transformedData.forEach(item => {
                    item.value = 1;
                });
            }

            const othersValue = sizeMetric === 'as_count'
                ? response.others.totalAsCount
                : sizeMetric === 'anomaly_count'
                    ? response.others.totalAnomalyCount
                    : response.others.totalAsCount;

            const othersData: TreeMapOthersData = {
                name: 'Others',
                value: othersValue === 0 ? 1 : othersValue,
                count: response.others.countryCount,
                totalAnomalyCount: response.others.totalAnomalyCount,
                items: response.others.countries.map(c => ({
                    id: c.code,
                    name: c.name
                }))
            };

            setData(transformedData);
            setOthers(othersData);
        } catch (error) {
            console.error('Failed to load countries data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [limit, sizeMetric, timeRange, thresholds]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const renderTooltip = (item: TreeMapDataItem | TreeMapOthersData) => {
        if (isOthersData(item)) {
            return <OthersTooltip data={item.metadata} type="country"/>;
        }
        return <CountryTooltip data={item as TreeMapDataItem}/>;
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48"/>
                </div>
                <Skeleton className="h-96 w-full"/>
            </div>
        );
    }

    return (
        <TreeMap
            data={data}
            others={others}
            title="Globale Übersicht"
            renderTooltip={renderTooltip}
            onItemClick={handleItemClick}
            showLabels={showLabels}
            useGradient={useGradient}
            thresholds={thresholds}
        />
    );
}
