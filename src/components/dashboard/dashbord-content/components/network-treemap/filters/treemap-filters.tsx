/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import React from 'react';
import {AsSizeMetric, CountrySizeMetric} from "@/types/network";
import {
    LimitInput
} from "@/components/dashboard/dashbord-content/components/network-treemap/filters/limit-input";
import {
    LabelToggle
} from "@/components/dashboard/dashbord-content/components/network-treemap/filters/label-toggle";
import {
    GradientToggle
} from "@/components/dashboard/dashbord-content/components/network-treemap/filters/gradient-toggle";
import {
    MetricSelector
} from "@/components/dashboard/dashbord-content/components/network-treemap/filters/metric-selector";
import {ThresholdSettings} from "@/components/network/threshold-settings";

interface StatusThresholds {
    healthy: { min: number; max: number };
    warning: { min: number; max: number };
    critical: { min: number; max: number };
}

interface TreeMapFiltersProps {
    // Limit
    limitValue: string;
    onLimitChange: (value: string) => void;

    // Toggles
    showLabels: boolean;
    onShowLabelsChange: (value: boolean) => void;
    useGradient: boolean;
    onUseGradientChange: (value: boolean) => void;

    // Metrics
    isCountryView: boolean;
    countryMetric?: CountrySizeMetric;
    asMetric?: AsSizeMetric;
    onCountryMetricChange?: (metric: CountrySizeMetric) => void;
    onAsMetricChange?: (metric: AsSizeMetric) => void;
}

export function TreeMapFilters({
                                   limitValue,
                                   onLimitChange,
                                   showLabels,
                                   onShowLabelsChange,
                                   useGradient,
                                   onUseGradientChange,
                                   isCountryView,
                                   countryMetric,
                                   asMetric,
                                   onCountryMetricChange,
                                   onAsMetricChange,
                               }: TreeMapFiltersProps) {
    return (
        <div className="mb-6 p-4 border rounded-lg bg-card">
            <div className="flex flex-wrap items-center gap-6">
                <LimitInput value={limitValue} onChange={onLimitChange} />

                <LabelToggle checked={showLabels} onChange={onShowLabelsChange} />

                <GradientToggle checked={useGradient} onChange={onUseGradientChange} />

                <MetricSelector
                    isCountryView={isCountryView}
                    countryMetric={countryMetric}
                    asMetric={asMetric}
                    onCountryMetricChange={onCountryMetricChange}
                    onAsMetricChange={onAsMetricChange}
                />
            </div>
        </div>
    );
}
