"use client";

import { useMemo } from "react";
import {
    ComposedChart,
    Line,
    Area,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import anomaliesData from "@/data/anomalies.json";
import plotDataRaw from "@/data/plot_data.json";

const Z_THRESH = 1.73;

interface Anomaly {
    timestamp: string;
    entity_type: string;
    entity_id: string;
    value: number;
    z: number;
}

interface PlotDataPoint {
    ts: string;
    type: string;
    id: string;
    mean: number;
    std: number;
}

interface AnomalyChartProps {
    entityId?: string;
    entityType?: string;
}

interface TooltipPayloadEntry {
    color: string;
    name: string;
    value: number | [number, number] | null | undefined;
}

export function AnomalyChart({
    entityId = "HK",
    entityType = "country",
}: AnomalyChartProps) {
    const chartData = useMemo(() => {
        // Process plot data
        const processedPlotData = (plotDataRaw as PlotDataPoint[])
            .filter((d) => d.id === entityId && d.type === entityType)
            .map((d) => {
                const mean = d.mean;
                const std = d.std;
                const upper = mean + Z_THRESH * std;
                const lower = mean - Z_THRESH * std;
                return {
                    x: new Date(d.ts).getTime(),
                    mean,
                    range: [lower, upper] as [number, number],
                    anomalyValue: null,
                    z: null,
                };
            });

        // Process anomalies
        const processedAnomalies = (anomaliesData as Anomaly[])
            .filter(
                (d) => d.entity_id === entityId && d.entity_type === entityType
            )
            .map((d) => ({
                x: new Date(d.timestamp).getTime(),
                mean: null,
                range: null,
                anomalyValue: d.value,
                z: d.z,
            }));

        // Combine and sort
        const combinedData = [...processedPlotData, ...processedAnomalies].sort(
            (a, b) => a.x - b.x
        );

        // Calculate Y-axis domain
        const allYValues = [
            ...processedPlotData.flatMap((d) => d.range),
            ...processedAnomalies.map((d) => d.anomalyValue!),
        ].filter((v) => v !== null && v !== undefined);

        // Default domain if no data
        let yDomain: [number, number | "auto"] = [0, "auto"];
        if (allYValues.length > 0) {
            const minY = Math.min(...allYValues);
            const maxY = Math.max(...allYValues);
            // Add some padding
            const padding = (maxY - minY) * 0.1;
            yDomain = [Math.max(0, minY - padding), maxY + padding];
        }

        return {
            data: combinedData,
            yDomain,
        };
    }, [entityId, entityType]);

    if (chartData.data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Anomaly Detection - {entityId}</CardTitle>
                    <CardDescription>No data available</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="w-full h-[500px]">
            <CardHeader>
                <CardTitle>Anomaly Detection - {entityId}</CardTitle>
                <CardDescription>
                    EWMA z-score backtest (Threshold: ±{Z_THRESH}σ)
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData.data}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="x"
                            type="number"
                            domain={["dataMin", "dataMax"]}
                            tickFormatter={(ts) =>
                                new Date(ts).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })
                            }
                        />
                        <YAxis domain={chartData.yDomain} />
                        <Tooltip
                            labelFormatter={(label) =>
                                new Date(label).toLocaleString()
                            }
                            content={({ active, payload, label }) => {
                                if (
                                    active &&
                                    payload &&
                                    payload.length &&
                                    label !== undefined
                                ) {
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
                                            <div className="mb-2 font-bold">
                                                {new Date(
                                                    label
                                                ).toLocaleString()}
                                            </div>
                                            {payload.map(
                                                (
                                                    entry: TooltipPayloadEntry,
                                                    index: number
                                                ) => {
                                                    if (
                                                        entry.value === null ||
                                                        entry.value ===
                                                            undefined ||
                                                        (Array.isArray(
                                                            entry.value
                                                        ) &&
                                                            entry.value[0] ===
                                                                null)
                                                    ) {
                                                        return null;
                                                    }
                                                    return (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <div
                                                                className="h-2 w-2 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        entry.color,
                                                                }}
                                                            />
                                                            <span className="capitalize text-muted-foreground">
                                                                {entry.name}:
                                                            </span>
                                                            <span className="font-bold">
                                                                {Array.isArray(
                                                                    entry.value
                                                                )
                                                                    ? `${entry.value[0].toFixed(
                                                                          2
                                                                      )} - ${entry.value[1].toFixed(
                                                                          2
                                                                      )}`
                                                                    : typeof entry.value ===
                                                                      "number"
                                                                    ? entry.value.toFixed(
                                                                          2
                                                                      )
                                                                    : entry.value}
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend />

                        {/* Band Area */}
                        <Area
                            type="monotone"
                            dataKey="range"
                            fill="#1f77b4"
                            fillOpacity={0.15}
                            stroke="none"
                            name={`±${Z_THRESH}σ band`}
                            isAnimationActive={false}
                            connectNulls
                        />

                        {/* Mean Line */}
                        <Line
                            type="monotone"
                            dataKey="mean"
                            stroke="#1f77b4"
                            strokeWidth={1.5}
                            dot={false}
                            name="EWMA mean"
                            activeDot={{ r: 4 }}
                            isAnimationActive={false}
                            connectNulls
                        />

                        {/* Anomalies Scatter */}
                        <Scatter
                            dataKey="anomalyValue"
                            name="Anomaly"
                            fill="red"
                            shape="circle"
                            isAnimationActive={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
