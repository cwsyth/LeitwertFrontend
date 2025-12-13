/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import { NetworkStatus } from '@/types/network';

export interface StatusResponse {
    count: number;
    healthy: number;
    warning: number;
    critical: number;
    unknown: number;
}

export interface StatusCardProps {
    title: string;
    apiEndpoint: string;
    className?: string;
}

export interface StatusItem {
    status: NetworkStatus;
    count: number;
    label: string;
}
