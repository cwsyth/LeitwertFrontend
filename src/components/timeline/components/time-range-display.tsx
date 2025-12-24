/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {useState} from "react";
import {format} from "date-fns";
import {enGB} from "date-fns/locale";
import {Badge} from "@/components/ui/badge";
import {Slider} from "@/components/ui/slider";

const SLIDER_CONTAINER_WIDTH = "300px";

interface TimeRangeDisplayProps {
    startTime: Date;
    endTime: Date;
    currentPosition: Date | null;
    sliderValue: number;
    onSliderChange: (value: number[]) => void;
}

export function TimeRangeDisplay({
                                     startTime,
                                     endTime,
                                     currentPosition,
                                     sliderValue,
                                     onSliderChange,
                                 }: TimeRangeDisplayProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="flex items-center gap-2"
             style={{width: SLIDER_CONTAINER_WIDTH}}>
            <Badge variant="secondary"
                   className="gap-1.5 px-2 py-1 font-semibold">
                {format(startTime, "dd.MM HH:mm", {locale: enGB})} Uhr
            </Badge>

            <div className="flex-1 flex flex-col items-center relative">
                <Slider
                    value={[sliderValue]}
                    onValueChange={onSliderChange}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&>span:first-child]:bg-gray-600 [&>span>span]:bg-transparent"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                />
                {showTooltip && currentPosition && (
                    <div
                        className="absolute -top-8 bg-popover text-popover-foreground px-3 py-1 rounded-md text-xs shadow-md pointer-events-none whitespace-nowrap min-w-fit"
                        style={{
                            left: `${sliderValue}%`,
                            transform: "translateX(-50%)",
                        }}
                    >
                        {format(currentPosition, "dd.MM HH:mm", {locale: enGB})}
                    </div>
                )}
            </div>

            <Badge variant="secondary"
                   className="gap-1.5 px-2 py-1 font-semibold">
                {format(endTime, "dd.MM HH:mm", {locale: enGB})} Uhr
            </Badge>
        </div>
    );
}
