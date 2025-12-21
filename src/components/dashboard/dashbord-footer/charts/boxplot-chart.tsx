"use client";

// Inspired from: https://recharts.github.io/en-US/storybook/

import {
    Bar,
    BarChart,
    CartesianGrid,
    ReferenceArea,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { memo, useState } from "react";
import { BoxPlotData } from "@/types/dashboard";
import { useRuntimeConfig } from "@/lib/useRuntimeConfig";

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: BoxPlotData;
    }>;
}

interface CustomBoxPlotProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    payload?: BoxPlotData;
}

const CustomBoxPlot = (props: CustomBoxPlotProps) => {
    const { x, y, width, height, payload } = props;

    if (
        x === undefined ||
        y === undefined ||
        width === undefined ||
        height === undefined ||
        !payload
    ) {
        return null;
    }

    // The Bar component is configured to span from p01 to p099.
    // y is the top pixel position (corresponding to p099)
    // y + height is the bottom pixel position (corresponding to p01)

    const minVal = payload.p01;
    const maxVal = payload.p099;
    const valueRange = maxVal - minVal;

    const getPixelY = (val: number) => {
        if (valueRange === 0) return y + height / 2;
        // Interpolate:
        // val = maxVal -> percentage = 0 -> returns y
        // val = minVal -> percentage = 1 -> returns y + height
        const percentage = (maxVal - val) / valueRange;
        return y + percentage * height;
    };

    // For boxplot, only those values are necessary
    const y01 = getPixelY(payload.p01);
    const y25 = getPixelY(payload.p25);
    const y50 = getPixelY(payload.p50);
    const y75 = getPixelY(payload.p075);
    const y99 = getPixelY(payload.p099);

    const center = x + width / 2;
    const boxWidth = Math.min(width * 0.6, 40); // Limit max width

    const strokeColor = "#2563eb"; // tailwind blue-600
    const fillColor = "#93c5fd"; // tailwind blue-300

    return (
        <g>
            {/* Vertical line (Whisker) from min to max */}
            <line
                x1={center}
                y1={y01}
                x2={center}
                y2={y99}
                stroke={strokeColor}
                strokeWidth={2}
            />

            {/* Box from Q1 to Q3 */}
            <rect
                x={center - boxWidth / 2}
                y={y75}
                width={boxWidth}
                height={Math.abs(y25 - y75)}
                stroke={strokeColor}
                fill={fillColor}
                fillOpacity={0.6}
            />

            {/* Median line */}
            <line
                x1={center - boxWidth / 2}
                y1={y50}
                x2={center + boxWidth / 2}
                y2={y50}
                stroke={strokeColor}
                strokeWidth={2}
            />

            {/* Top Whisker cap (Max) */}
            <line
                x1={center - boxWidth / 4}
                y1={y99}
                x2={center + boxWidth / 4}
                y2={y99}
                stroke={strokeColor}
                strokeWidth={2}
            />

            {/* Bottom Whisker cap (Min) */}
            <line
                x1={center - boxWidth / 4}
                y1={y01}
                x2={center + boxWidth / 4}
                y2={y01}
                stroke={strokeColor}
                strokeWidth={2}
            />
        </g>
    );
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    const runtimeConfig = useRuntimeConfig();
    if (active && payload && payload.length) {
        const data = payload[0].payload as BoxPlotData;
        return (
            <div className="bg-background border rounded-lg p-3 shadow-lg text-sm">
                <p className="font-medium mb-2">
                    {new Date(data.timestamp).toLocaleString(runtimeConfig.locale, {timeZone: runtimeConfig.timezone})}
                </p>
                <div className="space-y-1">
                    <p className="text-muted-foreground">
                        Max (p99):{" "}
                        <span className="font-mono text-foreground">
                            {data.p099}
                        </span>
                    </p>
                    <p className="text-muted-foreground">
                        Q3 (p75):{" "}
                        <span className="font-mono text-foreground">
                            {data.p075}
                        </span>
                    </p>
                    <p className="text-muted-foreground font-bold">
                        Median:{" "}
                        <span className="font-mono text-foreground">
                            {data.p50}
                        </span>
                    </p>
                    <p className="text-muted-foreground">
                        Q1 (p25):{" "}
                        <span className="font-mono text-foreground">
                            {data.p25}
                        </span>
                    </p>
                    <p className="text-muted-foreground">
                        Min (p01):{" "}
                        <span className="font-mono text-foreground">
                            {data.p01}
                        </span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const BoxPlotChartComponent = ({
    data,
    onZoom,
    domain,
}: {
    data: BoxPlotData[];
    onZoom?: (startMs: number, endMs: number) => void;
    domain?: [number, number];
}) => {
    const [refAreaLeft, setRefAreaLeft] = useState<number | null>(null);
    const [refAreaRight, setRefAreaRight] = useState<number | null>(null);
    const runtimeConfig = useRuntimeConfig();

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

    return (
        <div className="w-full h-[400px] select-none">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                    onMouseDown={(e) =>
                        e?.activeLabel &&
                        setRefAreaLeft(Number(e.activeLabel))
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="timestampMs"
                        type="number"
                        domain={domain || ["dataMin", "dataMax"]}
                        allowDataOverflow={true}
                        tickFormatter={(value) =>
                            new Date(value).toLocaleDateString(runtimeConfig.locale, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: runtimeConfig.timezone,
                            })
                        }
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} width={50} />
                    <Tooltip
                        content={<CustomTooltip />}
                        isAnimationActive={true}
                    />
                    {/* Using Bar with custom shape, passing array [min, max] to dataKey */}
                    <Bar
                        dataKey={(entry: BoxPlotData) => [
                            entry.p01,
                            entry.p099,
                        ]}
                        shape={<CustomBoxPlot />}
                        isAnimationActive={true}
                        animationDuration={500}
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
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const BoxPlotChart = memo(BoxPlotChartComponent);
