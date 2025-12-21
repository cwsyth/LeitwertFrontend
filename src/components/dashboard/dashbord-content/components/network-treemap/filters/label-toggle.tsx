/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import React from 'react';
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";

interface LabelToggleProps {
    checked: boolean;
    onChange: (value: boolean) => void;
}

export function LabelToggle({ checked, onChange }: LabelToggleProps) {
    return (
        <div className="flex items-center gap-2">
            <Label htmlFor="show-labels" className="whitespace-nowrap">
                Labels
            </Label>
            <Switch
                id="show-labels"
                checked={checked}
                onCheckedChange={onChange}
            />
        </div>
    );
}
