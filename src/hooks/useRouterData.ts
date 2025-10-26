/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

'use client';

import { useQuery } from '@tanstack/react-query';

interface RouterData {
    timestamp: string;
    id: string;
    name: string;
    ipv4: string;
    ptr: string;
    tier: number;
    latency: number;
    status: 'critical' | 'warning' | 'healthy' | 'unknown';
    asn: {
        id: number;
        name: string;
        organization: string;
        country_code: string;
    };
    ipv4_cidrs: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_API_URL;

async function fetchRouterData(routerId: string): Promise<RouterData> {
    const response = await fetch(`${API_BASE_URL}/api/v1/detail_view`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: routerId })
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch router ${routerId}: ${response.statusText}`);
    }

    return response.json();
}

export function useRouterData(routerId: string) {
    return useQuery({
        queryKey: ['router', routerId],
        queryFn: () => fetchRouterData(routerId),
        staleTime: 30000, // 30 Sekunden
        enabled: !!routerId,
    });
}