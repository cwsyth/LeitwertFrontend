export type DashboardContentMode = "street" | "hierarchy";

export interface DashboardViewVisibility {
    timeline: boolean;
    bgpAnnouncements: boolean;
}

export interface BGPAnnounceASCount {
    timestamp: string;
    as_path_entry: string;
    total_increments: number;
    p01: number;
    p05: number;
    p25: number;
    p50: number;
    p075: number;
    p095: number;
    p099: number;

    // Analysis fields (optional)
    mean?: number;
    std?: number;
    is_anomaly?: boolean;
    anomaly_score?: number;
}

export interface Country {
    code: string;
    name: string;
}

export type EntityStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

export interface Router {
    router_id: string;
    asn: string;
    geohash: string;
    location: {
        city: string,
        isp: string,
        lat: number,
        lon: number,
        region: string
    },
    status: EntityStatus
}

export interface Location {
    id: string;
    description: string;
}

// Chart & Data Types

export type QueryMode = "as" | "cc" | "ip";

export interface PingDataResponse {
    timestamp: string;
    target_ip: string;
    location: string;
    avg_rtt?: number;
    avg_ttl?: number;
    next_power_of_2?: number;
    p01?: number;
    p05?: number;
    p25?: number;
    p50?: number;
    p75?: number;
    p95?: number;
    p99?: number;
}

export interface BoxPlotData {
    as_path_entry?: string; // Made optional to accommodate Ping data if needed, or strictly enforced
    p01: number;
    p05: number;
    p075: number;
    p095: number;
    p099: number;
    p25: number;
    p50: number;
    timestamp: string;
    total_increments: number;

    // Optional analysis fields (integrated from backend)
    mean?: number;
    std?: number;
    is_anomaly?: boolean;
    anomaly_score?: number;

    // Computed fields for charting
    timestampMs?: number;
    conf_lower?: number;
    conf_upper?: number;
    band?: number;
    anomaly_point?: number | null;

    // Ping specific
    avg_rtt?: number;
    avg_ttl?: number;
    next_power_of_2?: number;
}
