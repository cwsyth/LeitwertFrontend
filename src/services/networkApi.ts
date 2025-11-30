/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import { CountriesSummaryResponse, CountryAsResponse, NetworkStatus } from '@/types/network';

const API_BASE_URL = process.env.INTERNAL_FRONTEND_API_URL;

export const networkApi = {
    async getCountriesSummary(limit: number = 10, status?: NetworkStatus): Promise<CountriesSummaryResponse> {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (status) params.append('status', status);

        const response = await fetch(`${API_BASE_URL}/api/v1/network/countries/summary?${params}`);
        if (!response.ok) throw new Error('Failed to fetch countries summary');
        return response.json();
    },

    async getCountryAs(countryCode: string, limit: number = 10, status?: NetworkStatus): Promise<CountryAsResponse> {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (status) params.append('status', status);

        const response = await fetch(`${API_BASE_URL}/api/v1/network/countries/summary/${countryCode}?${params}`);
        if (!response.ok) throw new Error(`Failed to fetch AS data for ${countryCode}`);
        return response.json();
    }
};