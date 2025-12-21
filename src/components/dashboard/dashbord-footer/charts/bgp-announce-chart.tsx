"use client";

import { useQuery } from "@tanstack/react-query";
import {
    useState,
    useEffect,
    useMemo,
    useDeferredValue,
    useCallback,
    useRef,
} from "react";
import { useTimeRangeStore } from "@/lib/stores/time-range-store";
import { useLocationStore } from "@/lib/stores/location-store";
import {
    BoxPlotData,
    Country,
    PingDataResponse,
    QueryMode,
    Router,
} from "@/types/dashboard";
import { BoxPlotChart } from "./boxplot-chart";
import { TotalIncrementsChart } from "./total-increments-chart";
import { ZoomOut, ArrowLeft } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { API_BASE_URL } from "@/lib/config";
import { useRuntimeConfig } from "@/lib/useRuntimeConfig";

// Configuration from env
export const CONFIG = {
    small: {
        window: Number(process.env.NEXT_PUBLIC_AGG_TIME_WINDOW_SMALL || 60),
    },
    medium: {
        window: Number(process.env.NEXT_PUBLIC_AGG_TIME_WINDOW_MEDIUM || 3600),
    },
    large: {
        window: Number(process.env.NEXT_PUBLIC_AGG_TIME_WINDOW_LARGE || 86400),
    },
};

type TimeRange = keyof typeof CONFIG;

// Validation regex patterns
const AS_REGEX = /^(AS|as)?[0-9]+$/;
const CC_REGEX = /^[a-zA-Z]{2}$/;
// Simple IPv4 regex
const IPV4_REGEX =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
// Comprehensive IPv6 regex
const IPV6_REGEX =
    /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/;

function isValidInput(
    mode: QueryMode,
    value: string | number | null | undefined
): boolean {
    if (!value) return false;
    const trimmed = String(value).trim();
    if (trimmed.length === 0) return false;

    switch (mode) {
        case "as":
            return AS_REGEX.test(trimmed);
        case "cc":
            return CC_REGEX.test(trimmed);
        case "ip":
            return IPV4_REGEX.test(trimmed) || IPV6_REGEX.test(trimmed);
        default:
            return false;
    }
}

async function fetchBoxPlotData(
    range: TimeRange,
    mode: QueryMode,
    identifier: string,
    location: string,
    from: Date,
    to: Date
): Promise<BoxPlotData[]> {
    if (!isValidInput(mode, identifier)) {
        return [];
    }

    let url = "";

    if (mode === "as") {
        url = `${API_BASE_URL}/v1/bgp/announce-as-count-per-as?from=${from.toISOString()}&to=${to.toISOString()}&time-window=${range}&as-path-entry=${identifier}&location=${location}`;
    } else if (mode === "cc") {
        url = `${API_BASE_URL}/v1/bgp/announce-cc-count-per-cc?from=${from.toISOString()}&to=${to.toISOString()}&time-window=${range}&cc=${identifier}&location=${location}`;
    } else if (mode === "ip") {
        // Ping data endpoint
        // http://localhost:5000/api/v1/ping/data
        url = `${API_BASE_URL}/v1/ping/data?from=${from.toISOString()}&to=${to.toISOString()}&time-window=${range}&target_ip=${identifier}&location=${location}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    const json = await response.json();

    if (mode === "ip") {
        // Map Ping data to BoxPlotData structure
        return json.map((item: PingDataResponse) => {
            if (range === "small") {
                // Return item as is, but we might want to ensure it matches parts of BoxPlotData if strictness is required.
                // However, TotalIncrementsChart uses 'avg_rtt' via dataKey, so we just pass the object through.
                // We add timestampMs for completeness if done elsewhere, but here just raw mapping.
                return {
                    ...item,
                    timestamp: item.timestamp,
                    // Map avg_rtt to total_increments as a fallback if not using dataKey,
                    // but we ARE using dataKey.
                    total_increments: item.avg_rtt || 0,
                    avg_rtt: item.avg_rtt,
                    avg_ttl: item.avg_ttl,
                    next_power_of_2: item.next_power_of_2,
                } as unknown as BoxPlotData;
            } else {
                // Map percentiles for boxplot
                return {
                    timestamp: item.timestamp,
                    // Ping data uses p99, p95, p75. BoxPlotChart expects p099, p095, p075.
                    p01: item.p01,
                    p05: item.p05,
                    p25: item.p25,
                    p50: item.p50,
                    p075: item.p75,
                    p095: item.p95,
                    p099: item.p99,

                    // Fill required fields with dummies if needed, or rely on undefined
                    total_increments: 0,
                    as_path_entry: identifier,
                    avg_ttl: item.avg_ttl,
                    next_power_of_2: item.next_power_of_2,
                } as BoxPlotData;
            }
        });
    }

    return json;
}

function ChartTooltip({
    data,
    type,
    mode = "as", // 'as' | 'cc' | 'ip'
}: {
    data: BoxPlotData;
    type: "boxplot" | "line";
    mode?: QueryMode;
}) {
    // Determine labels based on mode
    const valueLabel =
        mode === "ip" ? "Ping RTT" : "Anzahl der Inkrementierungen";
    const runtimeConfig = useRuntimeConfig();

    if (type === "line") {
        // Line chart
        const val = mode === "ip" ? data.avg_rtt ?? 0 : data.total_increments;

        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm text-xs w-48">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Time
                        </span>
                        <span className="font-bold text-muted-foreground">
                            {new Date(data.timestamp).toLocaleString(
                                runtimeConfig.locale,
                                { timeZone: runtimeConfig.timezone }
                            )}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span
                            className="text-[0.70rem] uppercase"
                            style={{ color: "var(--primary)" }}
                        >
                            {valueLabel}
                        </span>
                        <span className="font-bold">
                            {typeof val === "number" ? val.toFixed(2) : val}
                        </span>
                    </div>
                    {data.avg_ttl !== undefined && (
                        <div className="flex flex-col">
                            <span
                                className="text-[0.70rem] uppercase"
                                style={{ color: "#ef4444" }}
                            >
                                TTL
                            </span>
                            <span className="font-bold">{data.avg_ttl}</span>
                        </div>
                    )}
                    {data.next_power_of_2 !== undefined && (
                        <div className="flex flex-col">
                            <span
                                className="text-[0.70rem] uppercase"
                                style={{ color: "#16a34a" }}
                            >
                                Next Power of 2
                            </span>
                            <span className="font-bold">
                                {data.next_power_of_2}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    // Boxplot chart
    return (
        <div className="bg-background border rounded-lg p-3 shadow-lg text-xs w-48">
            <p className="font-medium mb-2">
                {new Date(data.timestamp).toLocaleString(runtimeConfig.locale, {
                    timeZone: runtimeConfig.timezone,
                })}
            </p>
            <div className="space-y-1">
                <p className="text-muted-foreground flex justify-between">
                    <span>Max (p99):</span>
                    <span className="font-mono text-foreground">
                        {data.p099}
                    </span>
                </p>
                <p className="text-muted-foreground flex justify-between">
                    <span>Q3 (p75):</span>
                    <span className="font-mono text-foreground">
                        {data.p075}
                    </span>
                </p>
                <p className="text-muted-foreground font-bold flex justify-between">
                    <span>Median:</span>
                    <span className="font-mono text-foreground">
                        {data.p50}
                    </span>
                </p>
                <p className="text-muted-foreground flex justify-between">
                    <span>Q1 (p25):</span>
                    <span className="font-mono text-foreground">
                        {data.p25}
                    </span>
                </p>
                <p className="text-muted-foreground flex justify-between">
                    <span>Min (p01):</span>
                    <span className="font-mono text-foreground">
                        {data.p01}
                    </span>
                </p>
            </div>
        </div>
    );
}

interface BgpAnnounceChartProps {
    asn?: number | null;
    selectedRouter?: Router | null;
    selectedCountry: Country;
}

// Main component
export function BgpAnnounceChart({
    asn,
    selectedRouter,
    selectedCountry,
}: BgpAnnounceChartProps) {
    const DEBOUNCE_TIME = 500;
    const runtimeConfig = useRuntimeConfig();

    // Global Time Store
    const { timeRange, windowSize, isPlaying, playbackPosition } =
        useTimeRangeStore();

    // Global Location Store
    const { selectedLocationId } = useLocationStore();

    const [mode, setMode] = useState<QueryMode>("as");
    const [identifier, setIdentifier] = useState("");
    const [debouncedIdentifier, setDebouncedIdentifier] = useState(identifier);

    // Timeline state for LOCAL ZOOM only
    // 0-100% of the FETCHED range (global time range)
    const [viewRange, setViewRange] = useState([0, 100]);

    // Defer state updates for smoother UI
    const deferredViewRange = useDeferredValue(viewRange);

    // React to prop changes
    // React to prop changes
    const prevAsn = useRef(asn);
    const prevRouter = useRef(selectedRouter);
    const prevCountry = useRef(selectedCountry);

    useEffect(() => {
        const asnChanged = asn !== prevAsn.current;
        const routerChanged = selectedRouter?.ip !== prevRouter.current?.ip;

        // If router changed specifically, switch to IP mode
        if (routerChanged && selectedRouter && selectedRouter.ip) {
            setMode("ip");
            setIdentifier(selectedRouter.ip);
        }
        // If AS changed (and implies we want to see AS data)
        else if (asnChanged && asn) {
            setMode("as");
            setIdentifier(asn.toString());
        }

        prevAsn.current = asn;
        prevRouter.current = selectedRouter;
    }, [selectedRouter, asn]);

    // Automatically switch to CC mode when a country is selected
    useEffect(() => {
        const countryChanged = selectedCountry?.code !== prevCountry.current?.code;
        if (countryChanged && selectedCountry && selectedCountry.code && selectedCountry.code.toLowerCase() !== "world") {
            setMode("cc");
            setIdentifier(selectedCountry.code);
        }
        prevCountry.current = selectedCountry;
    }, [selectedCountry]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedIdentifier(identifier);
        }, DEBOUNCE_TIME);

        return () => {
            clearTimeout(handler);
        };
    }, [identifier]);

    // Reset view range when global time range changes drastically
    const startMs = timeRange.start.getTime();
    const endMs = timeRange.end.getTime();

    useEffect(() => {
        setViewRange([0, 100]);
    }, [startMs, endMs]);

    const handleBack = () => {
        if (mode === "ip") {
            const potentialAsn =
                selectedRouter?.asn || (asn ? asn.toString() : "");
            if (potentialAsn) {
                setMode("as");
                setIdentifier(potentialAsn);
            } else {
                // If no ASN found, fallback to country logic
                if (
                    selectedCountry &&
                    selectedCountry.code &&
                    selectedCountry.code.toLowerCase() !== "world"
                ) {
                    setMode("cc");
                    setIdentifier(selectedCountry.code);
                }
            }
        } else if (mode === "as") {
            if (
                selectedCountry &&
                selectedCountry.code &&
                selectedCountry.code.toLowerCase() !== "world"
            ) {
                setMode("cc");
                setIdentifier(selectedCountry.code);
            }
        }
    };

    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: [
            "bgp-announce-data",
            windowSize, // Use windowSize as range/resolution key
            mode,
            debouncedIdentifier,
            selectedLocationId,
            timeRange.start.toISOString(),
            timeRange.end.toISOString(),
        ],
        queryFn: () =>
            fetchBoxPlotData(
                windowSize as TimeRange,
                mode,
                debouncedIdentifier,
                selectedLocationId || "",
                timeRange.start,
                timeRange.end
            ),
        enabled:
            isValidInput(mode, debouncedIdentifier) && !!selectedLocationId,
    });

    // Pre-process data to include timestampMs for faster filtering
    const processedData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return data.map((d) => ({
            ...d,
            timestampMs: new Date(d.timestamp).getTime(),
        }));
    }, [data]);

    const from = timeRange.start;
    const to = timeRange.end;
    const totalDuration = to.getTime() - from.getTime();

    // Calculate view range dates (Immediate for UI)
    const viewStart = useMemo(
        () => new Date(from.getTime() + (totalDuration * viewRange[0]) / 100),
        [from, totalDuration, viewRange]
    );
    const viewEnd = useMemo(
        () => new Date(from.getTime() + (totalDuration * viewRange[1]) / 100),
        [from, totalDuration, viewRange]
    );

    // Determine current time to display logic
    // If playback is active or we have a specific position, use that.
    // Otherwise fallback to end of range (or end of view).
    const currentTimestampMs = playbackPosition
        ? playbackPosition.getTime()
        : to.getTime();

    const currentDate = new Date(currentTimestampMs);

    // Calculate view range dates (Deferred for Chart)
    const deferredViewStart = new Date(
        from.getTime() + (totalDuration * deferredViewRange[0]) / 100
    );
    const deferredViewEnd = new Date(
        from.getTime() + (totalDuration * deferredViewRange[1]) / 100
    );

    // Filter data based on deferred view range
    const deferredViewStartMs = deferredViewStart.getTime();
    const deferredViewEndMs = deferredViewEnd.getTime();

    const filteredData = useMemo(() => {
        return processedData.filter((d) => {
            return (
                d.timestampMs >= deferredViewStartMs &&
                d.timestampMs <= deferredViewEndMs
            );
        });
    }, [processedData, deferredViewStartMs, deferredViewEndMs]);

    // Calculate current data point for tooltip
    const currentDataPoint = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return null;

        // Find closest data point
        let closest = filteredData[0];
        let minDiff = Math.abs(closest.timestampMs - currentTimestampMs);

        for (let i = 1; i < filteredData.length; i++) {
            const diff = Math.abs(
                filteredData[i].timestampMs - currentTimestampMs
            );
            if (diff < minDiff) {
                minDiff = diff;
                closest = filteredData[i];
            }
        }
        return closest;
    }, [filteredData, currentTimestampMs]);

    // Handlers for playback control

    // Calculate position for vertical line:
    // It should be relative to the view range if we are zoomed in?
    // Actually the line shows the "current global time".
    // If we are zoomed in, and the current time is outside, we might not see it or we clamp it.
    // For now, let's render it if it's within the VIEW range.

    // We need to map `currentTimestampMs` to a percentage within the `viewStart` to `viewEnd`.
    const viewDurationMs = viewEnd.getTime() - viewStart.getTime();
    const timeInViewMs = currentTimestampMs - viewStart.getTime();

    // This is 0-100 relative to the CURRENT VIEW
    const currentTimePercentInView =
        viewDurationMs > 0 ? (timeInViewMs / viewDurationMs) * 100 : 0;

    const isCurrentTimeInView =
        currentTimestampMs >= viewStart.getTime() &&
        currentTimestampMs <= viewEnd.getTime();

    const handleZoomCallback = useCallback(
        (startMs: number, endMs: number) => {
            const startPercent = Math.max(
                0,
                ((startMs - from.getTime()) / totalDuration) * 100
            );
            const endPercent = Math.min(
                100,
                ((endMs - from.getTime()) / totalDuration) * 100
            );
            setViewRange([startPercent, endPercent]);
        },
        [from, totalDuration]
    );

    const getTitle = () => {
        if (mode === "ip")
            return (
                <>
                    Ping RTT for Router Interface{" "}
                    <span className="text-blue-500">{identifier}</span>
                </>
            );
        if (mode === "cc")
            return (
                <>
                    BGP Announcements (Boxplot) for{" "}
                    <span className="text-blue-500">
                        Country Code {identifier.toUpperCase()}
                    </span>
                </>
            );
        return (
            <>
                BGP Announcements (Boxplot) for{" "}
                <span className="text-blue-500">AS-{identifier}</span>
            </>
        );
    };

    return (
        <Card className="w-full">
            <CardHeader className="space-y-4 flex items-center justify-between">
                <div className="flex flex-col space-y-1.5">
                    <CardTitle className="flex items-center gap-2">
                        {mode !== "cc" && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBack}
                                className="h-8 w-8 p-0"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        {getTitle()}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="relative min-h-[400px] flex flex-col gap-4">
                <div className="relative min-h-[400px]">
                    {!selectedLocationId ? (
                        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                            Please select a location.
                        </div>
                    ) : !isValidInput(mode, identifier) ? (
                        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                            Please select a target (AS, router or country).
                        </div>
                    ) : isLoading || isFetching ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                            <div className="animate-pulse text-muted-foreground">
                                Loading...
                            </div>
                        </div>
                    ) : error ? (
                        <div className="h-[400px] flex items-center justify-center text-destructive">
                            Error loading data.
                        </div>
                    ) : !data || !Array.isArray(data) || data.length === 0 ? (
                        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                            No data available.
                        </div>
                    ) : (
                        <>
                            {windowSize === "small" ? (
                                <div className="relative w-full h-[400px]">
                                    <TotalIncrementsChart
                                        data={filteredData}
                                        onZoom={handleZoomCallback}
                                        domain={[
                                            deferredViewStart.getTime(),
                                            deferredViewEnd.getTime(),
                                        ]}
                                        dataKey={
                                            mode === "ip"
                                                ? "avg_rtt"
                                                : "total_increments"
                                        }
                                        valueLabel={
                                            mode === "ip"
                                                ? "Ping RTT"
                                                : "Anzahl der Inkrementierungen"
                                        }
                                        showAvgTtl={mode === "ip"}
                                        showNextPowerOf2={mode === "ip"}
                                    />
                                    <div
                                        className="absolute top-[20px] bottom-[35px] w-[2px] bg-primary/50 pointer-events-none transition-none z-10"
                                        style={{
                                            left: `calc(50px + (100% - 50px - 20px) * ${currentTimePercentInView / 100
                                                })`,
                                            display: isCurrentTimeInView
                                                ? "block"
                                                : "none",
                                        }}
                                    >
                                        {isPlaying && currentDataPoint && (
                                            <div
                                                className="absolute top-0"
                                                style={{
                                                    left:
                                                        currentTimePercentInView >
                                                            50
                                                            ? "auto"
                                                            : "100%",
                                                    right:
                                                        currentTimePercentInView >
                                                            50
                                                            ? "100%"
                                                            : "auto",
                                                    marginLeft:
                                                        currentTimePercentInView >
                                                            50
                                                            ? 0
                                                            : "8px",
                                                    marginRight:
                                                        currentTimePercentInView >
                                                            50
                                                            ? "8px"
                                                            : 0,
                                                }}
                                            >
                                                <ChartTooltip
                                                    key={
                                                        currentDataPoint.timestamp
                                                    }
                                                    data={currentDataPoint}
                                                    type="line"
                                                    mode={mode}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-full h-[400px]">
                                    <BoxPlotChart
                                        data={filteredData}
                                        onZoom={handleZoomCallback}
                                        domain={[
                                            deferredViewStart.getTime(),
                                            deferredViewEnd.getTime(),
                                        ]}
                                    />
                                    <div
                                        className="absolute top-[20px] bottom-[35px] w-[2px] bg-primary/50 pointer-events-none transition-none z-10"
                                        style={{
                                            left: `calc(50px + (100% - 50px - 20px) * ${currentTimePercentInView / 100
                                                })`,
                                            display: isCurrentTimeInView
                                                ? "block"
                                                : "none",
                                        }}
                                    >
                                        {isPlaying && currentDataPoint && (
                                            <div
                                                className="absolute top-0"
                                                style={{
                                                    left:
                                                        currentTimePercentInView >
                                                            50
                                                            ? "auto"
                                                            : "100%",
                                                    right:
                                                        currentTimePercentInView >
                                                            50
                                                            ? "100%"
                                                            : "auto",
                                                    marginLeft:
                                                        currentTimePercentInView >
                                                            50
                                                            ? 0
                                                            : "8px",
                                                    marginRight:
                                                        currentTimePercentInView >
                                                            50
                                                            ? "8px"
                                                            : 0,
                                                }}
                                            >
                                                <ChartTooltip
                                                    key={
                                                        currentDataPoint.timestamp
                                                    }
                                                    data={currentDataPoint}
                                                    type="boxplot"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {(viewRange[0] > 0 || viewRange[1] < 100) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="absolute top-2 right-2 z-20 bg-background/80 hover:bg-background"
                                    onClick={() => setViewRange([0, 100])}
                                >
                                    <ZoomOut className="h-4 w-4 mr-2" />
                                    Reset
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {/* Timeline Controls */}
                <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                            {currentDate.toLocaleString(runtimeConfig.locale, {
                                weekday: "short",
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: runtimeConfig.timezone,
                            })}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Displayed Time Range (From/To)</span>
                            <span>
                                {viewStart.toLocaleString(
                                    runtimeConfig.locale,
                                    {
                                        weekday: "short",
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        timeZone: runtimeConfig.timezone,
                                    }
                                )}{" "}
                                -{" "}
                                {viewEnd.toLocaleString(runtimeConfig.locale, {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZone: runtimeConfig.timezone,
                                })}
                            </span>
                        </div>
                        <Slider
                            value={viewRange}
                            onValueChange={setViewRange}
                            max={100}
                            step={1}
                            minStepsBetweenThumbs={2.5}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
