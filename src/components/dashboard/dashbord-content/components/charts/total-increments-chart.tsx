"use client";

import { memo, useState, useMemo } from "react";
import {
    Line,
    ComposedChart,
    Area,
    CartesianGrid,
    ReferenceArea,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { BoxPlotData } from "@/types/dashboard";

interface TotalIncrementsChartProps {
    data: BoxPlotData[];
    onZoom?: (startMs: number, endMs: number) => void;
    domain?: [number, number];
    dataKey?: keyof BoxPlotData;
    valueLabel?: string;
}

interface CustomAnomalyDotProps {
    cx?: number;
    cy?: number;
    payload?: BoxPlotData & {
        is_anomaly?: boolean;
    };
}

const TotalIncrementsChartComponent = ({
    data,
    onZoom,
    domain,
    dataKey = "total_increments",
    valueLabel = "Increments",
}: TotalIncrementsChartProps) => {
    const [refAreaLeft, setRefAreaLeft] = useState<number | null>(null);
    const [refAreaRight, setRefAreaRight] = useState<number | null>(null);

    const handleZoom = () => {
        if (
            refAreaLeft === null ||
            refAreaRight === null ||
            refAreaLeft === refAreaRight
        ) {
            setRefAreaLeft(null);
            setRefAreaRight(null);
            return;
        }

        let startMs = refAreaLeft;
        let endMs = refAreaRight;

        if (startMs > endMs) {
            [startMs, endMs] = [endMs, startMs];
        }

        onZoom?.(startMs, endMs);
        setRefAreaLeft(null);
        setRefAreaRight(null);
    };

    // Compute chart-friendly fields: conf_lower, conf_upper, band, anomaly_point
    const chartData = useMemo(() => {
        return data.map((d) => {
            const mean = d.mean ?? null;
            const std = d.std ?? null;
            const conf_lower =
                mean !== null && std !== null ? mean - std : null;
            const conf_upper =
                mean !== null && std !== null ? mean + std : null;
            const band =
                conf_lower !== null && conf_upper !== null
                    ? conf_upper - conf_lower
                    : 0;
            const val = d[dataKey] as number;
            return {
                ...d,
                conf_lower,
                conf_upper,
                band,
                anomaly_point: d.is_anomaly ? val : null,
            };
        });
    }, [data, dataKey]);

    const CustomAnomalyDot = (props: CustomAnomalyDotProps) => {
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
        <div className="w-full h-[400px] select-none">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                    onMouseDown={(e) =>
                        e?.activeLabel && setRefAreaLeft(Number(e.activeLabel))
                    }
                    onMouseMove={(e) => {
                        if (refAreaLeft !== null && e?.activeLabel) {
                            const newRight = Number(e.activeLabel);
                            if (newRight !== refAreaRight) {
                                setRefAreaRight(newRight);
                            }
                        }
                    }}
                    onMouseUp={handleZoom}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                    />
                    <XAxis
                        dataKey="timestampMs"
                        type="number"
                        domain={domain || ["dataMin", "dataMax"]}
                        allowDataOverflow={true}
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

                                const val = item[dataKey] as number;

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
                                                    {valueLabel}
                                                </span>
                                                <div className="font-bold">
                                                    {val}
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
                                            {item.avg_ttl !== undefined && (
                                                <div>
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Avg TTL
                                                    </span>
                                                    <div className="font-bold">
                                                        {item.avg_ttl}
                                                    </div>
                                                </div>
                                            )}
                                            {item.next_power_of_2 !== undefined && (
                                                <div>
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Next Power of 2
                                                    </span>
                                                    <div className="font-bold">
                                                        {item.next_power_of_2}
                                                    </div>
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
                        fillOpacity={0.33}
                        stackId="1"
                    />

                    {/* Main line */}
                    <Line
                        type="monotone"
                        dataKey={dataKey}
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
                    {refAreaLeft !== null && refAreaRight !== null && (
                        <ReferenceArea
                            x1={refAreaLeft}
                            x2={refAreaRight}
                            strokeOpacity={0.4}
                            fill="#8884d8"
                            fillOpacity={0.5}
                        />
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export const TotalIncrementsChart = memo(TotalIncrementsChartComponent);
