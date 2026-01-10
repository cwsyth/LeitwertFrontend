/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import React from 'react';
import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    AS_SIZE_METRIC_LABELS,
    AsSizeMetric,
    COUNTRY_SIZE_METRIC_LABELS,
    CountrySizeMetric
} from "@/types/network";

interface MetricSelectorProps {
    isCountryView: boolean;
    countryMetric?: CountrySizeMetric;
    asMetric?: AsSizeMetric;
    onCountryMetricChange?: (metric: CountrySizeMetric) => void;
    onAsMetricChange?: (metric: AsSizeMetric) => void;
}

export function MetricSelector({
                                   isCountryView,
                                   countryMetric,
                                   asMetric,
                                   onCountryMetricChange,
                                   onAsMetricChange
                               }: MetricSelectorProps) {
    return (
        <div className="flex items-center gap-2">
            <Label htmlFor="size-metric" className="whitespace-nowrap">
                Size
            </Label>
            {isCountryView ? (
                <Select
                    value={countryMetric}
                    onValueChange={(value) => onCountryMetricChange?.(value as CountrySizeMetric)}
                >
                    <SelectTrigger id="size-metric" className="w-[140px]">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(COUNTRY_SIZE_METRIC_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <Select
                    value={asMetric}
                    onValueChange={(value) => onAsMetricChange?.(value as AsSizeMetric)}
                >
                    <SelectTrigger id="size-metric" className="w-[140px]">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(AS_SIZE_METRIC_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}
