"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { BoxPlotChart, BoxPlotData } from "./boxplot-chart";
import { TotalIncrementsChart } from "./total-increments-chart";

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
    identifier: string
): Promise<BoxPlotData[]> {
    const config = CONFIG[range];
    const to = new Date();
    to.setUTCHours(0, 0, 0, 0);
    // const to = new Date();
    // to.setUTCFullYear(2025, 9, 7);
    // to.setUTCHours(0, 0, 0, 0);
    const from = new Date(to.getTime() - config.days * 24 * 60 * 60 * 1000);

    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_API_URL || "";
    let url = "";

    if (mode === "as") {
        url = `${baseUrl}/api/v1/bgp/announce-as-count-per-as?from=${from.toISOString()}&to=${to.toISOString()}&time-window=${range}&as-path-entry=${identifier}`;
    } else {
        url = `${baseUrl}/api/v1/bgp/announce-cc-count-per-cc?from=${from.toISOString()}&to=${to.toISOString()}&time-window=${range}&country-code=${identifier}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
}

export function BgpAnnounceChart() {
    const [range, setRange] = useState<TimeRange>("small");
    const [mode, setMode] = useState<QueryMode>("as");
    const [identifier, setIdentifier] = useState("");
    const [debouncedIdentifier, setDebouncedIdentifier] = useState(identifier);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedIdentifier(identifier);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [identifier]);

    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ["bgp-announce-data", range, mode, debouncedIdentifier],
        queryFn: () => fetchBoxPlotData(range, mode, debouncedIdentifier),
        enabled: debouncedIdentifier.length > 0,
    });

    const formatLabel = (days: number) => {
        return days === 1 ? "1 Tag" : `${days} Tage`;
    };

    return (
        <Card className="w-full">
            <CardHeader className="space-y-4 pb-4">
                <div className="flex flex-col space-y-1.5">
                    <CardTitle>BGP Announcements (Boxplot)</CardTitle>
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

                    <Select
                        value={range}
                        onValueChange={(val) => setRange(val as TimeRange)}
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
            </CardHeader>
            <CardContent className="relative min-h-[400px]">
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
                  (data.length === 0 && !isLoading && !isFetching) ? (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                        Keine Daten vorhanden.
                    </div>
                ) : range === "small" ? (
                    // Show line graph for data without percentile values
                    <TotalIncrementsChart data={data} />
                ) : (
                    // Show boxplot graph for data with percentile values
                    <BoxPlotChart data={data} />
                )}
            </CardContent>
        </Card>
    );
}
