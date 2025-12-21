import { useRef, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Map, Source, Layer } from 'react-map-gl/maplibre';
import type { MapRef, MapMouseEvent } from 'react-map-gl/maplibre';
import type { GeoJSONSource } from 'maplibre-gl';
import geohash from 'ngeohash';

import { countryView, worldView } from './layers';
import { countryMiddlepoints } from '@/data/country_middlepoints';
import type { Country, EntityStatus, Router } from '@/types/dashboard';
import type { CountryCustomProperties, CountryData, CountryFeatureCollection, WorldCustomProperties, WorldData, WorldFeatureCollection } from '@/types/geojson';
import type { CountryMiddlepointFeature } from '@/data/country_middlepoints';
import type { Feature } from 'geojson';
import { countries as countriesData } from "countries-list";
import { useRuntimeConfig } from '@/lib/useRuntimeConfig';

interface DashboardContentMapProps {
    selectedCountry: Country;
    setSelectedCountry: React.Dispatch<React.SetStateAction<Country>>
    setRouters: React.Dispatch<React.SetStateAction<Router[]>>
}

interface HoverInfo {
    location: string;
    x: number;
    y: number;
    totalRouters: number;
    statusCounts: Record<EntityStatus, number>;
}

export default function DashboardContentMap({ selectedCountry, setSelectedCountry, setRouters }: DashboardContentMapProps) {
    const runtimeConfig = useRuntimeConfig();
    const mapRef = useRef<MapRef>(null);
    const [data, setData] = useState<CountryData[] |WorldData[] | null>(null);
    const [isClickLoading, setIsClickLoading] = useState(false);
    const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
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
                (feature: CountryMiddlepointFeature) =>
                    feature.properties.ISO.toLowerCase() === selectedCountry.code.toLowerCase()
            );

            if (countryWithMiddlepoint && countryWithMiddlepoint.geometry.coordinates) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                [longitude, latitude] = countryWithMiddlepoint.geometry.coordinates;
            }
        }
        // transition to the new position
        if (mapRef.current) {
            mapRef.current.flyTo({
                center: [longitude, latitude],
                zoom: 5,
                duration: 1000
            });
        }
    }, [selectedCountry]);

    // Fetch map data
    const { data: mapData, isLoading } = useQuery({
        queryKey: isWorld ? ['world-feature-collection'] : ['country-feature-collection', selectedCountry.code],
        queryFn: async () => {
            const response = await fetch(geoJsonUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch map data');
            }

            if (isWorld) {
                const data: WorldData[] = await response.json();
                setData(data);

                const mapData: WorldFeatureCollection = {
                    type: "FeatureCollection",
                    features: data.map((item) => ({
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: countryMiddlepoints.features.find(
                                (feature: CountryMiddlepointFeature) =>
                                    feature.properties.ISO.toLowerCase() === item.country_code.toLowerCase()
                                )?.geometry.coordinates || [0, 0],
                        },
                        properties: {
                            ...item,
                            // Flatten router_count_status for layer expressions
                            router_count_status: {
                                healthy: item.router_count_status.healthy[0] || 0,
                                warning: item.router_count_status.warning[0] || 0,
                                critical: item.router_count_status.critical[0] || 0,
                                unknown: item.router_count_status.unknown[0] || 0
                            }
                        }
                    }))
                };

                return mapData;
            } else {
                const data: CountryData[] = await response.json();
                setData(data);

                const mapData: CountryFeatureCollection = {
                    type: "FeatureCollection",
                    features: data[0].routers?.map((item: CountryCustomProperties) => {
                        const coords = item.location?.lon && item.location?.lat
                            ? [item.location.lon, item.location.lat]
                            : (() => {
                                const decoded = geohash.decode(item.geohash);
                                return [decoded.longitude, decoded.latitude];
                            })();

                        return {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: coords
                            },
                            properties: item
                        };
                    }) || []
                };

                const routers = data[0]?.routers || [];
                setRouters(routers);

                return mapData;
            }
        }
    });

    const onMouseMove = async (event: MapMouseEvent) => {
        const feature = event?.features?.[0];
        if (!feature) {
            setHoverInfo(null);
            return;
        }

        const clusterId = feature?.properties?.cluster_id;
        const geojsonSource = mapRef?.current?.getSource('points') as GeoJSONSource;
        let statusCounts: Record<EntityStatus, number> = {
            healthy: 0,
            warning: 0,
            critical: 0,
            unknown: 0
        };

        if (isWorld) {
            const properties = feature.properties as WorldCustomProperties;

            // parse router_count_status because maplibre returns it as string
            const parsedRouterCountStatus = typeof properties.router_count_status === 'string'
                ? JSON.parse(properties.router_count_status)
                : properties.router_count_status;

            statusCounts = {
                ...parsedRouterCountStatus
            };

            const countries: Country[] = Object.entries(countriesData).map(([code, data]) => ({
                code: code.toLowerCase(),
                name: data.name
            }));

            setHoverInfo({
                location: countries.find(c => c.code === properties.country_code.toLowerCase())?.name || "",
                x: event.point.x,
                y: event.point.y,
                totalRouters: properties.router_count_total,
                statusCounts: statusCounts
            });

            /* just because I can: Object.fromEntries(
                        Object.entries(parsedRouterCountStatus)
                            .map(([status, count]) => [status,count ?? 0,])
                    ) as Record<EntityStatus, number> */

        } else if (clusterId && geojsonSource) {
            // Country view: fetch cluster leaves and calculate status counts
            try {
                const leaves: Feature[] = await geojsonSource.getClusterLeaves(clusterId, Infinity, 0);

                leaves.forEach((leaf: Feature) => {
                    const router = leaf.properties as Router;
                    statusCounts[router.status]++;
                });

                setHoverInfo({
                    location: leaves[0]?.properties?.geohash || "",
                    x: event.point.x,
                    y: event.point.y,
                    totalRouters: leaves.length,
                    statusCounts: statusCounts
                });

            } catch (error) {
                console.error('Error fetching cluster leaves:', error);
                setHoverInfo(null);
            }
        } else if (!isWorld) {
            // single unclustered point in country view
            const router = feature.properties as Router;
            statusCounts[router.status] = 1;

            setHoverInfo({
                location: router.geohash || "",
                x: event.point.x,
                y: event.point.y,
                totalRouters: 1,
                statusCounts: statusCounts
            });
        } else {
            // single unclustered point in world view (already handled above)
            setHoverInfo(null);
        }
    };

    const onMouseLeave = () => {
        setHoverInfo(null);
    };

    const onClick = async (event: MapMouseEvent) => {
        const feature = event?.features?.[0];
        if (!feature) return;

        setHoverInfo(null);
        setIsClickLoading(true);

        try {
            const clusterId = feature?.properties?.cluster_id;
            const geojsonSource = mapRef?.current?.getSource('points') as GeoJSONSource;

            if (clusterId) {
                    const zoom = await geojsonSource.getClusterExpansionZoom(clusterId);

                    if (feature?.geometry && 'coordinates' in feature.geometry) {
                        mapRef?.current?.easeTo({
                            center: feature.geometry.coordinates as [number, number],
                            zoom,
                            duration: 500
                        });
                    }
            }
            else if (!clusterId && isWorld) {
                // fetch country feature collection using tanstack query cache
                const countryCode = feature.properties?.country_code;
                if (!countryCode) return;

                const countries: Country[] = Object.entries(countriesData).map(([code, data]) => ({
                    code: code.toLowerCase(),
                    name: data.name
                }));

                setSelectedCountry({
                    code: countryCode.toLowerCase(),
                    name: countries.find(c => c.code.toLowerCase() === countryCode.toLowerCase())?.name || ""
                });
            }
        } finally {
            setIsClickLoading(false);
        }
    };

    return (
        <div className="dashboard-map w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden rounded-[var(--radius)]">
            {(isLoading || isClickLoading) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
                        <p className="text-slate-300 text-sm font-medium">Loading map data...</p>
                    </div>
                </div>
            )}
            {hoverInfo && (
                <div
                    className="absolute z-20 pointer-events-none"
                    style={{
                        left: hoverInfo.x + 15,
                        top: hoverInfo.y + 15,
                    }}
                >
                    <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-4 min-w-[175px]">
                        <div className="text-sm font-semibold text-slate-700 mb-2">
                            Router Status in
                            <div className="flex items-center gap-1">
                                <div className="text-blue-500 font-bold">{ hoverInfo.location }</div>
                                <div className="text-xs text-slate-500">{ isWorld ? "(Country)" : "(Geohash)" }</div>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 mb-3">
                            {hoverInfo.totalRouters.toLocaleString(runtimeConfig.locale)}
                            <span className="text-xs font-normal text-slate-500 ml-1">Total</span>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-6 bg-emerald-500 rounded text-white text-xs font-medium flex items-center justify-center">
                                        Healthy
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">
                                    {hoverInfo.statusCounts.healthy.toLocaleString(runtimeConfig.locale)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-6 bg-orange-500 rounded text-white text-xs font-medium flex items-center justify-center">
                                        Warning
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">
                                    {hoverInfo.statusCounts.warning.toLocaleString(runtimeConfig.locale)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-6 bg-red-500 rounded text-white text-xs font-medium flex items-center justify-center">
                                        Critical
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">
                                    {hoverInfo.statusCounts.critical.toLocaleString(runtimeConfig.locale)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-6 bg-slate-500 rounded text-white text-xs font-medium flex items-center justify-center">
                                        Unknown
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">
                                    {hoverInfo.statusCounts.unknown.toLocaleString(runtimeConfig.locale)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
           <Map
                initialViewState={{ // default to Germany
                    latitude,
                    longitude,
                    zoom: 4
                }}
                mapStyle="https://dev-maptiler.univ.leitwert.net/styles/dark-basic/style.json"
                interactiveLayerIds={isWorld
                    ? [
                        worldView.baseLayer.id!,
                        worldView.healthyLayer.id!,
                        worldView.unknownLayer.id!,
                        worldView.warningLayer.id!,
                        worldView.criticalLayer.id!
                    ]
                    : [
                        countryView.clusterBaseLayer.id!,
                        countryView.clusterHealthyLayer.id!,
                        countryView.clusterUnknownLayer.id!,
                        countryView.clusterWarningLayer.id!,
                        countryView.clusterCriticalLayer.id!,

                        countryView.unclusteredPointLayer.id!
                    ]
                }
                onClick={onClick}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                ref={mapRef}
                attributionControl={false}
                maxZoom={14}
            >
                <Source
                    key={isWorld ? 'world-source' : 'country-source'}
                    id="points"
                    type="geojson"
                    data={mapData ? mapData : { type: "FeatureCollection", features: [] }}
                    cluster={!isWorld}
                    clusterMaxZoom={14}
                    clusterRadius={50}
                    clusterProperties={{
                        critical_count: ['+', ['case', ['==', ['get', 'status'], 'critical'], 1, 0]],
                        warning_count: ['+', ['case', ['==', ['get', 'status'], 'warning'], 1, 0]],
                        healthy_count: ['+', ['case', ['==', ['get', 'status'], 'healthy'], 1, 0]],
                        unknown_count: ['+', ['case', ['==', ['get', 'status'], 'unknown'], 1, 0]]
                    }}
                >
                    {isWorld ? [
                        <Layer key="world-base" {...worldView.baseLayer} />,
                        <Layer key="world-healthy" {...worldView.healthyLayer} />,
                        //<Layer key="world-unknown" {...worldView.unknownLayer} />,
                        <Layer key="world-warning" {...worldView.warningLayer} />,
                        <Layer key="world-critical" {...worldView.criticalLayer} />,
                        <Layer key="world-cluster-count" {...worldView.clusterCountLayer} />
                    ] : [
                        <Layer key="country-clusters-base" {...countryView.clusterBaseLayer} />,
                        <Layer key="country-clusters-healthy" {...countryView.clusterHealthyLayer} />,
                        //<Layer key="country-clusters-unknown" {...countryView.clusterUnknownLayer} />,
                        <Layer key="country-clusters-warning" {...countryView.clusterWarningLayer} />,
                        <Layer key="country-clusters-critical" {...countryView.clusterCriticalLayer} />,
                        <Layer key="country-cluster-count" {...countryView.clusterCountLayer} />,
                        <Layer key="country-unclustered-point" {...countryView.unclusteredPointLayer} />
                    ]}
                </Source>
            </Map>
        </div>
    );
}

/*
     const onClick = async (event: MapMouseEvent) => {
        const feature = event?.features?.[0];
        if (!feature) return;

        setHoverInfo(null);
        setIsClickLoading(true);
        try {
            const clusterId = feature?.properties?.cluster_id;
            const geojsonSource = mapRef?.current?.getSource('points') as GeoJSONSource;

            if (clusterId) {
                // expand cluster
                const zoom = await geojsonSource.getClusterExpansionZoom(clusterId);

                if (feature?.geometry && 'coordinates' in feature.geometry) {
                    mapRef?.current?.easeTo({
                        center: feature.geometry.coordinates as [number, number],
                        zoom,
                        duration: 500
                    });
                }

                // get all points in the cluster & filter out router properties
                const leaves: Feature[] = await geojsonSource.getClusterLeaves(clusterId, Infinity, 0);
                const routers = leaves.map((leaf: Feature) => leaf.properties as Router);
                setRouters(routers);
            } else {
                // handle single point click
                if (!isWorld) {
                    const router = feature.properties as Router;
                    setRouters([router]);
                    return;
                }

                // fetch country feature collection using tanstack query cache
                const countryCode = feature.properties?.country_code;
                if (!countryCode) return;

                const data = await queryClient.fetchQuery({
                    queryKey: ['country-feature-collection', countryCode],
                    queryFn: async () => {
                        const response = await fetch(`${baseUrl}/map?view=country&country=${countryCode}`);
                        if (!response.ok) {
                            throw new Error('Failed to fetch country data');
                        }
                        return response.json();
                    }
                });

                const routers = data[0]?.routers || [];
                setRouters(routers);
            }
        } finally {
            setIsClickLoading(false);
        }
    };

    */
