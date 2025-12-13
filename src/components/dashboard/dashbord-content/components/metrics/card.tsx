/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface MetricData {
    value: string;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
}

interface MetricCardProps {
    name: string;
    apiEndpoint: string;
    formatter?: (data: any) => MetricData;
    icon: LucideIcon;
    iconColor?: string;
}

export default function MetricCard({
                                    name,
                                    apiEndpoint,
                                    formatter,
                                    icon: Icon,
                                    iconColor = "text-blue-500"
                                }: MetricCardProps) {
    const [data, setData] = useState<MetricData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(apiEndpoint);

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const rawData = await response.json();
                const formattedData = formatter ? formatter(rawData) : rawData;
                setData(formattedData);
                setError(null);
            } catch (err) {
                console.error(`Error fetching KPI data for ${name}:`, err);
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiEndpoint, name, formatter]);

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse">
                        <div className="flex items-start justify-between mb-2">
                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                            <Icon className="h-6 w-6 text-red-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-semibold text-red-500">
                        Error
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                        {name}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                    <div className={cn(
                        "p-2 rounded-lg bg-opacity-10 dark:bg-opacity-20",
                        iconColor.replace('text-', 'bg-')
                    )}>
                        <Icon className={cn("h-6 w-6", iconColor)} />
                    </div>
                    {data.change && (
                        <span
                            className={cn(
                                "text-sm font-medium",
                                data.changeType === "positive" && "text-emerald-600 dark:text-emerald-400",
                                data.changeType === "negative" && "text-red-600 dark:text-red-400",
                                data.changeType === "neutral" && "text-gray-600 dark:text-gray-400"
                            )}
                        >
                            {data.change}
                        </span>
                    )}
                </div>
                <div className="text-3xl font-semibold">
                    {data.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                    {name}
                </div>
            </CardContent>
        </Card>
    );
}
