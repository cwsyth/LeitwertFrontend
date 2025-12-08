import type { FeatureCollection, Feature, Point } from 'geojson';

type router_status =  "online" | "degraded" | "down" | "unknown";

interface CustomProperties {
    //router_id?: string;
    geohash: string;
    country_code: string;
    router_status?: router_status;
}

// Create typed GeoJSON types
export type RouterFeature = Feature<Point, CustomProperties>;
export type RouterFeatureCollection = FeatureCollection<Point, CustomProperties>;
