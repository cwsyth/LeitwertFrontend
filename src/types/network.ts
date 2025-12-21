/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import { ReactNode } from "react";
import { EntityStatus } from "./dashboard";

export interface CountryData {
    code: string;
    name: string;
    asCount: number;
    anomalyCount: number;
    ipCount: number;
    anomalies: {
        bgp: string[];
        ping: string[];
    };
}

export interface AsNetworkData {
    asNumber: number;
    name: string;
    ipCount: number;
    anomalyCount: number;
    anomalies: {
        bgp: string[];
        ping: string[];
    };
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

export type NetworkStatus = EntityStatus;

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
    anomalyCount: number;
    metadata?: CountryMetadata | AsMetadata | OthersMetadata;
    [key: string]: unknown;
}

export interface TreeMapProps {
    data: TreeMapDataItem[];
    others?: TreeMapOthersData;
    title: string;
    renderTooltip: (data: TreeMapDataItem | TreeMapOthersData) => ReactNode;
    othersDisplaySize?: number;
    onItemClick?: (item: TreeMapDataItem) => void;
    showLabels?: boolean;
    useGradient?: boolean;
    anomalyRanges?: Record<NetworkStatus, {
        min: number;
        max: number;
    }>;
    onBackClick?: () => void;
}

export interface AsViewProps {
    countryCode: string;
    limit?: number;
    showLabels?: boolean;
    useGradient?: boolean;
    sizeMetric?: AsSizeMetric;
    onBackClick?: () => void;
    thresholds: StatusThresholds;
}

export interface CountriesViewProps {
    limit?: number;
    onCountryClick?: (countryCode: string) => void;
    showLabels?: boolean;
    useGradient?: boolean;
    sizeMetric?: CountrySizeMetric;
    thresholds: StatusThresholds;
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

export type NetworkRegistry = 'ripencc' | 'arin' | 'apnic' | 'lacnic' | 'afrinic';

export type AllocationStatus = 'allocated' | 'assigned' | 'reserved' | 'available';

export interface NetworkDetail {
    asn: string;
    name?: string;
    organization?: string;
    country: string;
    registry: NetworkRegistry;
    status2: AllocationStatus;
    ipv4_cidrs: string[];
    routers: number;
    anomalies: {
        bgp: number;
        ping: number;
    };
}

export interface NetworkDetailsResponse {
    details: NetworkDetail[];
    meta: {
        total_entries: number;
        page: number;
        limit: number;
        has_next: boolean;
    };
}

export interface StatusThresholds {
    healthy: { min: number; max: number };
    warning: { min: number; max: number };
    critical: { min: number; max: number };
}
