/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import React from 'react';
import {AlertTriangle, Building2, Globe} from "lucide-react";
import {TreeMapDataItem} from '@/types/network';
import {STATUS_COLOR_CLASSES} from "@/lib/anomaly-status";
import { useRuntimeConfig } from '@/lib/useRuntimeConfig';
import {CircleFlag} from "react-circle-flags";

interface CountryTooltipProps {
    data: TreeMapDataItem;
}

export function CountryTooltip({data}: CountryTooltipProps) {
    const statusColor = STATUS_COLOR_CLASSES[data.status];
    const runtimeConfig = useRuntimeConfig();

    return (
        <div className="space-y-3">
            <div
                className="flex items-center justify-between gap-3 border-b pb-2">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-5 h-5">
                        <CircleFlag countryCode={data.id.toLowerCase()} height={20} />
                    </div>
                    <p className="font-bold text-base">{data.name}</p>
                </div>
                <span
                    className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColor}`}>
                    {data.status}
                </span>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground"/>
                    <span className="text-muted-foreground">AS Count:</span>
                    <span className="font-semibold ml-auto">
            {data.metadata && 'asCount' in data.metadata
                ? data.metadata.asCount.toLocaleString(runtimeConfig.locale)
                : 'N/A'}
          </span>
                </div>

                {data.anomalyCount !== undefined && (
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500"/>
                        <span
                            className="text-muted-foreground">Anomalies:</span>
                        <span className="font-semibold ml-auto">
              {data.anomalyCount.toLocaleString(runtimeConfig.locale)}
            </span>
                    </div>
                )}

                {data.metadata && 'ipCount' in data.metadata && (
                    <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-blue-500"/>
                        <span className="text-muted-foreground">IP Count:</span>
                        <span className="font-semibold ml-auto">
              {data.metadata.ipCount.toLocaleString(runtimeConfig.locale)}
            </span>
                    </div>
                )}
            </div>
        </div>
    );
}
