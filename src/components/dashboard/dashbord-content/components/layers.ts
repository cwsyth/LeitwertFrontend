import type {LayerProps} from 'react-map-gl/maplibre';

export const countryView = {
  // Base cluster layer (background)
  clusterBaseLayer: {
    id: 'country-clusters-base',
    type: 'circle',
    source: 'points',
    filter: ['has', 'point_count'],
    /*paint: {
      'circle-color': '#000000',
      'circle-radius': ['step', ['get', 'point_count'], 22, 100, 27, 750, 32],
      'circle-opacity': 0.8
    }*/
  } as LayerProps,

  // Healthy layer (innermost, green)
  clusterHealthyLayer: {
    id: 'country-clusters-healthy',
    type: 'circle',
    source: 'points',
    filter: ['all', ['has', 'point_count'], ['>', ['get', 'healthy_count'], 0]],
    paint: {
      'circle-color': '#10b981',  // emerald-500
      'circle-radius': [
        'interpolate', ['linear'],
        ['/', ['get', 'healthy_count'], ['get', 'point_count']],
        0, 0,
        1, ['step', ['get', 'point_count'], 20, 100, 25, 750, 30]
      ],
      'circle-opacity': 0.9
    }
  } as LayerProps,

  // Unknown layer (gray)
  clusterUnknownLayer: {
    id: 'country-clusters-unknown',
    type: 'circle',
    source: 'points',
    filter: ['all', ['has', 'point_count'], ['>', ['get', 'unknown_count'], 0]],
    paint: {
      'circle-color': '#64748b',  // slate-500
      'circle-radius': [
        'interpolate', ['linear'],
        ['/', ['+', ['get', 'unknown_count'], ['get', 'warning_count'], ['get', 'critical_count']], ['get', 'point_count']],
        0, 0,
        1, ['step', ['get', 'point_count'], 20, 100, 25, 750, 30]
      ],
      'circle-opacity': 0.85
    }
  } as LayerProps,

  // Warning layer (orange)
  clusterWarningLayer: {
    id: 'country-clusters-warning',
    type: 'circle',
    source: 'points',
    filter: ['all', ['has', 'point_count'], ['>', ['get', 'warning_count'], 0]],
    paint: {
      'circle-color': '#f97316',  // orange-500
      'circle-radius': [
        'interpolate', ['linear'],
        ['/', ['+', ['get', 'warning_count'], ['get', 'critical_count']], ['get', 'point_count']],
        0, 0,
        1, ['step', ['get', 'point_count'], 20, 100, 25, 750, 30]
      ],
      'circle-opacity': 0.9
    }
  } as LayerProps,

  // Critical layer (outermost, red)
  clusterCriticalLayer: {
    id: 'country-clusters-critical',
    type: 'circle',
    source: 'points',
    filter: ['all', ['has', 'point_count'], ['>', ['get', 'critical_count'], 0]],
    paint: {
      'circle-color': '#a10b0bff',  // red-500
      'circle-radius': [
        'interpolate', ['linear'],
        ['/', ['get', 'critical_count'], ['get', 'point_count']],
        0, 0,
        1, ['step', ['get', 'point_count'], 20, 100, 25, 750, 30]
      ],
      'circle-opacity': 0.95
    }
  } as LayerProps,

  clusterCountLayer: {
    id: 'country-cluster-count',
    type: 'symbol',
    source: 'points',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-size': 14,
      'text-radial-offset': ['step', ['get', 'point_count'], 1.8, 10, 1.9, 750, 2.2],
      'text-anchor': 'top'
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#000000',
      'text-halo-width': 2.5,
      'text-halo-blur': 0.5
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
  // Base layer (background)
  baseLayer: {
    id: 'world-base',
    type: 'circle',
    source: 'points',
    filter: ['!', ['has', 'point_count']],
    /*paint: {
      'circle-color': '#1e293b',  // slate-800 background
      'circle-radius': ['step', ['get', 'router_count_total'], 22, 1000, 27, 10000, 32],
      'circle-opacity': 0.8
    }*/
  } as LayerProps,

  // Healthy layer (innermost, green)
  healthyLayer: {
    id: 'world-healthy',
    type: 'circle',
    source: 'points',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#10b981',  // emerald-500
      'circle-radius': [
        '*',
        ['/', ['coalesce', ['get', 'healthy'], 0], ['max', ['get', 'router_count_total'], 1]],
        ['step', ['get', 'router_count_total'], 20, 1000, 25, 10000, 30]
      ],
      'circle-opacity': 0.9
    }
  } as LayerProps,

  // Unknown layer (gray)
  unknownLayer: {
    id: 'world-unknown',
    type: 'circle',
    source: 'points',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#64748b',  // slate-500
      'circle-radius': [
        '*',
        ['/', ['+', ['coalesce', ['get', 'unknown'], 0], ['coalesce', ['get', 'warning'], 0], ['coalesce', ['get', 'critical'], 0]], ['max', ['get', 'router_count_total'], 1]],
        ['step', ['get', 'router_count_total'], 20, 1000, 25, 10000, 30]
      ],
      'circle-opacity': 0.85
    }
  } as LayerProps,

  // Warning layer (orange)
  warningLayer: {
    id: 'world-warning',
    type: 'circle',
    source: 'points',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#f97316',  // orange-500
      'circle-radius': [
        '*',
        ['/', ['+', ['coalesce', ['get', 'warning'], 0], ['coalesce', ['get', 'critical'], 0]], ['max', ['get', 'router_count_total'], 1]],
        ['step', ['get', 'router_count_total'], 20, 1000, 25, 10000, 30]
      ],
      'circle-opacity': 0.9
    }
  } as LayerProps,

  // Critical layer (outermost, red)
  criticalLayer: {
    id: 'world-critical',
    type: 'circle',
    source: 'points',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#ef4444',  // red-500
      'circle-radius': [
        '*',
        ['/', ['coalesce', ['get', 'critical'], 0], ['max', ['get', 'router_count_total'], 1]],
        ['step', ['get', 'router_count_total'], 20, 1000, 25, 10000, 30]
      ],
      'circle-opacity': 0.95
    }
  } as LayerProps,

  clusterCountLayer: {
    id: 'world-cluster-count',
    type: 'symbol',
    source: 'points',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'text-field': ['get', 'router_count_total'],
      'text-size': 14,
      'text-radial-offset': ['step', ['get', 'router_count_total'], 1.55, 1000, 1.85, 10000, 2.1],
      'text-anchor': 'top',
      'text-allow-overlap': true,
      'text-ignore-placement': true
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#000000',
      'text-halo-width': 2.5,
      'text-halo-blur': 0.5
    }
  } as LayerProps
};
