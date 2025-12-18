import { TCountryCode } from 'countries-list';
import type { FeatureCollection, Feature, Point } from 'geojson';
import type { EntityStatus, Router } from './dashboard';

export type CountryCustomProperties = Router;

export interface WorldCustomProperties {
  country_code: TCountryCode;
  router_count_total: number;
  router_count_status: Record<EntityStatus, number>;
}

// Create typed GeoJSON types
export type CountryFeature = Feature<Point, CountryCustomProperties>;
export type CountryFeatureCollection = FeatureCollection<Point, CountryCustomProperties>;
export type WorldFeature = Feature<Point, WorldCustomProperties>;
export type WorldFeatureCollection = FeatureCollection<Point, WorldCustomProperties>;
