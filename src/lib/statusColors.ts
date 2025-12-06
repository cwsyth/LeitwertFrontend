/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import { NetworkStatus } from '@/types/network';

export const STATUS_COLORS: {
    healthy: string;
    warning: string;
    critical: string
} = {
    healthy: '#22c55e',   // green-500
    warning: '#f59e0b',   // amber-500
    critical: '#ef4444'   // red-500
};

export const OTHERS_COLOR = '#9ca3af'; // gray-400

export const getStatusColor = (status: NetworkStatus): string => {
    return STATUS_COLORS[status];
};