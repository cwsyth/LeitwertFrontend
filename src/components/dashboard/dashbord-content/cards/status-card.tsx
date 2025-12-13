'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusCardProps, StatusResponse, StatusItem } from '@/types/card';
import { getStatusColor } from '@/lib/statusColors';
import { NetworkStatus } from '@/types/network';
import {AlertCircle} from "lucide-react";

export function StatusCard({ title, apiEndpoint, className, selectedCountry }: StatusCardProps) {
    const [data, setData] = useState<StatusResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            setIsLoading(true);
            setError(false);

            try {
                const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_API_URL || '';
                const url = selectedCountry && selectedCountry.code !== 'world'
                    ? `${baseUrl}${apiEndpoint}?cc=${selectedCountry.code}`
                    : `${baseUrl}${apiEndpoint}`;

                const response = await fetch(url);
                if (!response.ok) throw new Error();
                const result: StatusResponse = await response.json();
                setData(result);
            } catch {
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatus();
    }, [apiEndpoint, selectedCountry]);

    const getStatusItems = (): StatusItem[] => {
        if (!data) return [];
        return [
            { status: 'healthy' as NetworkStatus, count: data.healthy, label: 'Gesund' },
            { status: 'warning' as NetworkStatus, count: data.warning, label: 'Warnung' },
            { status: 'critical' as NetworkStatus, count: data.critical, label: 'Kritisch' },
            { status: 'unknown' as NetworkStatus, count: data.unknown, label: 'Unbekannt' }
        ].filter(item => item.count > 0);
    };

    const statusItems = getStatusItems();

    return (
        <Card className={`${className} min-w-[240px]`}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 flex gap-3">
                {isLoading ? (
                    <>
                        <Skeleton className="h-16 w-20" />
                        <div className="flex flex-col gap-1 flex-1">
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
                                <div className="text-3xl font-bold leading-none">{data?.count.toLocaleString('de-DE')}</div>
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
