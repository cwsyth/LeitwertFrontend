export type DashboardContentMode = "street" | "hierarchy";

export interface DashboardViewVisibility {
    timeline: boolean;
    searchResults: boolean;
    globalStats: boolean;
    bgpAnnouncements: boolean;
    anomalies: boolean;
}

export interface Country {
    code: string;
    name: string;
}
