import type {LayerProps} from 'react-map-gl/maplibre';

export const clusterLayer: LayerProps = {
  id: 'clusters',
  type: 'circle',
  source: 'routers',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
    'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
  }
};

export const clusterCountLayer: LayerProps = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'routers',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-size': 12
  }
};

export const unclusteredPointLayer: LayerProps = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'routers',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': [
      'match',
      ['get', 'router_status'],
      'online', '#22c55e',    // green
      'degraded', '#eab308',  // yellow
      'down', '#ef4444',      // red
      'unknown', '#6b7280',   // grey
      '#6b7280'               // default grey
    ],
    'circle-radius': 6,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#fff'
  }
};
