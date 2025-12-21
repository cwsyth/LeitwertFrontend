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
import {AsViewProps, TreeMapDataItem, TreeMapOthersData} from '@/types/network';
import {networkApi} from '@/services/networkApi';
import {Skeleton} from "@/components/ui/skeleton";
import {useTimeRangeStore} from "@/lib/stores/time-range-store";
import {determineStatus} from "@/lib/anomaly-status";
import {isOthersData} from "@/lib/type-guards";
import {
    OthersTooltip
} from "@/components/dashboard/dashbord-content/components/network-treemap/tooltips/others-tooltip";
import {
    AsTooltip
} from "@/components/dashboard/dashbord-content/components/network-treemap/tooltips/as-tooltip";

export function AsView({
                           countryCode,
                           limit = 10,
                           showLabels,
                           useGradient,
                           sizeMetric = 'ip_count',
                           onBackClick,
                           thresholds,
                           setSelectedAs
                       }: AsViewProps) {
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

            const transformedData: TreeMapDataItem[] = response.country.asNetworks.map(as => {
                const metricValue = as[sizeMetric === 'ip_count' ? 'ipCount' : 'anomalyCount'];
                const anomalyCount = as.anomalyCount ?? 0;

                return {
                    id: as.asNumber.toString(),
                    name: as.name,
                    value: metricValue,
                    status: determineStatus(anomalyCount, thresholds),
                    anomalyCount: anomalyCount,
                    metadata: {
                        asNumber: as.asNumber,
                        ipCount: as.ipCount
                    }
                };
            });

            const allValuesZero = transformedData.every(item => item.value === 0);

            if (allValuesZero) {
                transformedData.forEach(item => {
                    item.value = 1;
                });
            }

            const othersValue = sizeMetric === 'ip_count'
                ? response.others.totalIpCount
                : response.others.totalAnomalyCount;

            const othersData: TreeMapOthersData = {
                name: 'Others',
                value: othersValue === 0 ? 1 : othersValue,
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
    }, [countryCode, limit, sizeMetric, timeRange, thresholds]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const renderTooltip = (item: TreeMapDataItem | TreeMapOthersData) => {
        if (isOthersData(item)) {
            return <OthersTooltip data={item.metadata} type="as"/>;
        }
        return <AsTooltip data={item as TreeMapDataItem}/>;
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
            title={`Autonome Systeme - ${countryName}`}
            renderTooltip={renderTooltip}
            showLabels={showLabels}
            useGradient={useGradient}
            thresholds={thresholds}
            onBackClick={onBackClick}
            onItemClick={(item) => {
                if (!isOthersData(item) && item.metadata && 'asNumber' in item.metadata) {
                    setSelectedAs(item.metadata.asNumber);
                }
            }}
        />
    );
}
