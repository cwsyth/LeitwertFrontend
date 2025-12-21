/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

/**
 * Get API base URL - automatically selects correct URL based on context
 *
 * Priority:
 * 1. Server-side in cluster: INTERNAL_FRONTEND_API_URL (e.g., http://frontendapi:5000/api)
 * 2. Client-side: NEXT_PUBLIC_FRONTEND_API_URL (build-time, e.g., https://dev-api.univ.leitwert.net/api)
 * 3. Local dev fallback: /api (relative)
 */
const baseUrl = typeof window === 'undefined'
    ? process.env.INTERNAL_FRONTEND_API_URL
    : process.env.NEXT_PUBLIC_FRONTEND_API_URL;

export const API_BASE_URL = baseUrl || '/api';
