import { TCountryCode } from 'countries-list';
import type { FeatureCollection, Feature, Point } from 'geojson';

type router_status =  "online" | "degraded" | "down" | "unknown";

export interface CountryCustomProperties {
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
    status: router_status
}

export interface WorldCustomProperties {
  country_code: TCountryCode;
  router_count_total: number;
  router_count_status: {
    good: number;
    degraded: number;
    down: number;
    unknown: number;
  }
}

// Create typed GeoJSON types
export type CountryFeature = Feature<Point, CountryCustomProperties>;
export type CountryFeatureCollection = FeatureCollection<Point, CountryCustomProperties>;
export type WorldFeature = Feature<Point, WorldCustomProperties>;
export type WorldFeatureCollection = FeatureCollection<Point, WorldCustomProperties>;
