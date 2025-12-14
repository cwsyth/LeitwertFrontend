/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import { CountriesSummaryResponse, CountryAsResponse } from '@/types/network';
import {API_BASE_URL} from "@/lib/config";

export const networkApi = {
    async getCountriesSummary(
        limit: number = 50,
        timeRange?: { start: Date; end: Date },
        sizeMetric: string = 'as_count'
    ): Promise<CountriesSummaryResponse> {
        const params = new URLSearchParams({
            limit: limit.toString(),
            sort: sizeMetric
        });

        if (timeRange) {
            params.append('from', timeRange.start.toISOString());
            params.append('to', timeRange.end.toISOString());
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
        sizeMetric: string = 'ip_count'
    ): Promise<CountryAsResponse> {
        const params = new URLSearchParams({
            limit: limit.toString(),
            sort: sizeMetric
        });

        if (timeRange) {
            params.append('from', timeRange.start.toISOString());
            params.append('to', timeRange.end.toISOString());
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
    }
};
