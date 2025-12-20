'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusCardProps } from '@/types/card';
import { AlertCircle } from "lucide-react";
import { useTimeRangeStore } from "@/lib/stores/time-range-store";
import { API_BASE_URL } from "@/lib/config";
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface TimeSeriesAnomalyResponse {
    anomalies: number[];
    timestamps: string[];
}

interface AnomalyData {
    current: number;
    previous: number | null;
    trend: 'increasing' | 'decreasing' | 'stable'
}

export function AnomalyCard({ title, description, apiEndpoint, className, selectedCountry }: StatusCardProps) {
    const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesAnomalyResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    const timeRange = useTimeRangeStore((state) => state.timeRange);
    const playbackPosition = useTimeRangeStore((state) => state.playbackPosition);

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

                const url = `${API_BASE_URL}${apiEndpoint}?${params.toString()}`;

                const response = await fetch(url);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch anomaly data: ${response.status} ${errorText}`);
                }

                const result: TimeSeriesAnomalyResponse = await response.json();
                setTimeSeriesData(result);
            } catch (err) {
                console.error('Error fetching anomaly data:', err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatus();
    }, [apiEndpoint, selectedCountry, timeRange]);

    const getCurrentIndex = (): number => {
        // No data available
        if (!timeSeriesData || timeSeriesData.timestamps.length === 0) {
            return 0;
        }

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

    const getCurrentAnomalyData = (): AnomalyData | null => {
        if (!timeSeriesData || timeSeriesData.anomalies.length === 0) return null;

        const index = getCurrentIndex();
        const current = timeSeriesData.anomalies[index];
        const previous = index > 0 ? timeSeriesData.anomalies[index - 1] : null;

        let trend: 'increasing' | 'decreasing' | 'stable'
        if (previous === null) {
            trend = 'stable';
        } else if (current > previous) {
            trend = 'increasing';
        } else if (current < previous) {
            trend = 'decreasing';
        } else {
            trend = 'stable';
        }

        return { current, previous, trend };
    };

    const getChartData = () => {
        if (!timeSeriesData || timeSeriesData.anomalies.length === 0) return [];

        return timeSeriesData.anomalies.map((value, index) => ({
            value,
            timestamp: timeSeriesData.timestamps[index]
        }));
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

    const anomalyData = getCurrentAnomalyData();
    const chartData = getChartData();

    return (
        <Card className={`${className} flex-1 relative overflow-hidden`}>
            <CardHeader>
                <CardTitle>
                    {title}
                    {description && (
                        <span className="text-xs text-muted-foreground ml-2">{description}</span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 relative">
                {/* Background chart */}
                {!isLoading && !error && chartData.length > 0 && (
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#8884d8"
                                    fill="#8884d8"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Foreground content */}
                <div className="relative z-10">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Skeleton className="h-20 w-32" />
                        </div>
                    ) : error ? (
                        <div className="w-full flex items-center justify-center gap-1.5 text-xs text-destructive py-4">
                            <AlertCircle className="h-3 w-3" />
                            <span>Fehler beim Datenabruf!</span>
                        </div>
                    ) : anomalyData ? (
                        <div className="flex items-center justify-center gap-3 py-4">
                            <div className="text-center">
                                <div className="text-5xl font-bold leading-none">
                                    {anomalyData.current.toLocaleString('de-DE')}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">Anomalien</div>
                            </div>
                            <div className="text-4xl">
                                <TrendIcon trend={anomalyData.trend} />
                            </div>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}
