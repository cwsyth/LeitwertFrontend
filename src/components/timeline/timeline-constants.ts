/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {TimeRangePreset} from "@/types/time-range";

// Date range boundaries for calendar picker
export const MIN_DATE = new Date(new Date().getFullYear(), 9, 1); // Oct 1st
export const MAX_DATE = new Date(); // Today

// Quick select preset buttons
export const PRESET_BUTTONS = [
    {preset: TimeRangePreset.SMALL, label: "-1 Tag"},
    {preset: TimeRangePreset.MEDIUM, label: "-7 Tage"},
    {preset: TimeRangePreset.LARGE, label: "-14 Tage"},
] as const;

// Playback speed multipliers
export const SPEED_OPTIONS = [
    {value: 0.5, label: "0,5x"},
    {value: 1, label: "1x"},
    {value: 2, label: "2x"},
    {value: 5, label: "5x"},
    {value: 10, label: "10x"},
    {value: 20, label: "20x"},
    {value: 50, label: "50x"},
    {value: 100, label: "100x"},
] as const;
