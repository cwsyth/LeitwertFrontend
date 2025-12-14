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
    anomalies: string[];
}

export interface AsNetworkData {
    asNumber: number;
    name: string;
    ipCount: number;
    status: NetworkStatus;
    anomalyCount: number;
    anomalies: string[];
}

export interface CountriesSummaryResponse {
    countries: CountryData[];
    others: {
        countryCount: number;
        totalAsCount: number;
        totalAnomalyCount: number;
        totalIpCount: number;
        countries: CountryData[];
        metadata: {
            totalCountries: number;
            totalAsCount: number;
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
        asNetworks: AsNetworkData[];
        metadata: {
            totalAsCount: number;
            lastUpdated: string;
        };
    };
}

export type NetworkStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

interface CountryMetadata {
    asCount: number;
    ipCount: number;
}

interface AsMetadata {
    asNumber: number;
    ipCount: number;
}

export interface TreeMapOthersData {
    name: string;
    value: number;
    count: number;
    totalAnomalyCount: number;
    items: Array<{ id: string; name: string }>;
}

export interface OthersMetadata extends TreeMapOthersData {
    isOthers: true;
    actualValue: number;
}

export interface TreeMapDataItem {
    id: string;
    name: string;
    value: number;
    status: NetworkStatus;
    anomalyCount: number;
    metadata?: CountryMetadata | AsMetadata | OthersMetadata;
    [key: string]: unknown;
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

export type CountrySizeMetric = 'as_count' | 'ip_count' | 'anomaly_count';
export type AsSizeMetric = 'ip_count' | 'anomaly_count';

export const COUNTRY_SIZE_METRIC_LABELS: Record<CountrySizeMetric, string> = {
    as_count: 'AS Count',
    anomaly_count: 'Anomalien',
    ip_count: 'IP Count'
};

export const AS_SIZE_METRIC_LABELS: Record<AsSizeMetric, string> = {
    ip_count: 'IP Count',
    anomaly_count: 'Anomalien'
};
