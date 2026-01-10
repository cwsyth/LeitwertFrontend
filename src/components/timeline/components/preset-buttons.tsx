/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {Button} from "@/components/ui/button";
import {TimeRangePreset} from "@/types/time-range";
import {PRESET_BUTTONS} from "@/components/timeline/timeline-constants";

interface PresetButtonsProps {
    currentPreset: TimeRangePreset | null;
    onPresetClick: (preset: TimeRangePreset) => void;
}

export function PresetButtons({
                                  currentPreset,
                                  onPresetClick
                              }: PresetButtonsProps) {
    return (
        <>
            {PRESET_BUTTONS.map(({preset, label}) => (
                <Button
                    key={preset}
                    variant={currentPreset === preset ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPresetClick(preset)}
                >
                    {label}
                </Button>
            ))}
        </>
    );
}
