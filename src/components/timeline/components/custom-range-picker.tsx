/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {Button} from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {Calendar as CalendarIcon} from "lucide-react";
import {DateTimePicker} from "./date-time-picker";
import {PresetButtons} from "./preset-buttons";
import {CustomRangePickerProps} from "../timeline-types";
import {MAX_DATE, MIN_DATE} from "../timeline-constants";

export function CustomRangePicker({
                                      isOpen,
                                      onOpenChange,
                                      tempDateTime,
                                      onTempDateTimeChange,
                                      onTimeInput,
                                      onTimeBlur,
                                      onApply,
                                      onCancel,
                                      availableRangeLabel,
                                      onLoadAvailableRange,
                                      currentPreset,
                                      onPresetClick,
                                  }: CustomRangePickerProps) {
    return (
        <Popover open={isOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <CalendarIcon className="h-4 w-4"/>
                    Custom
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
                {/* Available Range Section */}
                {availableRangeLabel && onLoadAvailableRange && (
                    <div className="pb-4 border-b">
                        <label className="text-sm font-medium block mb-2">
                            Time Ranges with Available Data
                        </label>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onLoadAvailableRange}
                            className="text-xs"
                        >
                            {availableRangeLabel}
                        </Button>
                    </div>
                )}

                {/* Preset Buttons */}
                <div className="pb-4 border-b pt-4">
                    <label className="text-sm font-medium block mb-2">
                        Presets
                    </label>
                    <div className="flex gap-2">
                        <PresetButtons
                            currentPreset={currentPreset}
                            onPresetClick={onPresetClick}
                        />
                    </div>
                </div>

                {/* Date + Time Pickers */}
                <div className="flex gap-4 pt-4">
                    <DateTimePicker
                        label="From"
                        date={tempDateTime.startDate}
                        hour={tempDateTime.startHour}
                        minute={tempDateTime.startMinute}
                        onDateChange={(date) =>
                            onTempDateTimeChange({startDate: date})
                        }
                        onHourChange={(value) => onTimeInput(value, "startHour", 23)}
                        onMinuteChange={(value) => onTimeInput(value, "startMinute", 59)}
                        onHourBlur={() => onTimeBlur("startHour")}
                        onMinuteBlur={() => onTimeBlur("startMinute")}
                        disabledDates={(date) => date < MIN_DATE || date > MAX_DATE}
                    />

                    <DateTimePicker
                        label="To"
                        date={tempDateTime.endDate}
                        hour={tempDateTime.endHour}
                        minute={tempDateTime.endMinute}
                        onDateChange={(date) =>
                            onTempDateTimeChange({endDate: date})
                        }
                        onHourChange={(value) => onTimeInput(value, "endHour", 23)}
                        onMinuteChange={(value) => onTimeInput(value, "endMinute", 59)}
                        onHourBlur={() => onTimeBlur("endHour")}
                        onMinuteBlur={() => onTimeBlur("endMinute")}
                        disabledDates={(date) =>
                            date < tempDateTime.startDate || date > MAX_DATE
                        }
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button size="sm" onClick={onApply} className="flex-1">
                        Apply
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
