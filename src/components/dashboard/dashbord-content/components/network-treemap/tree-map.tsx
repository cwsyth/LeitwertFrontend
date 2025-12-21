/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import {ResponsiveContainer, Tooltip, Treemap} from 'recharts';
import {
    NetworkStatus,
    StatusThresholds,
    TreeMapDataItem,
    TreeMapProps
} from '@/types/network';
import {
    getGradientColor,
    getStatusColor,
    OTHERS_COLOR
} from '@/lib/statusColors';
import React from "react";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";

export function TreeMap({
                            data,
                            others,
                            title,
                            renderTooltip,
                            othersDisplaySize = 0.5,
                            onItemClick,
                            showLabels,
                            useGradient,
                            thresholds,
                            onBackClick,
                        }: TreeMapProps) {

    const minDataValue = data.length > 0 ? Math.min(...data.map(d => d.value)) : 0;
    const othersDisplayValue = Math.max(minDataValue * othersDisplaySize, 1);

    const treeMapData = [
        ...data,
        ...(others ? [{
            id: 'others',
            name: others.name,
            value: othersDisplayValue,
            status: 'healthy' as NetworkStatus,
            anomalyCount: others.totalAnomalyCount,
            metadata: {
                isOthers: true,
                actualValue: others.value,
                ...others
            }
        }] : [])
    ];

    // Recharts passes props dynamically at runtime
    interface CustomContentProps {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        name?: string;
        id?: string;
        status?: NetworkStatus;
        anomalyCount?: number;
    }

    const CustomizedContent = (props: CustomContentProps) => {
        const {x, y, width, height, name, id, status, anomalyCount} = props;

        if (x === undefined || y === undefined || width === undefined ||
            height === undefined || !name || !id) {
            return null;
        }

        let fillColor: string;

        if (id === 'others') {
            fillColor = OTHERS_COLOR;
        } else if (useGradient && thresholds && status && anomalyCount !== undefined && status in thresholds) {
            const range = thresholds[status as keyof StatusThresholds];
            fillColor = getGradientColor(status, anomalyCount, range.min, range.max);
        } else if (status) {
            fillColor = getStatusColor(status);
        } else {
            fillColor = getStatusColor('unknown' as NetworkStatus);
        }

        const handleClick = () => {
            // Nicht klickbar für "Others"
            if (id === 'others') return;

            // Finde das originale Item
            const item = data.find(d => d.id === id);
            if (item && onItemClick) {
                onItemClick(item);
            }
        };

        return (
            <g
                onClick={handleClick}
                style={{cursor: id === 'others' ? 'default' : 'pointer'}}
            >
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill: fillColor,
                        stroke: '#fff',
                        strokeWidth: 4,
                        strokeOpacity: 1,
                    }}
                />
                {showLabels && width > 50 && height > 30 && (() => {
                    const estimatedTextWidth = name.length * 8;
                    const textFitsWidth = estimatedTextWidth < width - 10; // 10px Padding

                    return textFitsWidth ? (
                        <text
                            x={x + width / 2}
                            y={y + height / 2}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={14}
                            style={{fontWeight: "lighter"}}
                        >
                            {name}
                        </text>
                    ) : null;
                })()}
            </g>
        );
    };

    interface TooltipProps {
        active?: boolean;
        payload?: Array<{
            payload: TreeMapDataItem;
        }>;
    }

    const CustomTooltip = ({active, payload}: TooltipProps) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border">
                    {renderTooltip(data)}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{title}</h1>
                {onBackClick && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onBackClick}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        Zurück
                    </Button>
                )}
            </div>

            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                        data={treeMapData}
                        dataKey="value"
                        stroke="#fff"
                        fill="#8884d8"
                        content={<CustomizedContent/>}
                        isAnimationActive={false}
                    >
                        <Tooltip content={<CustomTooltip/>}/>
                    </Treemap>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
