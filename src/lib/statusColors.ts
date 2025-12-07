/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import { NetworkStatus } from '@/types/network';

export const STATUS_COLORS: Record<NetworkStatus, string> = {
    healthy: '#22c55e',   // green-500
    warning: '#f59e0b',   // amber-500
    critical: '#ef4444',   // red-500
    unknown: '#6b7280'    // gray-500
};

// Gradient definitions: [lightest color, darkest color]
export const STATUS_GRADIENTS: Record<NetworkStatus, [string, string]> = {
    healthy: ['#22c55e', '#064e3b'],
    warning: ['#fbbf24', '#c2410c'],
    critical: ['#f87171', '#991b1b'],
    unknown: ['#9ca3af', '#1f2937']
};

export const OTHERS_COLOR = '#9ca3af'; // gray-400

/**
 * Returns the color associated with a specific network status.
 * 
 * @param status - The network status to get the color for
 * @returns The hex color code for the given status
 * 
 * @example
 * ```typescript
 * const color = getStatusColor('healthy'); // returns '#22c55e'
 * ```
 */
export const getStatusColor = (status: NetworkStatus): string => {
    return STATUS_COLORS[status];
};

/**
 * Calculates a gradient color based on the anomaly count using CSS color-mix.
 * The color intensity increases proportionally with the anomaly count within the given range.
 * 
 * @param status - The network status determining the color gradient range
 * @param anomalyCount - The current anomaly count to calculate the color for
 * @param minAnomalies - The minimum anomaly count in the dataset
 * @param maxAnomalies - The maximum anomaly count in the dataset
 * @returns A CSS color-mix string representing the calculated gradient color
 * 
 * @remarks
 * - If minAnomalies equals maxAnomalies, returns the default status color
 * - Uses linear interpolation between light and dark colors based on the anomaly percentage
 * - The result is a CSS color-mix() expression that can be used directly in styles
 * 
 * @example
 * ```typescript
 * const color = getGradientColor('warning', 50, 0, 100);
 * // returns 'color-mix(in srgb, #c2410c 50%, #fbbf24)'
 * ```
 */
export const getGradientColor = (
    status: NetworkStatus,
    anomalyCount: number,
    minAnomalies: number,
    maxAnomalies: number
): string => {
    const [lightColor, darkColor] = STATUS_GRADIENTS[status];

    // If all values are equal, use the default color
    if (minAnomalies === maxAnomalies) {
        return STATUS_COLORS[status];
    }

    const percent = ((anomalyCount - minAnomalies) / (maxAnomalies - minAnomalies)) * 100;

    // if calculation fails, use default color
    if (!isFinite(percent)) {
        console.log('NaN detected in getGradientColor, returning default color');
        return STATUS_COLORS[status];
    }

    return `color-mix(in srgb, ${darkColor} ${percent}%, ${lightColor})`;
};