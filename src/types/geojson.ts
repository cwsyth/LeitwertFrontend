import type { FeatureCollection, Feature, Point } from 'geojson';

type router_type = "router" | "router_collection";
type router_status =  "online" | "degraded" | "down" | "unknown";

interface CustomProperties {
    //router_id?: string;
    type: router_type;
    geohash: string;
    country_code: string;
    router_status?: router_status
    router_count?: number;
}

// Create typed GeoJSON types
export type RouterFeature = Feature<Point, CustomProperties>;
export type RouterFeatureCollection = FeatureCollection<Point, CustomProperties>;
