/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import React from 'react';
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

interface LimitInputProps {
    value: string;
    onChange: (value: string) => void;
}

export function LimitInput({ value, onChange }: LimitInputProps) {
    return (
        <div className="flex items-center gap-2">
            <Label htmlFor="limit-input" className="whitespace-nowrap">
                Limit
            </Label>
            <Input
                id="limit-input"
                type="number"
                min="1"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-18"
            />
        </div>
    );
}
