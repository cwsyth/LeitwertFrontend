/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {
    CountriesSummaryResponse,
    CountryAsResponse,
    NetworkDetailsResponse
} from '@/types/network';
import { API_BASE_URL } from "@/lib/config";

export interface GetNetworkDetailsParams {
    cc: string
    limit?: number
    page?: number
    sort?: 'name' | 'cidrs' | 'bgp-anomalies' | 'ping-anomalies'
    timeRange?: { start: Date; end: Date }
    windowSize?: string
    location?: string
}

export const networkApi = {
    async getCountriesSummary(
        limit: number = 20,
        timeRange?: { start: Date; end: Date },
        sizeMetric: string = 'as_count',
        locationId?: string | null
    ): Promise<CountriesSummaryResponse> {
        const params = new URLSearchParams({
            limit: limit.toString(),
            sort: sizeMetric
        });

        if (timeRange) {
            params.append('from', timeRange.start.toISOString());
            params.append('to', timeRange.end.toISOString());
        }

        if (locationId) {
            params.append('location', locationId);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/v1/network/countries/summary?${params}`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch countries summary: ${response.status} ${errorText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error fetching countries summary:', error);
            throw error;
        }
    },

    async getCountryAs(
        countryCode: string,
        limit: number = 50,
        timeRange?: { start: Date; end: Date },
        sizeMetric: string = 'ip_count',
        locationId?: string | null
    ): Promise<CountryAsResponse> {
        const params = new URLSearchParams({
            limit: limit.toString(),
            sort: sizeMetric
        });

        if (timeRange) {
            params.append('from', timeRange.start.toISOString());
            params.append('to', timeRange.end.toISOString());
        }

        if (locationId) {
            params.append('location', locationId);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/v1/network/countries/summary/${countryCode}?${params}`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch AS data for ${countryCode}: ${response.status} ${errorText}`);
            }

            return response.json();
        } catch (error) {
            console.error(`Error fetching AS data for ${countryCode}:`, error);
            throw error;
        }
    },

    async getNetworkDetails(params: GetNetworkDetailsParams): Promise<NetworkDetailsResponse> {
        const searchParams = new URLSearchParams({
            cc: params.cc,
            limit: String(params.limit || 10),
            page: String(params.page || 1)
        })

        if (params.sort) {
            searchParams.append('sort', params.sort)
        }

        if (params.timeRange) {
            searchParams.append('from', params.timeRange.start.toISOString())
            searchParams.append('to', params.timeRange.end.toISOString())
        }

        if (params.windowSize) {
            searchParams.append('window', params.windowSize)
        }

        if (params.location) {
            searchParams.append('location', params.location)
        }

        const response = await fetch(`${API_BASE_URL}/v1/networks/get-details?${searchParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch network details: ${response.statusText}`)
        }

        return response.json()
    }
};
