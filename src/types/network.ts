/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import { ReactNode } from "react";

export interface CountryData {
    code: string;
    name: string;
    asCount: number;
    anomalyCount: number;
    status: NetworkStatus;
    ipCount: number;
}

export interface AsNetworkData {
    asNumber: number;
    name: string;
    ipCount: number;
    status: NetworkStatus;
    anomalyCount: number;
}

export interface CountriesSummaryResponse {
    countries: CountryData[];
    others: {
        countryCount: number;
        totalAsCount: number;
        totalAnomalyCount: number;
        countries: Array<{ code: string; name: string }>;
        metadata: {
            totalCountries: number;
            lastUpdated: string;
        };
    };
}

export interface CountryAsResponse {
    country: {
        code: string;
        name: string;
        asNetworks: AsNetworkData[];
    };
    others: {
        asCount: number;
        totalIpCount: number;
        totalAnomalyCount: number;
        asNetworks: Array<{ asNumber: number; name: string }>;
        metadata: {
            totalAsCount: number;
            lastUpdated: string;
        };
    };
}

export type NetworkStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

export interface TreeMapDataItem {
    id: string;
    name: string;
    value: number;
    status: NetworkStatus;
    anomalyCount: number;
    metadata?: Record<string, any>;
}

export interface TreeMapOthersData {
    name: string;
    value: number;
    count: number;
    totalAnomalyCount: number;
    items: Array<{ id: string; name: string }>;
}

export interface TreeMapProps {
    data: TreeMapDataItem[],
    others?: TreeMapOthersData,
    title: string,
    onStatusFilter?: (status: NetworkStatus | 'all') => void,
    currentStatus: NetworkStatus | 'all',
    renderTooltip: (data: TreeMapDataItem | TreeMapOthersData) => ReactNode,
    othersDisplaySize?: number,
    onItemClick?: (item: TreeMapDataItem) => void,
    showLabels?: boolean,
    useGradient?: boolean,
    anomalyRanges?: Record<NetworkStatus, {
        min: number;
        max: number
    }>,
    onBackClick?: () => void;
}

export interface AsTreeMapProps {
    countryCode: string,
    limit?: number,
    showLabels?: boolean,
    useGradient?: boolean,
    sizeMetric?: AsSizeMetric,
    statusFilter?: NetworkStatus | 'all'
    onStatusFilterChange?: (status: NetworkStatus | 'all') => void;
    onBackClick?: () => void;
}

export interface CountriesTreeMapProps {
    limit?: number,
    onCountryClick?: (countryCode: string) => void,
    showLabels?: boolean,
    useGradient?: boolean,
    sizeMetric?: CountrySizeMetric,
    statusFilter?: NetworkStatus | 'all'
    onStatusFilterChange?: (status: NetworkStatus | 'all') => void;
}

export type CountrySizeMetric = 'asCount' | 'anomalyCount' | 'ipCount';
export type AsSizeMetric = 'ipCount' | 'anomalyCount';

export const COUNTRY_SIZE_METRIC_LABELS: Record<CountrySizeMetric, string> = {
    asCount: 'AS Count',
    anomalyCount: 'Anomalien',
    ipCount: 'IP Count'
};

export const AS_SIZE_METRIC_LABELS: Record<AsSizeMetric, string> = {
    ipCount: 'IP Count',
    anomalyCount: 'Anomalien'
};