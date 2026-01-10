/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import { useEffect, useState } from "react";
import { AvailableTimeRange } from "@/types/time-range";
import { API_BASE_URL } from "@/lib/config";

// Fetches available time range from API (data confirmed to exist)
export function useAvailableTimeRange() {
    const [timeRange, setTimeRange] = useState<AvailableTimeRange | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAvailableTimeRange() {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/v1/bgp/usable-time-range`
                );
                if (response.ok) {
                    const data = await response.json();
                    setTimeRange(data);
                }
            } catch (error) {
                console.error("Failed to fetch available time range:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchAvailableTimeRange();
    }, []);

    return { timeRange, isLoading };
}
