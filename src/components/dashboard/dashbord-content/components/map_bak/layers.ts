import type {LayerProps} from 'react-map-gl/maplibre';

export const countryView = {
  clusterLayer: {
    id: 'country-clusters',
    type: 'circle',
    source: 'points',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
      'circle-radius': ['step', ['get', 'point_count'], 20, 100, 25, 750, 30]
    }
  } as LayerProps,

  clusterCountLayer: {
    id: 'country-cluster-count',
    type: 'symbol',
    source: 'points',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-size': 12
    }
  } as LayerProps,

  unclusteredPointLayer: {
    id: 'country-unclustered-point',
    type: 'circle',
    source: 'points',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'match',
        ['get', 'status'],
        'healthy', '#10b981',   // emerald-500
        'warning', '#f97316',   // orange-500
        'critical', '#ef4444',  // red-500
        'unknown', '#64748b',   // slate-500
        '#11b4da'               // default fallback
      ],
      'circle-radius': 5,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  } as LayerProps
};

export const worldView = {
  unclusteredPointLayer: {
    id: 'world-unclustered-point',
    type: 'circle',
    source: 'points',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#11b4da',
      'circle-radius': ['step', ['get', 'router_count_total'], 20, 1000, 25, 10000, 30],
    }
  } as LayerProps,

  clusterCountLayer: {
    id: 'world-cluster-count',
    type: 'symbol',
    source: 'points',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'text-field': ['get', 'router_count_total'],
      'text-size': 12,
      'text-allow-overlap': true,
      'text-ignore-placement': true
    },
    paint: {
      'text-color': '#ffffff'
    }
  } as LayerProps
};
