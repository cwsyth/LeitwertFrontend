/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import React from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings2 } from "lucide-react";

interface StatusThresholds {
    healthy: { min: number; max: number };
    warning: { min: number; max: number };
    critical: { min: number; max: number };
}

interface ThresholdSettingsProps {
    thresholds: StatusThresholds;
    onChange: (thresholds: StatusThresholds) => void;
}

export function ThresholdSettings({ thresholds, onChange }: ThresholdSettingsProps) {
    const handleChange = (status: 'healthy' | 'warning' | 'critical', field: 'min' | 'max', value: string) => {
        const numValue = value === '' ? 0 : Math.min(Math.max(parseInt(value) || 0, 0), 999);
        onChange({
            ...thresholds,
            [status]: { ...thresholds[status], [field]: numValue }
        });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Settings2 className="h-4 w-4" />
                    Schwellwerte
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-3">
                <div className="space-y-3">
                    <h4 className="font-medium text-sm whitespace-nowrap">Status-Schwellwerte</h4>

                    {/* Healthy */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-green-600 font-semibold whitespace-nowrap">Healthy</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                type="number"
                                min={0}
                                max={999}
                                value={thresholds.healthy.min}
                                onChange={(e) => handleChange('healthy', 'min', e.target.value)}
                                className="h-8 w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-sm text-muted-foreground">bis</span>
                            <Input
                                type="number"
                                min={0}
                                max={999}
                                value={thresholds.healthy.max}
                                onChange={(e) => handleChange('healthy', 'max', e.target.value)}
                                className="h-8 w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-amber-600 font-semibold whitespace-nowrap">Warning</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                type="number"
                                min={0}
                                max={999}
                                value={thresholds.warning.min}
                                onChange={(e) => handleChange('warning', 'min', e.target.value)}
                                className="h-8 w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-sm text-muted-foreground">bis</span>
                            <Input
                                type="number"
                                min={0}
                                max={999}
                                value={thresholds.warning.max}
                                onChange={(e) => handleChange('warning', 'max', e.target.value)}
                                className="h-8 w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                    </div>

                    {/* Critical */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-red-600 font-semibold whitespace-nowrap">Critical</Label>
                        <div className="flex gap-2 items-center">
                            <span className="text-sm text-muted-foreground">ab</span>
                            <Input
                                type="number"
                                min={0}
                                max={999}
                                value={thresholds.critical.min}
                                onChange={(e) => handleChange('critical', 'min', e.target.value)}
                                className="h-8 w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
