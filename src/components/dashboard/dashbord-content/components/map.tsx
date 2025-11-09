'use client';

import {useRef} from 'react';
import {Map, Source, Layer} from 'react-map-gl/maplibre';
import {clusterLayer, clusterCountLayer, unclusteredPointLayer} from './layers';

import type {MapRef, MapMouseEvent} from 'react-map-gl/maplibre';
import type {GeoJSONSource} from 'maplibre-gl';

export default function DashboardContentMap() {
    const mapRef = useRef<MapRef>(null);

    const onClick = async (event: MapMouseEvent) => {
        const feature = event?.features?.[0];
        const clusterId = feature?.properties.cluster_id;
        const geojsonSource = mapRef?.current?.getSource('earthquakes') as GeoJSONSource;
        const zoom = await geojsonSource.getClusterExpansionZoom(clusterId);

        if (feature?.geometry && 'coordinates' in feature.geometry) {
            mapRef?.current?.easeTo({
                center: feature.geometry.coordinates as [number, number],
                zoom,
                duration: 500
            });
        }
    };

    return (
        <div className="dashboard-map w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden rounded-[var(--radius)]">
           <Map
                initialViewState={{
                    latitude: 40.67,
                    longitude: -103.59,
                    zoom: 3
                }}
                mapStyle="https://demotiles.maplibre.org/style.json"
                interactiveLayerIds={[clusterLayer.id!]}
                onClick={onClick}
                ref={mapRef}
            >
                <Source
                    id="earthquakes"
                    type="geojson"
                    data="https://maplibre.org/maplibre-gl-js/docs/assets/earthquakes.geojson"
                    cluster={true}
                    clusterMaxZoom={14}
                    clusterRadius={50}
                >
                <Layer {...clusterLayer} />
                <Layer {...clusterCountLayer} />
                <Layer {...unclusteredPointLayer} />
                </Source>
            </Map>
        </div>
    );
}
