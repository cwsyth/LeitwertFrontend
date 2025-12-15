'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusCardProps, StatusItem } from '@/types/card';
import { getStatusColor } from '@/lib/statusColors';
import { NetworkStatus } from '@/types/network';
import { AlertCircle } from "lucide-react";
import { useTimeRangeStore } from "@/lib/stores/time-range-store";
import { API_BASE_URL } from "@/lib/config";

interface TimeSeriesStatusResponse {
    count: number[];
    healthy: number[];
    warning: number[];
    critical: number[];
    unknown: number[];
    timestamps: string[];
}

interface StatusData {
    count: number;
    healthy: number;
    warning: number;
    critical: number;
    unknown: number;
}

export function StatusCard({ title, description, apiEndpoint, className, selectedCountry }: StatusCardProps) {
    const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesStatusResponse | null>(null);
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
                    throw new Error(`Failed to fetch status: ${response.status} ${errorText}`);
                }

                const result: TimeSeriesStatusResponse = await response.json();
                setTimeSeriesData(result);
            } catch (err) {
                console.error('Error fetching status data:', err);
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

    const getCurrentStatusData = (): StatusData | null => {
        if (!timeSeriesData) return null;

        const index = getCurrentIndex();

        return {
            count: timeSeriesData.count[index],
            healthy: timeSeriesData.healthy[index],
            warning: timeSeriesData.warning[index],
            critical: timeSeriesData.critical[index],
            unknown: timeSeriesData.unknown[index],
        };
    };

    const getStatusItems = (): StatusItem[] => {
        const data = getCurrentStatusData();
        if (!data) return [];

        return [
            { status: 'healthy' as NetworkStatus, count: data.healthy, label: 'Healthy' },
            { status: 'warning' as NetworkStatus, count: data.warning, label: 'Warning' },
            { status: 'critical' as NetworkStatus, count: data.critical, label: 'Critical' },
            { status: 'unknown' as NetworkStatus, count: data.unknown, label: 'Unknown' }
        ];
    };

    const statusItems = getStatusItems();
    const currentData = getCurrentStatusData();

    return (
        <Card className={`${className} flex-1`}>
            <CardHeader>
                <CardTitle>
                    {title}
                    {description && (
                        <span className="text-xs text-muted-foreground ml-2">{description}</span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 flex gap-3">
                {isLoading ? (
                    <>
                        <Skeleton className="h-16 w-20" />
                        <div className="flex flex-col gap-1 flex-1">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                        </div>
                    </>
                ) : error ? (
                    <div className="w-full flex items-center justify-center gap-1.5 text-xs text-destructive py-4">
                        <AlertCircle className="h-3 w-3" />
                        <span>Fehler beim Datenabruf!</span>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-center min-w-[80px]">
                            <div className="text-center">
                                <div className="text-3xl font-bold leading-none">
                                    {currentData?.count.toLocaleString('de-DE')}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Gesamt</div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 min-w-[120px] flex-1 justify-center">
                            {statusItems.map((item) => (
                                <Badge
                                    key={item.status}
                                    className="w-full justify-between px-2 py-1 text-[10px] font-medium border-0"
                                    style={{
                                        backgroundColor: getStatusColor(item.status),
                                        color: '#ffffff'
                                    }}
                                >
                                    <span>{item.label}</span>
                                    <span className="font-semibold">{item.count.toLocaleString('de-DE')}</span>
                                </Badge>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
