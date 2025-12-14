import { useRef, useEffect, useState } from 'react';
import { Map, Source, Layer } from 'react-map-gl/maplibre';
import { clusterLayer, clusterCountLayer, unclusteredPointLayer } from './layers';
import { useQuery } from '@tanstack/react-query';

import type { MapRef, MapMouseEvent } from 'react-map-gl/maplibre';
import type { GeoJSONSource } from 'maplibre-gl';

import { Country } from '@/types/dashboard';
import { RouterFeatureCollection } from '@/types/geojson';
import { countryMiddlepoints } from '@/data/country_middlepoints';
import type { CountryMiddlepointFeature } from '@/data/country_middlepoints';

interface DashboardContentMapProps {
    selectedCountry: Country | null;
}

export default function DashboardContentMap({ selectedCountry }: DashboardContentMapProps) {
    const mapRef = useRef<MapRef>(null);
    let [longitude, latitude] = [10.426171427430804, 51.08304539800482]; // default to Germany

    const isWorld = !selectedCountry || selectedCountry.code === 'world';
    const geoJsonUrl = isWorld
        ? '/router_collections_by_country_p6.geojson'
        : '/geohash_points_p6_20000.geojson';

    const { data: mapData } = useQuery({
        queryKey: ['geohash-points', selectedCountry?.code],
        queryFn: async () => {
            const response = await fetch(geoJsonUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch map data');
            }
            return response.json();
        }
    });

     // Focus map on selected country
    useEffect(() => {
        if (!selectedCountry) return;

        if(selectedCountry.code !== 'world') {
            // find the selected country in the middlepoints data
            const countryWithMiddlepoint = countryMiddlepoints.features.find(
                (feature: CountryMiddlepointFeature) => feature.properties.ISO.toLowerCase() === selectedCountry.code.toLowerCase()
            );

            if (countryWithMiddlepoint && countryWithMiddlepoint.geometry.coordinates) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                [longitude, latitude] = countryWithMiddlepoint.geometry.coordinates;
            }
        }
        // Smoothly transition to the new position
        if (mapRef.current) {
            mapRef.current.flyTo({
                center: [longitude, latitude],
                zoom: 4.5,
                duration: 1000
            });
        }
    }, [selectedCountry]);

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
                initialViewState={{ // default to Germany
                    latitude,
                    longitude,
                    zoom: 4.5
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
