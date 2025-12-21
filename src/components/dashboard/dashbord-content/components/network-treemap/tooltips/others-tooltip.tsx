/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import React from 'react';
import {AlertTriangle, Building2, Globe, Hash, Network} from "lucide-react";
import {OthersMetadata} from '@/types/network';
import { useRuntimeConfig } from '@/lib/useRuntimeConfig';

interface OthersTooltipProps {
    data: OthersMetadata;
    type: 'country' | 'as';
}

const runtimeConfig = useRuntimeConfig();

export function OthersTooltip({data, type}: OthersTooltipProps) {
    const isCountry = type === 'country';

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 border-b pb-2">
                {isCountry ? (
                    <Globe className="h-4 w-4 text-muted-foreground"/>
                ) : (
                    <Network className="h-4 w-4 text-muted-foreground"/>
                )}
                <p className="font-bold text-base">
                    {isCountry ? 'Other Countries' : 'Other AS Networks'}
                </p>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    {isCountry ? (
                        <Building2
                            className="h-3.5 w-3.5 text-muted-foreground"/>
                    ) : (
                        <Hash className="h-3.5 w-3.5 text-muted-foreground"/>
                    )}
                    <span className="text-muted-foreground">
            {isCountry ? 'Countries:' : 'AS Count:'}
          </span>
                    <span className="font-semibold ml-auto">
            {data.count.toLocaleString(runtimeConfig.locale)}
          </span>
                </div>
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500"/>
                    <span
                        className="text-muted-foreground">Total Anomalies:</span>
                    <span className="font-semibold ml-auto">
            {data.totalAnomalyCount.toLocaleString(runtimeConfig.locale)}
          </span>
                </div>
            </div>

            <div className="mt-3 pt-2 border-t max-h-40 overflow-y-auto">
                <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                    {isCountry ? 'Included Countries' : 'Included AS Networks'}
                </p>
                <ul className="text-sm space-y-1">
                    {data.items.map(item => (
                        <li key={item.id} className="text-muted-foreground">
                            {isCountry ? item.name : `${item.name} (${item.id})`}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
