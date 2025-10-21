'use client';

import {useRef} from 'react';
import {Map, Source} from 'react-map-gl/maplibre';

import type {MapRef} from 'react-map-gl/maplibre';
import type {GeoJSONSource} from 'maplibre-gl';

export default function DashboardContentMap() {
    const mapRef = useRef<MapRef>(null);

    return (
        <div className="dashboard-map w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden rounded-[var(--radius)]">
            <Map
                initialViewState={{
                latitude: 40.67,
                longitude: -103.59,
                zoom: 3
                }}
                mapStyle="https://demotiles.maplibre.org/style.json"
                onClick={() => {}}
                ref={mapRef}
            >
                <Source
                id="earthquakes"
                type="geojson"
                data="https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"
                cluster={true}
                clusterMaxZoom={14}
                clusterRadius={50}
                >
                </Source>
            </Map>
        </div>
    );
}
