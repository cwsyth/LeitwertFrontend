import {useRef, useState, useCallback} from 'react';
import {Map as ReactMapGL, Source, Layer} from 'react-map-gl/maplibre';
import {unclusteredPointLayer} from './layers';
import { useQuery } from '@tanstack/react-query';
import PieChartMarker from './pie-chart-marker';

import type { MapRef, MapMouseEvent } from 'react-map-gl/maplibre';
import type { GeoJSONSource } from 'maplibre-gl';

import { Country } from '@/types/dashboard';
import { RouterFeatureCollection } from '@/types/geojson';

interface ClusterData {
    id: number;
    longitude: number;
    latitude: number;
    online: number;
    degraded: number;
    down: number;
    unknown: number;
    total: number;
}

interface DashboardContentMapProps {
    selectedCountry: Country | null;
}

export default function DashboardContentMap({ selectedCountry }: DashboardContentMapProps) {
    const mapRef = useRef<MapRef>(null);
    const [clusters, setClusters] = useState<ClusterData[]>([]);

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

    const updateClusters = useCallback(() => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        const source = map.getSource('routers') as GeoJSONSource;
        if (!source) return;

        const features = map.querySourceFeatures('routers');
        const clusterMap = new Map<number, ClusterData>();

        features.forEach((feature) => {
            const props = feature.properties;
            if (props?.cluster) {
                const clusterId = props.cluster_id;
                if (!clusterMap.has(clusterId)) {
                    const coords = (feature.geometry as GeoJSON.Point).coordinates;
                    clusterMap.set(clusterId, {
                        id: clusterId,
                        longitude: coords[0],
                        latitude: coords[1],
                        online: props.online || 0,
                        degraded: props.degraded || 0,
                        down: props.down || 0,
                        unknown: props.unknown || 0,
                        total: props.point_count || 0,
                    });
                }
            }
        });

        setClusters(Array.from(clusterMap.values()));
    }, []);

    const onClusterClick = useCallback(async (clusterId: number, longitude: number, latitude: number) => {
        const source = mapRef.current?.getSource('routers') as GeoJSONSource;
        if (!source) return;
        
        const zoom = await source.getClusterExpansionZoom(clusterId);
        mapRef.current?.easeTo({
            center: [longitude, latitude],
            zoom,
            duration: 500
        });
    }, []);

    const onClick = async (event: MapMouseEvent) => {
        const feature = event?.features?.[0];
        if (!feature) return;
        
        // Handle unclustered point clicks if needed
        if (!feature.properties?.cluster) {
            // Handle single point click
            return;
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
           <ReactMapGL
                initialViewState={{
                    latitude: 51.1657,
                    longitude: 10.4515,
                    zoom: 5.5
                }}
                mapStyle="https://demotiles.maplibre.org/style.json"
                interactiveLayerIds={[unclusteredPointLayer.id!]}
                onClick={onClick}
                onMoveEnd={updateClusters}
                onSourceData={(e: { sourceId: string; isSourceLoaded: boolean }) => {
                    if (e.sourceId === 'routers' && e.isSourceLoaded) {
                        updateClusters();
                    }
                }}
                ref={mapRef}
            >
                <Source
                    id="routers"
                    type="geojson"
                    data={filteredMapData}
                    cluster={true}
                    clusterMaxZoom={14}
                    clusterRadius={50}
                    clusterProperties={{
                        online: ['+', ['case', ['==', ['get', 'router_status'], 'online'], 1, 0]],
                        degraded: ['+', ['case', ['==', ['get', 'router_status'], 'degraded'], 1, 0]],
                        down: ['+', ['case', ['==', ['get', 'router_status'], 'down'], 1, 0]],
                        unknown: ['+', ['case', ['==', ['get', 'router_status'], 'unknown'], 1, 0]],
                    }}
                >
                <Layer {...unclusteredPointLayer} />
                </Source>
                
                {/* Render pie chart markers for clusters */}
                {clusters.map((cluster) => (
                    <PieChartMarker
                        key={cluster.id}
                        longitude={cluster.longitude}
                        latitude={cluster.latitude}
                        online={cluster.online}
                        degraded={cluster.degraded}
                        down={cluster.down}
                        unknown={cluster.unknown}
                        total={cluster.total}
                        onClick={() => onClusterClick(cluster.id, cluster.longitude, cluster.latitude)}
                    />
                ))}
            </ReactMapGL>
        </div>
    );
}
