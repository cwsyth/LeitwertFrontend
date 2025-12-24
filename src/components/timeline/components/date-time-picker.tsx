/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {Calendar} from "@/components/ui/calendar";
import {Input} from "@/components/ui/input";
import {Clock} from "lucide-react";
import {enGB} from "date-fns/locale";
import {DateTimePickerProps} from "../timeline-types";

export function DateTimePicker({
                                   label,
                                   date,
                                   hour,
                                   minute,
                                   onDateChange,
                                   onHourChange,
                                   onMinuteChange,
                                   onHourBlur,
                                   onMinuteBlur,
                                   disabledDates,
                               }: DateTimePickerProps) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-medium">{label}</label>
            <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => selectedDate && onDateChange(selectedDate)}
                disabled={disabledDates}
                locale={enGB}
            />
            <div className="flex items-center gap-2 pt-2">
                <Clock className="h-4 w-4 text-muted-foreground"/>
                <Input
                    type="number"
                    min="0"
                    max="23"
                    value={hour}
                    onChange={(e) => onHourChange(e.target.value)}
                    onBlur={onHourBlur}
                    className="w-14 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="HH"
                />
                <span className="text-muted-foreground">:</span>
                <Input
                    type="number"
                    min="0"
                    max="59"
                    value={minute}
                    onChange={(e) => onMinuteChange(e.target.value)}
                    onBlur={onMinuteBlur}
                    className="w-14 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="MM"
                />
            </div>
        </div>
    );
}
