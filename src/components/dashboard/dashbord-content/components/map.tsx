import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Map, Source, Layer } from 'react-map-gl/maplibre';
import type { MapRef, MapMouseEvent } from 'react-map-gl/maplibre';
import type { GeoJSONSource } from 'maplibre-gl';
import geohash from 'ngeohash';
import { Server, Globe, Hash, Activity, MapPin } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

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
    setSelectedRouter: React.Dispatch<React.SetStateAction<Router | null>>
    setSelectedAs: React.Dispatch<React.SetStateAction<number>>
}

interface HoverInfo {
    location: string;
    x: number;
    y: number;
    totalRouters: number;
    statusCounts: Record<EntityStatus, number>;
}

interface ContextMenuInfo {
    x: number;
    y: number;
    routers: Router[];
}

type SortField = 'router_id' | 'ip' | 'asn' | 'status' | 'city';
type SortDirection = 'asc' | 'desc' | null;

// Cache countries list outside component to avoid recreation
const countriesList: Country[] = Object.entries(countriesData).map(([code, data]) => ({
    code: code.toLowerCase(),
    name: data.name
}));

export default function DashboardContentMap({ selectedCountry, setSelectedCountry, setRouters, setSelectedRouter, setSelectedAs }: DashboardContentMapProps) {
    const runtimeConfig = useRuntimeConfig();
    const queryClient = useQueryClient();
    const mapRef = useRef<MapRef>(null);
    const [isClickLoading, setIsClickLoading] = useState(false);
    const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenuInfo | null>(null);
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const lastMouseMoveTime = useRef<number>(0);
    let [longitude, latitude] = [10.426171427430804, 51.08304539800482]; // default to Germany

    const isWorld = !selectedCountry || selectedCountry.code === 'world';
    const baseUrl = 'https://dev-api.univ.leitwert.net/api/v1';
    const geoJsonUrl = baseUrl + (isWorld
        ? '/map?view=world'
        : '/map?view=country&country=' + selectedCountry?.code);

    // Focus map on selected country
    useEffect(() => {
        setHoverInfo(null);
        setContextMenu(null);

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

    const onMouseMove = useCallback(async (event: MapMouseEvent) => {
        // Throttle mouse move to max 60fps (16ms)
        const now = Date.now();
        if (now - lastMouseMoveTime.current < 16) {
            return;
        }
        lastMouseMoveTime.current = now;

        const feature = event?.features?.[0];
        if (!feature) {
            setHoverInfo(null);
            return;
        }

        // Get map container position for fixed positioning
        const mapContainer = mapRef.current?.getContainer();
        const rect = mapContainer?.getBoundingClientRect();

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

            setHoverInfo({
                location: countriesList.find(c => c.code === properties.country_code.toLowerCase())?.name || "",
                x: (rect?.left || 0) + event.point.x,
                y: (rect?.top || 0) + event.point.y,
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
                    x: (rect?.left || 0) + event.point.x,
                    y: (rect?.top || 0) + event.point.y,
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
                x: (rect?.left || 0) + event.point.x,
                y: (rect?.top || 0) + event.point.y,
                totalRouters: 1,
                statusCounts: statusCounts
            });
        } else {
            // single unclustered point in world view (already handled above)
            setHoverInfo(null);
        }
    }, [isWorld]);

    const onMouseLeave = useCallback(() => {
        setHoverInfo(null);
    }, []);

    const onClick = useCallback(async (event: MapMouseEvent) => {
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

                setSelectedCountry({
                    code: countryCode.toLowerCase(),
                    name: countriesList.find(c => c.code.toLowerCase() === countryCode.toLowerCase())?.name || ""
                });
            }
        } finally {
            setIsClickLoading(false);
        }
    }, [isWorld, setSelectedCountry]);

    const onContextMenu = useCallback(async (event: MapMouseEvent) => {
        setHoverInfo(null);

        // Prevent default browser context menu
        event.preventDefault();

        const feature = event?.features?.[0];
        if (!feature) return;

        setIsClickLoading(true);

        try {
             const clusterId = feature?.properties?.cluster_id;
            const geojsonSource = mapRef?.current?.getSource('points') as GeoJSONSource;
            let routers: Router[] = [];

            if (clusterId) {
                // get all points in the cluster & filter out router properties
                const leaves: Feature[] = await geojsonSource.getClusterLeaves(clusterId, Infinity, 0);
                routers = leaves.map((leaf: Feature) => leaf.properties as Router);
            } else {
                // handle single point click
                if (!isWorld) {
                    const router = feature.properties as Router;
                    routers = [router];
                } else {
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

                    routers = data[0]?.routers || [];
                }
            }

            setContextMenu({
                x: event.point.x,
                y: event.point.y,
                routers
            });
        } finally {
            setIsClickLoading(false);
        }
    }, [baseUrl, isWorld, queryClient]);

    const handleSort = useCallback((field: SortField) => {
        if (sortField === field) {
            // Cycle through: asc -> desc -> null (unsorted)
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortDirection(null);
                setSortField(null);
            }
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    }, [sortField, sortDirection]);

    const getSortedRouters = useMemo(() => {
        if (!contextMenu) return [];

        // Return original order if no sorting is applied
        if (!sortField || !sortDirection) {
            return contextMenu.routers;
        }

        const statusOrder = { critical: 0, warning: 1, unknown: 2, healthy: 3 };

        return [...contextMenu.routers].sort((a, b) => {
            let aValue: string | number = '';
            let bValue: string | number = '';

            switch (sortField) {
                case 'router_id':
                    aValue = a.router_id;
                    bValue = b.router_id;
                    break;
                case 'ip':
                    aValue = a.ip;
                    bValue = b.ip;
                    break;
                case 'asn':
                    aValue = a.asn;
                    bValue = b.asn;
                    break;
                case 'status':
                    aValue = statusOrder[a.status];
                    bValue = statusOrder[b.status];
                    break;
                case 'city':
                    aValue = a.location?.city || '';
                    bValue = b.location?.city || '';
                    break;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [contextMenu, sortField, sortDirection]);

    return (
        <div className="dashboard-map w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden rounded-[var(--radius)]">
            {(isLoading || isClickLoading) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <Spinner size="xl" className="text-slate-300" />
                        <p className="text-slate-300 text-sm font-medium">Loading map data...</p>
                    </div>
                </div>
            )}
            {hoverInfo && (
                <div
                    className="fixed z-20 pointer-events-none"
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
            {contextMenu && (
                <>
                    {/* Backdrop to close context menu */}
                    <div
                        className="absolute inset-0 z-30"
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            setContextMenu(null);
                        }}
                    />
                    {/* Context Menu */}
                    <div
                        className="fixed z-50"
                        style={{
                            left: Math.min(contextMenu.x + 10, window.innerWidth - 720),
                            top: Math.min(contextMenu.y + 10, window.innerHeight - 350),
                        }}
                    >
                        <div className="bg-card rounded-lg shadow-2xl border overflow-hidden w-[700px]">
                            <div className="bg-muted/50 px-4 py-3 flex items-center justify-between border-b">
                                <h3 className="text-foreground font-semibold text-m">
                                    Router Info ({contextMenu.routers.length})
                                </h3>
                                <button
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        setContextMenu(null);
                                    }}
                                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="max-h-80 overflow-auto bg-white">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted sticky top-0">
                                        <tr className="border-b font-bold">
                                            <th
                                                className="h-10 px-2 text-left align-middle font-medium text-foreground whitespace-nowrap cursor-pointer hover:bg-muted/70"
                                                onClick={() => handleSort('router_id')}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <Server className="h-3 w-3" />
                                                    Router ID
                                                    <span className="text-xs text-muted-foreground">
                                                        {sortField === 'router_id'
                                                            ? (sortDirection === 'asc' ? '↑' : '↓')
                                                            : '↕'
                                                        }
                                                    </span>
                                                </div>
                                            </th>
                                            <th
                                                className="h-10 px-2 text-left align-middle font-medium text-foreground whitespace-nowrap cursor-pointer hover:bg-muted/70"
                                                onClick={() => handleSort('ip')}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <Globe className="h-3 w-3" />
                                                    IP
                                                    <span className="text-xs text-muted-foreground">
                                                        {sortField === 'ip'
                                                            ? (sortDirection === 'asc' ? '↑' : '↓')
                                                            : '↕'
                                                        }
                                                    </span>
                                                </div>
                                            </th>
                                            <th
                                                className="h-10 px-2 text-left align-middle font-medium text-foreground whitespace-nowrap cursor-pointer hover:bg-muted/70"
                                                onClick={() => handleSort('asn')}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <Hash className="h-3 w-3" />
                                                    ASN
                                                    <span className="text-xs text-muted-foreground">
                                                        {sortField === 'asn'
                                                            ? (sortDirection === 'asc' ? '↑' : '↓')
                                                            : '↕'
                                                        }
                                                    </span>
                                                </div>
                                            </th>
                                            <th
                                                className="h-10 px-2 text-left align-middle font-medium text-foreground whitespace-nowrap cursor-pointer hover:bg-muted/70"
                                                onClick={() => handleSort('status')}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <Activity className="h-3 w-3" />
                                                    Status
                                                    <span className="text-xs text-muted-foreground">
                                                        {sortField === 'status'
                                                            ? (sortDirection === 'asc' ? '↑' : '↓')
                                                            : '↕'
                                                        }
                                                    </span>
                                                </div>
                                            </th>
                                            <th
                                                className="h-10 px-2 text-left align-middle font-medium text-foreground whitespace-nowrap cursor-pointer hover:bg-muted/70"
                                                onClick={() => handleSort('city')}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    City
                                                    <span className="text-xs text-muted-foreground">
                                                        {sortField === 'city'
                                                            ? (sortDirection === 'asc' ? '↑' : '↓')
                                                            : '↕'
                                                        }
                                                    </span>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getSortedRouters.map((router, index) => (
                                            <tr
                                                key={`${router.router_id}-${index}`}
                                                className="hover:bg-muted/50 border-b transition-colors"
                                                title={`Region: ${router.location?.region || '-'}\nGeohash: ${router.geohash}\nISP: ${router.location?.isp || '-'}`}
                                            >
                                                <td className="p-2 align-middle font-mono text-xs max-w-[140px] truncate">{router.router_id}</td>
                                                <td
                                                    className="p-2 align-middle font-mono text-xs max-w-[110px] truncate cursor-pointer hover:text-blue-500 hover:underline"
                                                    onClick={() => {
                                                        setSelectedRouter(router);
                                                        setContextMenu(null);
                                                    }}
                                                >
                                                    {router.ip}
                                                </td>
                                                <td
                                                    className="p-2 align-middle cursor-pointer hover:text-blue-500 hover:underline"
                                                    onClick={() => {
                                                        setSelectedAs(Number(router.asn));
                                                        setContextMenu(null);
                                                    }}
                                                >
                                                    {router.asn}
                                                </td>
                                                <td className="p-2 align-middle">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        router.status === 'healthy' ? 'bg-emerald-100 text-emerald-700' :
                                                        router.status === 'warning' ? 'bg-orange-100 text-orange-700' :
                                                        router.status === 'critical' ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {router.status}
                                                    </span>
                                                </td>
                                                <td className="p-2 align-middle max-w-[120px] truncate">{router.location?.city || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
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
                onClick={(e) => {
                    setContextMenu(null);
                    onClick(e);
                }}
                onContextMenu={onContextMenu}
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
