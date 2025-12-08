export type DashboardContentMode = "street" | "hierarchy";

export interface DashboardViewVisibility {
    timeline: boolean;
    searchResults: boolean;
    globalStats: boolean;
    bgpAnnouncements: boolean;
    anomalies: boolean;
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
