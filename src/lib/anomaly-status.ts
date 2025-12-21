/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {NetworkStatus, StatusThresholds} from "@/types/network";

export const STATUS_COLOR_CLASSES = {
    healthy: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
    unknown: 'bg-gray-100 text-gray-700 border-gray-200'
} as const;

export function determineStatus(
    anomalyCount: number,
    thresholds: StatusThresholds
): NetworkStatus {
    if (anomalyCount >= thresholds.critical.min) {
        return 'critical';
    }
    if (anomalyCount >= thresholds.warning.min && anomalyCount <= thresholds.warning.max) {
        return 'warning';
    }
    if (anomalyCount >= thresholds.healthy.min && anomalyCount <= thresholds.healthy.max) {
        return 'healthy';
    }

    return 'unknown';
}
