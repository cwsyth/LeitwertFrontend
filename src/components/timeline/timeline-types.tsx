/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

// Draft state for date/time picker - only committed to store on "Apply"
import {TimeRangePreset} from "@/types/time-range";

export interface TempDateTime {
    startDate: Date;
    endDate: Date;
    startHour: string;
    startMinute: string;
    endHour: string;
    endMinute: string;
}

export interface DateTimePickerProps {
    label: string;
    date: Date;
    hour: string;
    minute: string;
    onDateChange: (date: Date) => void;
    onHourChange: (value: string) => void;
    onMinuteChange: (value: string) => void;
    onHourBlur: () => void;
    onMinuteBlur: () => void;
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: (date: Date) => boolean;
}

export interface CustomRangePickerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    tempDateTime: TempDateTime;
    onTempDateTimeChange: (update: Partial<TempDateTime>) => void;
    onTimeInput: (value: string, field: keyof TempDateTime, max: number) => void;
    onTimeBlur: (field: keyof TempDateTime) => void;
    onApply: () => void;
    onCancel: () => void;
    availableRangeLabel?: string;
    onLoadAvailableRange?: () => void;
    currentPreset: TimeRangePreset | null;
    onPresetClick: (preset: TimeRangePreset) => void;
}
