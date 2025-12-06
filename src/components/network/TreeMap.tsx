/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import { ResponsiveContainer, Tooltip, Treemap } from 'recharts';
import {
    NetworkStatus,
    TreeMapDataItem,
    TreeMapOthersData, TreeMapProps
} from '@/types/network';
import { getStatusColor, OTHERS_COLOR } from '@/lib/statusColors';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import React, { ReactNode } from "react";

export function TreeMap({
                            data,
                            others,
                            title,
                            onStatusFilter,
                            currentStatus,
                            renderTooltip,
                            othersDisplaySize = 0.5,
                            onItemClick,
                            showLabels
                        }: TreeMapProps) {
    // Berechne den kleinsten Wert aus den Haupt-Daten
    const minDataValue = data.length > 0 ? Math.min(...data.map(d => d.value)) : 0;

    // "Others" bekommt einen Anteil des kleinsten Wertes
    const othersDisplayValue = minDataValue * othersDisplaySize;

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

    const CustomizedContent = (props: any) => {
        const { x, y, width, height, name, id, root } = props;

        const fillColor = id === 'others' ? OTHERS_COLOR : getStatusColor(props.status);

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
                style={{ cursor: id === 'others' ? 'default' : 'pointer' }} // ← Cursor ändern
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
                {showLabels && width > 50 && height > 30 && (
                    <text
                        x={x + width / 2}
                        y={y + height / 2}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={14}
                    >
                        {name}
                    </text>
                )}
            </g>
        );
    };

    const CustomTooltip = ({ active, payload }: any) => {
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
                <h2 className="text-2xl font-bold">{title}</h2>
                <Select value={currentStatus}
                        onValueChange={(value) => onStatusFilter(value as NetworkStatus | 'all')}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="healthy">Healthy</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                        data={treeMapData as any}
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