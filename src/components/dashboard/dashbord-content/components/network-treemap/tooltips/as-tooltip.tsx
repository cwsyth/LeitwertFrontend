/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import React from 'react';
import {AlertTriangle, Globe} from "lucide-react";
import {TreeMapDataItem} from '@/types/network';
import {STATUS_COLOR_CLASSES} from "@/lib/anomaly-status";

interface AsTooltipProps {
    data: TreeMapDataItem;
}

export function AsTooltip({data}: AsTooltipProps) {
    const statusColor = STATUS_COLOR_CLASSES[data.status];

    return (
        <div className="space-y-3">
            <div className="border-b pb-2">
                <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-bold text-base">{data.name}</p>
                    <span
                        className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColor}`}>
            {data.status}
          </span>
                </div>
                {data.metadata && 'asNumber' in data.metadata && (
                    <p className="text-xs text-muted-foreground">
                        AS{data.metadata.asNumber}
                    </p>
                )}
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-blue-500"/>
                    <span className="text-muted-foreground">IP Count:</span>
                    <span className="font-semibold ml-auto">
            {data.metadata && 'ipCount' in data.metadata
                ? data.metadata.ipCount.toLocaleString()
                : 'N/A'}
          </span>
                </div>

                {data.anomalyCount !== undefined && (
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500"/>
                        <span
                            className="text-muted-foreground">Anomalies:</span>
                        <span className="font-semibold ml-auto">
              {data.anomalyCount.toLocaleString()}
            </span>
                    </div>
                )}
            </div>
        </div>
    );
}
