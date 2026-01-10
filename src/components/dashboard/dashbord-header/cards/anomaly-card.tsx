'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusCardProps } from '@/types/card';
import { AlertCircle } from "lucide-react";
import { useTimeRangeStore } from "@/lib/stores/time-range-store";
import { API_BASE_URL } from "@/lib/config";
import { Area, AreaChart } from 'recharts';
import { ChartContainer, ChartConfig } from '@/components/ui/chart';
import { useRuntimeConfig } from '@/lib/useRuntimeConfig';
import { useLocationStore } from '@/lib/stores/location-store';

interface TimeSeriesAnomalyResponse {
    anomalies: number[];
    timestamps: string[];
}

type Trend = 'increasing' | 'decreasing' | 'stable';

export default function AnomalyCard({ title, description, apiEndpoint, className, selectedCountry }: StatusCardProps) {
    const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesAnomalyResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentAnomaly, setCurrentAnomaly] = useState(0);
    const [trend, setTrend] = useState<Trend>('stable');

    const timeRange = useTimeRangeStore((state) => state.timeRange);
    const playbackPosition = useTimeRangeStore((state) => state.playbackPosition);
    const runtimeConfig = useRuntimeConfig();
    const location = useLocationStore((state) => state.selectedLocationId);

    useEffect(() => {
        const fetchStatus = async () => {
            setIsLoading(true);
            setError(false);

            try {
                const params = new URLSearchParams();
                params.append('from', timeRange.start.toISOString());
                params.append('to', timeRange.end.toISOString());

                if (selectedCountry && selectedCountry.code !== 'world') {
                    params.append('cc', selectedCountry.code);
                }

                if (location) {
                    params.append('location', location);
                }

                const url = `${API_BASE_URL}${apiEndpoint}?${params.toString()}`;

                const response = await fetch(url);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch anomaly data: ${response.status} ${errorText}`);
                }

                const result: TimeSeriesAnomalyResponse = await response.json();
                setTimeSeriesData(result);
                setCurrentAnomaly(0);
                setTrend('stable');
            } catch (err) {
                console.error('Error fetching anomaly data:', err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatus();
    }, [apiEndpoint, selectedCountry, timeRange, location]);

    const getCurrentIndex = (): number => {
        if (!timeSeriesData || timeSeriesData.timestamps.length === 0) return 0;
        if (!playbackPosition) return timeSeriesData.timestamps.length - 1;

        // Show latest value if no playback position is set
        if (!playbackPosition) {
            return timeSeriesData.timestamps.length - 1;
        }

        // Binary search for closest older or equal timestamp
        const playbackTime = playbackPosition.getTime();
        let left = 0;
        let right = timeSeriesData.timestamps.length - 1;
        let result = 0;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const midTime = new Date(timeSeriesData.timestamps[mid]).getTime();

            if (midTime <= playbackTime) {
                result = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return result;
    };

    useEffect(() => {
        if (!timeSeriesData) return;

        const index = getCurrentIndex();
        const newValue = timeSeriesData.anomalies[index];

        if (newValue !== currentAnomaly) {
            const newTrend: Trend = newValue > currentAnomaly ? 'increasing'
                : newValue < currentAnomaly ? 'decreasing'
                    : 'stable';

            setTrend(newTrend);
            setCurrentAnomaly(newValue);
        } else {
            setTrend('stable');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playbackPosition, timeSeriesData]);

    const getAggregatedChartData = () => {
        if (!timeSeriesData) return [];

        const dataLength = timeSeriesData.anomalies.length;
        const targetPoints = 30;

        if (dataLength <= targetPoints) {
            return timeSeriesData.anomalies.map((value, index) => ({
                value,
                timestamp: timeSeriesData.timestamps[index]
            }));
        }

        const step = Math.floor(dataLength / targetPoints);
        const aggregated: { value: number; timestamp: string }[] = [];

        for (let i = 0; i < dataLength; i += step) {
            const end = Math.min(i + step, dataLength);
            const chunk = timeSeriesData.anomalies.slice(i, end);
            const avg = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;

            aggregated.push({
                value: avg,
                timestamp: timeSeriesData.timestamps[i]
            });
        }

        return aggregated;
    };

    const TrendIcon = ({ trend }: { trend: 'increasing' | 'decreasing' | 'stable' }) => {
        if (trend === 'increasing') {
            return <span className="text-red-500">↗</span>;
        }
        if (trend === 'decreasing') {
            return <span className="text-green-500">↙</span>;
        }
        return <span className="text-muted-foreground">—</span>;
    };

    const chartData = getAggregatedChartData();

    const chartConfig = {
        value: {
            label: "Anomalies",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig;

    return (
        <Card className={`${className} h-full w-full gap-0`}>
            <CardHeader>
                <CardTitle>
                    <div>
                        {title}
                    </div>
                    <div>
                        {description && (
                            <span className="text-xs text-muted-foreground">{description}</span>
                        )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="relative">
                {/* Background chart */}
                {!isLoading && !error && chartData.length > 0 && (
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <AreaChart data={chartData}>
                                <Area
                                    type="basis"
                                    dataKey="value"
                                    fill="var(--color-value)"
                                    stroke="var(--color-value)"
                                    strokeWidth={2}
                                    fillOpacity={0.6}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </div>
                )}

                {/* Foreground content */}
                <div className="relative z-10">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-3">
                            <Skeleton className="h-16 w-24" />
                            <Skeleton className="h-12 w-12" />
                        </div>
                    ) : error ? (
                        <div className="w-full flex items-center justify-center gap-1.5 text-xs text-destructive py-2">
                            <AlertCircle className="h-3 w-3" />
                            <span>Fehler beim Datenabruf!</span>
                        </div>
                    ) : (
                        <div
                            className="flex items-center justify-center gap-3">
                            <div className="text-center">
                                <div
                                    className="text-5xl font-bold leading-none">
                                    {currentAnomaly.toLocaleString(runtimeConfig.locale)}
                                </div>
                                <div
                                    className="text-xs mt-1">Anomalies
                                </div>
                            </div>
                            <div
                                className="text-4xl w-12 flex items-center justify-center">
                                <TrendIcon trend={trend} />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
