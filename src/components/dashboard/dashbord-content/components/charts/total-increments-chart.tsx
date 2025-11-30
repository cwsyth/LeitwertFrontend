"use client";

import { memo } from "react";
import {
    Line,
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
    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
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
                                return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                    Time
                                                </span>
                                                <span className="font-bold text-muted-foreground">
                                                    {new Date(
                                                        label || 0
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                    Increments
                                                </span>
                                                <span className="font-bold">
                                                    {payload[0].value}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="total_increments"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export const TotalIncrementsChart = memo(TotalIncrementsChartComponent);
