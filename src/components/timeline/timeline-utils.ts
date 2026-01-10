/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {format} from "date-fns";
import {enUS} from "date-fns/locale";
import {AvailableTimeRange, WindowConfig} from "@/types/time-range"; // oder @/types/api

// Determines allowed window sizes based on time range duration
export function getWindowConfig(durationHours: number): WindowConfig {
    const durationDays = durationHours / 24;

    if (durationHours <= 24) {
        return {
            allowedSizes: ["small", "medium"],
            defaultSize: "small",
            disabledSizes: ["large"],
        };
    } else if (durationDays <= 14) {
        return {
            allowedSizes: ["medium", "large"],
            defaultSize: "medium",
            disabledSizes: ["small"],
        };
    } else {
        return {
            allowedSizes: ["large"],
            defaultSize: "large",
            disabledSizes: ["small", "medium"],
        };
    }
}

// Formats API time range for button label (e.g. "Mo. 16.12 00:00 Uhr - Di. 17.12 00:00 Uhr")
export function formatAvailableRangeLabel(range: AvailableTimeRange): string {
    const from = new Date(range.from);
    const to = new Date(range.to);

    const fromStr = format(from, "EEE dd.MM HH:mm", {locale: enUS});
    const toStr = format(to, "EEE dd.MM HH:mm", {locale: enUS});

    return `${fromStr} Uhr - ${toStr} Uhr`;
}

// Validates and formats time input (hours/minutes)
export function validateTimeInput(
    value: string,
    max: number
): string {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return "00";
    if (num > max) return max.toString().padStart(2, "0");
    return value;
}

// Pads time value with leading zero
export function padTimeValue(value: string): string {
    const num = parseInt(value, 10);
    return isNaN(num) ? "00" : num.toString().padStart(2, "0");
}
