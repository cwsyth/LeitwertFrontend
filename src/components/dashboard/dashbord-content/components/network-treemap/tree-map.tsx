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
import {ArrowLeft, Globe, Network} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {CircleFlag} from "react-circle-flags";

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
    const [isOthersDialogOpen, setIsOthersDialogOpen] = React.useState(false);
    const [othersSearchQuery, setOthersSearchQuery] = React.useState('');

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
            // Open dialog for "Others"
            if (id === 'others') {
                setIsOthersDialogOpen(true);
                return;
            }

            // Find original item
            const item = data.find(d => d.id === id);
            if (item && onItemClick) {
                onItemClick(item);
            }
        };

        return (
            <g
                onClick={handleClick}
                style={{cursor: 'pointer'}}
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
                <h1 className="text-l font-semibold">{title}</h1>
                {onBackClick && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onBackClick}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        Back
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

            <Dialog open={isOthersDialogOpen} onOpenChange={setIsOthersDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {title.includes('Autonomous Systems') ? (
                                <>
                                    <Network className="h-5 w-5 text-muted-foreground"/>
                                    Other Autonomous Systems
                                </>
                            ) : (
                                <>
                                    <Globe className="h-5 w-5 text-muted-foreground"/>
                                    Other Countries
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Search input */}
                    <div className="px-1">
                        <Input
                            type="text"
                            placeholder={title.includes('Autonomous Systems') ? 'Search AS networks...' : 'Search countries...'}
                            value={othersSearchQuery}
                            onChange={(e) => setOthersSearchQuery(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <div className="overflow-y-auto max-h-[60vh] pr-2">
                        {others && (() => {
                            const filteredItems = others.items.filter(item => {
                                const searchLower = othersSearchQuery.toLowerCase();
                                return item.name.toLowerCase().includes(searchLower) ||
                                    item.id.toLowerCase().includes(searchLower);
                            });

                            return filteredItems.length > 0 ? (
                                <ul className="space-y-2">
                                    {filteredItems.map(item => (
                                        <li
                                            key={item.id}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded hover:bg-muted cursor-pointer"
                                            onClick={() => {
                                                if (onItemClick) {
                                                    const clickedItem: TreeMapDataItem = {
                                                        id: item.id,
                                                        name: item.name,
                                                        value: 0,
                                                        status: 'unknown' as NetworkStatus,
                                                        anomalyCount: 0,
                                                        metadata: title.includes('Autonomous Systems')
                                                            ? {
                                                                asNumber: parseInt(item.id),
                                                                ipCount: 0
                                                            }
                                                            : {
                                                                asCount: 0,
                                                                ipCount: 0
                                                            }
                                                    };
                                                    onItemClick(clickedItem);
                                                    setIsOthersDialogOpen(false);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                {!title.includes('Autonomous Systems') && (
                                                    <div className="flex items-center justify-center w-4 h-4">
                                                        <CircleFlag countryCode={item.id.toLowerCase()} height={16} />
                                                    </div>
                                                )}
                                                <span>
                                                    {title.includes('Autonomous Systems')
                                                        ? `${item.name} (${item.id})`
                                                        : item.name
                                                    }
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No results found
                                </p>
                            );
                        })()}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
