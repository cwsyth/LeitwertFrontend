"use client";

import { useQuery } from "@tanstack/react-query";
import {
    useState,
    useEffect,
    useMemo,
    useDeferredValue,
    useCallback,
} from "react";
import { BoxPlotChart, BoxPlotData } from "./boxplot-chart";
import { TotalIncrementsChart } from "./total-increments-chart";
import { Play, Pause, SkipBack, SkipForward, ZoomOut } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { API_BASE_URL } from "@/lib/config";

// Configuration from env
const CONFIG = {
    small: {
        days: Number(process.env.NEXT_PUBLIC_BGP_ANNOUNCE_SMALL || 1),
        window: Number(process.env.NEXT_PUBLIC_AGG_TIME_WINDOW_SMALL || 60),
    },
    medium: {
        days: Number(process.env.NEXT_PUBLIC_BGP_ANNOUNCE_MEDIUM || 7),
        window: Number(process.env.NEXT_PUBLIC_AGG_TIME_WINDOW_MEDIUM || 3600),
    },
    large: {
        days: Number(process.env.NEXT_PUBLIC_BGP_ANNOUNCE_LARGE || 14),
        window: Number(process.env.NEXT_PUBLIC_AGG_TIME_WINDOW_LARGE || 86400),
    },
};

type TimeRange = keyof typeof CONFIG;
type QueryMode = "as" | "cc";

async function fetchBoxPlotData(
    range: TimeRange,
    mode: QueryMode,
    identifier: string,
    endDate: string
): Promise<BoxPlotData[]> {
    const config = CONFIG[range];
    // Temporary workaround: Use provided end date until continuous data is available
    const to = endDate ? new Date(endDate) : new Date();
    to.setUTCHours(0, 0, 0, 0);

    const from = new Date(to.getTime() - config.days * 24 * 60 * 60 * 1000);

    let url = "";

    if (mode === "as") {
        url = `${API_BASE_URL}/v1/bgp/announce-as-count-per-as?from=${from.toISOString()}&to=${to.toISOString()}&time-window=${range}&as-path-entry=${identifier}`;
    } else {
        url = `${API_BASE_URL}/v1/bgp/announce-cc-count-per-cc?from=${from.toISOString()}&to=${to.toISOString()}&time-window=${range}&country-code=${identifier}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
}

function ChartTooltip({
    data,
    type,
}: {
    data: BoxPlotData;
    type: "boxplot" | "line";
}) {
    if (type === "line") {
        // Line chart
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm text-xs w-48">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Time
                        </span>
                        <span className="font-bold text-muted-foreground">
                            {new Date(data.timestamp).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Increments
                        </span>
                        <span className="font-bold">
                            {data.total_increments}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    // Boxplot chart
    return (
        <div className="bg-background border rounded-lg p-3 shadow-lg text-xs w-48">
            <p className="font-medium mb-2">
                {new Date(data.timestamp).toLocaleString()}
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
    router: string | undefined;
}

export function BgpAnnounceChart({ router }: BgpAnnounceChartProps) {
    const DEBOUNCE_TIME = 500;
    const [range, setRange] = useState<TimeRange>("small");
    const [mode, setMode] = useState<QueryMode>("as");
    const [identifier, setIdentifier] = useState("");
    const [debouncedIdentifier, setDebouncedIdentifier] = useState(identifier);
    // Temporary workaround: Custom end date state
    const [customEndDate, setCustomEndDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [debouncedEndDate, setDebouncedEndDate] = useState(customEndDate);

    // Timeline state
    const [currentTimePercent, setCurrentTimePercent] = useState(100); // 0-100% of the VIEW range
    const [viewRange, setViewRange] = useState([0, 100]); // 0-100% of the FETCHED range
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isInteracting, setIsInteracting] = useState(false);

    // Defer state updates for smoother UI
    const deferredViewRange = useDeferredValue(viewRange);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedIdentifier(identifier);
        }, DEBOUNCE_TIME);

        return () => {
            clearTimeout(handler);
        };
    }, [identifier]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedEndDate(customEndDate);
        }, DEBOUNCE_TIME);

        return () => {
            clearTimeout(handler);
        };
    }, [customEndDate]);

    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: [
            "bgp-announce-data",
            range,
            mode,
            debouncedIdentifier,
            debouncedEndDate,
        ],
        queryFn: () =>
            fetchBoxPlotData(
                range,
                mode,
                debouncedIdentifier,
                debouncedEndDate
            ),
        enabled: debouncedIdentifier.length > 0,
    });

    // Pre-process data to include timestampMs for faster filtering
    const processedData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return data.map((d) => ({
            ...d,
            timestampMs: new Date(d.timestamp).getTime(),
        }));
    }, [data]);

    // Calculate dates
    const { from, to } = useMemo(() => {
        const config = CONFIG[range];
        // Temporary workaround: Use provided end date until continuous data is available
        const t = debouncedEndDate ? new Date(debouncedEndDate) : new Date();
        // t.setUTCFullYear(2025, 9, 7); // Hardcoded as in original
        t.setUTCHours(0, 0, 0, 0);
        const f = new Date(t.getTime() - config.days * 24 * 60 * 60 * 1000);
        return { from: f, to: t };
    }, [range, debouncedEndDate]);

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
    const viewDuration = viewEnd.getTime() - viewStart.getTime();

    // Calculate current time (Immediate for UI)
    const currentDate = new Date(
        viewStart.getTime() + (viewDuration * currentTimePercent) / 100
    );

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

        // Calculate current timestamp based on immediate view range (to match slider position)
        const currentTimestampMs =
            viewStart.getTime() + (viewDuration * currentTimePercent) / 100;

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
    }, [filteredData, viewStart, viewDuration, currentTimePercent]);

    // Playback logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentTimePercent((prev) => {
                    if (prev >= 100) {
                        setIsPlaying(false);
                        return 100;
                    }
                    return prev + 0.5 * playbackSpeed;
                });
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed]);

    const formatLabel = (days: number) => {
        return days === 1 ? "1 Tag" : `${days} Tage`;
    };

    const handleSkipBack = () => {
        setCurrentTimePercent(0);
        setIsPlaying(false);
    };

    const handleSkipForward = () => {
        setCurrentTimePercent(100);
        setIsPlaying(false);
    };

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

    return (
        <Card className="w-full">
            <CardHeader className="space-y-4 pb-4">
                <div className="flex flex-col space-y-1.5">
                    <CardTitle>
                        BGP Announcements (Boxplot) for{" "}
                        <span className="text-blue-500">AS-{router}</span>
                    </CardTitle>
                    <CardDescription>
                        Verteilung der BGP Announcements für{" "}
                        {mode === "as" ? "AS" : "Country Code"} {identifier}
                    </CardDescription>
                </div>

                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ToggleGroup
                            type="single"
                            value={mode}
                            onValueChange={(val) =>
                                val && setMode(val as QueryMode)
                            }
                            className="border rounded-md"
                        >
                            <ToggleGroupItem
                                value="as"
                                className="px-3 py-1 text-sm"
                            >
                                AS
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="cc"
                                className="px-3 py-1 text-sm"
                            >
                                CC
                            </ToggleGroupItem>
                        </ToggleGroup>

                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={
                                mode === "as" ? "AS Number" : "Country Code"
                            }
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Temporary workaround: Date input for end date */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                End-Datum:
                            </span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) =>
                                    setCustomEndDate(e.target.value)
                                }
                                className="flex h-10 w-min rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <Select
                            value={range}
                            onValueChange={(val) => {
                                setRange(val as TimeRange);
                                setViewRange([0, 100]); // Reset view range on range change
                                setCurrentTimePercent(100); // Reset current time
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Zeitraum wählen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">
                                    {formatLabel(CONFIG.small.days)}
                                </SelectItem>
                                <SelectItem value="medium">
                                    {formatLabel(CONFIG.medium.days)}
                                </SelectItem>
                                <SelectItem value="large">
                                    {formatLabel(CONFIG.large.days)}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative min-h-[400px] flex flex-col gap-4">
                <div className="relative min-h-[400px]">
                    {(isLoading || isFetching) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                            <div className="animate-pulse text-muted-foreground">
                                Laden...
                            </div>
                        </div>
                    )}
                    {error ? (
                        <div className="h-[400px] flex items-center justify-center text-destructive">
                            Fehler beim Laden der Daten.
                        </div>
                    ) : !data ||
                      !Array.isArray(data) ||
                      (data.length === 0 && !isLoading && !isFetching) ? (
                        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                            Keine Daten vorhanden.
                        </div>
                    ) : (
                        <>
                            {range === "small" ? (
                                <div className="relative w-full h-[400px]">
                                    <TotalIncrementsChart
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
                                            left: `calc(50px + (100% - 50px - 20px) * ${
                                                currentTimePercent / 100
                                            })`,
                                        }}
                                    >
                                        {(isInteracting || isPlaying) &&
                                            currentDataPoint && (
                                                <div
                                                    className="absolute top-0"
                                                    style={{
                                                        left:
                                                            currentTimePercent >
                                                            50
                                                                ? "auto"
                                                                : "100%",
                                                        right:
                                                            currentTimePercent >
                                                            50
                                                                ? "100%"
                                                                : "auto",
                                                        marginLeft:
                                                            currentTimePercent >
                                                            50
                                                                ? 0
                                                                : "8px",
                                                        marginRight:
                                                            currentTimePercent >
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
                                            left: `calc(50px + (100% - 50px - 20px) * ${
                                                currentTimePercent / 100
                                            })`,
                                        }}
                                    >
                                        {(isInteracting || isPlaying) &&
                                            currentDataPoint && (
                                                <div
                                                    className="absolute top-0"
                                                    style={{
                                                        left:
                                                            currentTimePercent >
                                                            50
                                                                ? "auto"
                                                                : "100%",
                                                        right:
                                                            currentTimePercent >
                                                            50
                                                                ? "100%"
                                                                : "auto",
                                                        marginLeft:
                                                            currentTimePercent >
                                                            50
                                                                ? 0
                                                                : "8px",
                                                        marginRight:
                                                            currentTimePercent >
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
                                    Reset Zoom
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {/* Timeline Controls */}
                <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleSkipBack}
                            >
                                <SkipBack className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? (
                                    <Pause className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleSkipForward}
                            >
                                <SkipForward className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-2 ml-2">
                                <span className="text-xs text-muted-foreground">
                                    Speed:
                                </span>
                                <ToggleGroup
                                    type="single"
                                    value={playbackSpeed.toString()}
                                    onValueChange={(val) =>
                                        val && setPlaybackSpeed(Number(val))
                                    }
                                    size="sm"
                                >
                                    <ToggleGroupItem
                                        value="0.5"
                                        aria-label="0.5x"
                                    >
                                        0.5x
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="1" aria-label="1x">
                                        1x
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="2" aria-label="2x">
                                        2x
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                        </div>
                        <div className="text-sm font-medium">
                            {currentDate.toLocaleString("de-DE", {
                                weekday: "short",
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Current Time</span>
                        </div>
                        <div
                            onPointerDown={() => setIsInteracting(true)}
                            onPointerUp={() => setIsInteracting(false)}
                            onPointerLeave={() => setIsInteracting(false)}
                        >
                            <Slider
                                value={[currentTimePercent]}
                                onValueChange={(val) => {
                                    setCurrentTimePercent(val[0]);
                                    setIsPlaying(false);
                                }}
                                max={100}
                                step={0.1}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>View Range (Von/Bis)</span>
                            <span>
                                {viewStart.toLocaleDateString()} -{" "}
                                {viewEnd.toLocaleDateString()}
                            </span>
                        </div>
                        <Slider
                            value={viewRange}
                            onValueChange={setViewRange}
                            max={100}
                            step={1}
                            minStepsBetweenThumbs={5}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
