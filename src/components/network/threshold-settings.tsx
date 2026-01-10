/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import React, {useState} from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Settings2} from "lucide-react";
import {Slider} from "@/components/ui/slider";

interface StatusThresholds {
    healthy: { min: number; max: number };
    warning: { min: number; max: number };
    critical: { min: number; max: number };
}

interface ThresholdSettingsProps {
    thresholds: StatusThresholds;
    onChange: (thresholds: StatusThresholds) => void;
}

export function ThresholdSettings({
                                      thresholds,
                                      onChange
                                  }: ThresholdSettingsProps) {
    const [localThresholds, setLocalThresholds] = useState(thresholds);
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (open) {
            // Reset to current values when opening
            setLocalThresholds(thresholds);
        } else {
            // Apply changes when closing
            onChange(localThresholds);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Settings2 className="h-4 w-4"/>
                    Thresholds
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
                <div className="space-y-3">
                    <h4 className="font-medium text-sm whitespace-nowrap">Status Thresholds</h4>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            {/* Value labels */}
                            <div className="grid grid-cols-3 gap-4 text-xs font-medium">
                                <span className="text-green-600 text-left">
                                    Healthy: {localThresholds.healthy.min === localThresholds.healthy.max
                                    ? localThresholds.healthy.max
                                    : `${localThresholds.healthy.min}-${localThresholds.healthy.max}`}
                                </span>
                                <span className="text-amber-600 text-center">
                                    Warning: {localThresholds.warning.min === localThresholds.warning.max
                                    ? localThresholds.warning.max
                                    : `${localThresholds.warning.min}-${localThresholds.warning.max}`}
                                </span>
                                <span className="text-red-600 text-right">Critical: {localThresholds.critical.min}+</span>
                            </div>

                            {/* Colored track background */}
                            <div className="relative w-full pt-6 pb-2">
                                <div className="absolute top-6 left-0 right-0 h-2.5 flex rounded-lg overflow-hidden">
                                    <div
                                        className="bg-green-500 transition-all"
                                        style={{ width: `${(localThresholds.healthy.max / 20) * 100}%` }}
                                    />
                                    <div
                                        className="bg-amber-500 transition-all"
                                        style={{ width: `${((localThresholds.warning.max - localThresholds.healthy.max) / 20) * 100}%` }}
                                    />
                                    <div
                                        className="bg-red-500 transition-all"
                                        style={{ width: `${((20 - localThresholds.warning.max) / 20) * 100}%` }}
                                    />
                                </div>

                                {/* Slider - transparent track, only handles visible */}
                                <Slider
                                    min={0}
                                    max={20}
                                    step={1}
                                    value={[
                                        localThresholds.healthy.max,
                                        localThresholds.warning.max
                                    ]}
                                    onValueChange={(value) => {
                                        setLocalThresholds({
                                            healthy: { min: 0, max: value[0] },
                                            warning: { min: value[0] + 1, max: value[1] },
                                            critical: { min: value[1] + 1, max: Infinity }
                                        });
                                    }}
                                    className="relative z-10 [&>span:first-child]:bg-transparent [&>span:first-child>span]:bg-transparent [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-gray-800"
                                />
                            </div>

                            {/* Scale labels */}
                            <div className="flex justify-between text-xs text-muted-foreground px-1">
                                <span>0</span>
                                <span>5</span>
                                <span>10</span>
                                <span>15</span>
                                <span>20</span>
                            </div>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
