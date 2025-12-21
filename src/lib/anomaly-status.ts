/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {NetworkStatus, StatusThresholds} from "@/types/network";

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
