import { useRef, useEffect } from 'react';
import { Map, Source, Layer } from 'react-map-gl/maplibre';
import { clusterLayer, clusterCountLayer, unclusteredPointLayer } from './layers';
import { useQuery } from '@tanstack/react-query';

import type { MapRef, MapMouseEvent } from 'react-map-gl/maplibre';
import type { GeoJSONSource } from 'maplibre-gl';

import { Country } from '@/types/dashboard';
import { CountryCustomProperties, CountryFeatureCollection, WorldCustomProperties, WorldFeatureCollection } from '@/types/geojson';
import { countryMiddlepoints } from '@/data/country_middlepoints';
import type { CountryMiddlepointFeature } from '@/data/country_middlepoints';

interface DashboardContentMapProps {
    selectedCountry: Country | null;
}

export default function DashboardContentMap({ selectedCountry }: DashboardContentMapProps) {
    const mapRef = useRef<MapRef>(null);
    let [longitude, latitude] = [10.426171427430804, 51.08304539800482]; // default to Germany

    const isWorld = !selectedCountry || selectedCountry.code === 'world';
    const baseUrl = 'https://dev-api.univ.leitwert.net/api/v1';
    const geoJsonUrl = baseUrl + (isWorld
        ? '/map?view=world'
        : '/map?view=country&country=' + selectedCountry?.code);

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

    // Fetch map data
    const { data: mapData, isLoading } = useQuery({
        queryKey: isWorld ? ['world-feature-collection'] : ['country-feature-collection', selectedCountry?.code],
        queryFn: async () => {
            const response = await fetch(geoJsonUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch map data');
            }

            if (isWorld) {
                const data: WorldCustomProperties[] = await response.json();
                const mapData: WorldFeatureCollection = {
                    type: "FeatureCollection",
                    features: data.map((item) => ({
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: countryMiddlepoints.features.find((feature: CountryMiddlepointFeature) =>
                                feature.properties.ISO.toLowerCase() === item.country_code.toLowerCase()
                            )?.geometry.coordinates || [0, 0],
                        },
                        properties: item
                    }))
                };
                return mapData;
            } else {
                const data = await response.json();
                const mapData: CountryFeatureCollection = {
                    type: "FeatureCollection",
                    features: data[0].routers?.map((item: CountryCustomProperties) => ({
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [item.location.lon, item.location.lat],
                        },
                        properties: item
                    })) || []
                };
                return mapData;
            }
        }
    });
    console.log('Map Data:', mapData);

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
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
                        <p className="text-slate-300 text-sm font-medium">Loading map data...</p>
                    </div>
                </div>
            )}
           <Map
                initialViewState={{ // default to Germany
                    latitude,
                    longitude,
                    zoom: 4.5
                }}
                mapStyle="https://dev-maptiler.univ.leitwert.net/styles/dark-basic/style.json"
                interactiveLayerIds={[clusterLayer.id!]}
                onClick={onClick}
                ref={mapRef}
            >
                <Source
                    id="routers"
                    type="geojson"
                    data={mapData ? mapData : { type: "FeatureCollection", features: [] }}
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
