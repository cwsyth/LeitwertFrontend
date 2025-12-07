"use client";

import { memo } from "react";
import {
    Line,
    ComposedChart,
    Area,
    LineChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { BoxPlotData } from "./boxplot-chart";

interface TotalIncrementsChartProps {
    data: BoxPlotData[];
}

const TotalIncrementsChartComponent = ({ data }: TotalIncrementsChartProps) => {
    // Compute chart-friendly fields: conf_lower, conf_upper, band, anomaly_point
    const chartData = data.map((d) => {
        const mean = d.mean ?? null;
        const std = d.std ?? null;
        const conf_lower = mean !== null && std !== null ? mean - std : null;
        const conf_upper = mean !== null && std !== null ? mean + std : null;
        const band =
            conf_lower !== null && conf_upper !== null
                ? conf_upper - conf_lower
                : 0;
        return {
            ...d,
            conf_lower,
            conf_upper,
            band,
            anomaly_point: d.is_anomaly ? d.total_increments : null,
        };
    });

    const CustomAnomalyDot = (props: any) => {
        const { cx, cy, payload } = props;
        if (!payload || !payload.is_anomaly) return null;
        return (
            <circle
                cx={cx}
                cy={cy}
                r={5}
                stroke="#ef4444"
                strokeWidth={2}
                fill="#fff"
            />
        );
    };

    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                    />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            });
                        }}
                        className="text-xs text-muted-foreground"
                    />
                    <YAxis
                        className="text-xs text-muted-foreground"
                        width={50}
                    />

                    <Tooltip
                        isAnimationActive={false}
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                const item = payload[0]
                                    .payload as BoxPlotData & {
                                    conf_lower?: number | null;
                                    conf_upper?: number | null;
                                    anomaly_point?: number | null;
                                    is_anomaly?: boolean;
                                    anomaly_score?: number;
                                };

                                return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <div className="grid grid-cols-1 gap-2">
                                            <div>
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                    Time
                                                </span>
                                                <div className="font-bold text-muted-foreground">
                                                    {new Date(
                                                        label || 0
                                                    ).toLocaleString()}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                    Increments
                                                </span>
                                                <div className="font-bold">
                                                    {item.total_increments}
                                                </div>
                                            </div>
                                            {item.conf_lower !== undefined &&
                                                item.conf_upper !==
                                                    undefined && (
                                                    <div>
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            Expected
                                                        </span>
                                                        <div className="font-mono">
                                                            {item.conf_lower?.toFixed(
                                                                1
                                                            )}{" "}
                                                            -{" "}
                                                            {item.conf_upper?.toFixed(
                                                                1
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            {item.is_anomaly && (
                                                <div className="text-destructive font-medium">
                                                    ⚠ Anomaly (score:{" "}
                                                    {item.anomaly_score?.toFixed(
                                                        2
                                                    )}
                                                    )
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />

                    {/* Confidence band: draw lower base and a stacked area for the band width */}
                    <Area
                        dataKey="conf_lower"
                        stroke="none"
                        fill="transparent"
                        stackId="1"
                    />
                    <Area
                        dataKey="band"
                        stroke="none"
                        fill="#2563eb"
                        fillOpacity={0.12}
                        stackId="1"
                    />

                    {/* Main line */}
                    <Line
                        type="monotone"
                        dataKey="total_increments"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                        isAnimationActive={false}
                    />

                    {/* Anomaly markers as custom dots */}
                    <Line
                        type="monotone"
                        dataKey="anomaly_point"
                        stroke="none"
                        dot={<CustomAnomalyDot />}
                        activeDot={false}
                        isAnimationActive={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export const TotalIncrementsChart = memo(TotalIncrementsChartComponent);
