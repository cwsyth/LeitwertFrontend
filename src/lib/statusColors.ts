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

export const getStatusColor = (status: NetworkStatus): string => {
    return STATUS_COLORS[status];
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

    return `color-mix(in srgb, ${darkColor} ${percent}%, ${lightColor})`;
};