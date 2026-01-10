/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

export type WindowSize = 'small' | 'medium' | 'large';

export enum TimeRangePreset {
    SMALL = '1d',
    MEDIUM = '7d',
    LARGE = '14d',
    CUSTOM = 'custom'
}

export interface TimeRange {
    start: Date;
    end: Date;
}

export interface WindowConfig {
    allowedSizes: WindowSize[];
    defaultSize: WindowSize;
    disabledSizes: WindowSize[];
}

// API response for available time range
export interface AvailableTimeRange {
    from: string;
    to: string;
}
