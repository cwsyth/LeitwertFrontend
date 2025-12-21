import type {LayerProps} from 'react-map-gl/maplibre';

export const countryView = {
  // Base cluster layer (background)
  clusterBaseLayer: {
    id: 'country-clusters-base',
    type: 'circle',
    source: 'points',
    filter: ['has', 'point_count'],
    /*paint: {
      'circle-color': '#1e293b',  // slate-800 background
      'circle-radius': [
        'interpolate', ['linear'],
        ['sqrt', ['get', 'point_count']],
        0, 0,
        1, 6,
        2, 9,
        3, 12,
        5, 15,
        10, 21,
        20, 29,
        50, 40
      ],
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
        '*',
        ['interpolate', ['linear'],
          ['sqrt', ['get', 'point_count']],
          0, 0,
          1, 6,
          2, 9,
          3, 12,
          5, 15,
          10, 21,
          20, 29,
          50, 40
        ],
        ['/', ['get', 'healthy_count'], ['get', 'point_count']]
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
        '*',
        ['interpolate', ['linear'],
          ['sqrt', ['get', 'point_count']],
          0, 0,
          1, 6,
          2, 9,
          3, 12,
          5, 15,
          10, 21,
          20, 29,
          50, 40
        ],
        ['/', ['+', ['get', 'unknown_count'], ['get', 'warning_count'], ['get', 'critical_count']], ['get', 'point_count']]
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
        '*',
        ['interpolate', ['linear'],
          ['sqrt', ['get', 'point_count']],
          0, 0,
          1, 6,
          2, 9,
          3, 12,
          5, 15,
          10, 21,
          20, 29,
          50, 40
        ],
        ['/', ['+', ['get', 'warning_count'], ['get', 'critical_count']], ['get', 'point_count']]
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
      'circle-color': '#b62b2bff',  // red-500
      'circle-radius': [
        '*',
        ['interpolate', ['linear'],
          ['sqrt', ['get', 'point_count']],
          0, 0,
          1, 6,
          2, 9,
          3, 12,
          5, 15,
          10, 21,
          20, 29,
          50, 40
        ],
        ['*', 1.6, ['/', ['get', 'critical_count'], ['get', 'point_count']]]
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
      'text-radial-offset': ['step', ['get', 'point_count'], 0.9, 3, 1, 5, 1.15, 10, 1.3, 20, 1.4, 50, 1.6, 100, 1.8, 500, 2.1, 1000, 2.5, 2500, 2.7],
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
      'circle-radius': [
        'interpolate', ['linear'],
        ['sqrt', ['get', 'router_count_total']],
        0, 0,
        5, 11,
        10, 15,
        20, 21,
        50, 30,
        100, 36,
        200, 42
      ],
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
        ['interpolate', ['linear'],
          ['sqrt', ['get', 'router_count_total']],
          0, 0,
          5, 11,
          10, 15,
          20, 21,
          50, 30,
          100, 36,
          200, 42
        ],
        ['/', ['coalesce', ['get', 'healthy', ['get', 'router_count_status']], 0], ['max', ['get', 'router_count_total'], 1]]
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
        ['interpolate', ['linear'],
          ['sqrt', ['get', 'router_count_total']],
          0, 0,
          5, 11,
          10, 15,
          20, 21,
          50, 30,
          100, 36,
          200, 42
        ],
        ['/', ['+', ['coalesce', ['get', 'unknown', ['get', 'router_count_status']], 0], ['coalesce', ['get', 'warning', ['get', 'router_count_status']], 0], ['coalesce', ['get', 'critical', ['get', 'router_count_status']], 0]], ['max', ['get', 'router_count_total'], 1]]
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
        ['interpolate', ['linear'],
          ['sqrt', ['get', 'router_count_total']],
          0, 0,
          5, 11,
          10, 15,
          20, 21,
          50, 30,
          100, 36,
          200, 42
        ],
        ['/', ['+', ['coalesce', ['get', 'warning', ['get', 'router_count_status']], 0], ['coalesce', ['get', 'critical', ['get', 'router_count_status']], 0]], ['max', ['get', 'router_count_total'], 1]]
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
      'circle-color': '#b62b2bff',  // red-500
      'circle-radius': [
        '*',
        ['interpolate', ['linear'],
          ['sqrt', ['get', 'router_count_total']],
          0, 0,
          5, 11,
          10, 15,
          20, 21,
          50, 30,
          100, 36,
          200, 42
        ],
        ['*', 1.6, ['/', ['coalesce', ['get', 'critical', ['get', 'router_count_status']], 0], ['max', ['get', 'router_count_total'], 1]]]
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
      'text-radial-offset': ['step', ['get', 'router_count_total'], 0.75, 10, 0.85, 20, 1, 50, 1.1, 100, 1.4, 200, 1.5, 500, 1.7, 1000, 2.2, 5000, 2.4, 10000, 2.6],
      'text-anchor': 'top',
      'text-allow-overlap': true,
      'text-ignore-placement': true
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#000000',
      'text-halo-width': 2.5,
      'text-halo-blur': 0.5,
      'text-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        2, 0,
        3, 0.3,
        4, 1
      ]
    }
  } as LayerProps
};
