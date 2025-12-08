import {useRef} from 'react';
import {Map, Source, Layer} from 'react-map-gl/maplibre';
import {clusterLayer, clusterCountLayer, unclusteredPointLayer} from './layers';
import { useQuery } from '@tanstack/react-query';

import type { MapRef, MapMouseEvent } from 'react-map-gl/maplibre';
import type { GeoJSONSource } from 'maplibre-gl';

import { Country } from '@/types/dashboard';
import { RouterFeatureCollection } from '@/types/geojson';

interface DashboardContentMapProps {
    selectedCountry: Country | null;
}

export default function DashboardContentMap({ selectedCountry }: DashboardContentMapProps) {
    const mapRef = useRef<MapRef>(null);

    const { data: mapData } = useQuery({
        queryKey: ['geohash-points'],
        queryFn: async () => {
            const response = await fetch('/geohash_points_p6_20000.geojson');
            if (!response.ok) {
                throw new Error('Failed to fetch map data');
            }
            return response.json();
        }
    });

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

    const filteredMapData: RouterFeatureCollection = selectedCountry && selectedCountry.code !== 'world' && mapData
        ? {
            ...mapData,
            features: mapData?.features.filter((feature: {properties: {country_code: string}}) =>
                feature.properties.country_code.toLowerCase() === selectedCountry.code.toLowerCase()
            )
        }
        : mapData;

    return (
        <div className="dashboard-map w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden rounded-[var(--radius)]">
           <Map
                initialViewState={{
                    latitude: 51.1657,
                    longitude: 10.4515,
                    zoom: 5.5
                }}
                mapStyle="https://demotiles.maplibre.org/style.json"
                interactiveLayerIds={[clusterLayer.id!]}
                onClick={onClick}
                ref={mapRef}
            >
                <Source
                    id="earthquakes"
                    type="geojson"
                    data={filteredMapData}
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
