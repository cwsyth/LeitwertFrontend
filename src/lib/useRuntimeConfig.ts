"use client";

import { useEffect, useState } from "react";
import { RuntimeConfig } from "@/types/RuntimeConfig";

export function useRuntimeConfig() {
    const [cfg, setCfg] = useState<RuntimeConfig>({locale: "de-DE", timezone: "Europe/Berlin"}); // Fallback

    useEffect(() => {
        let cancelled = false;

        fetch("/api/runtime-config", { cache: "no-store" })
            .then((r) => r.json())
            .then((data) => {
                if (!cancelled) setCfg(data);
            })
            .catch(() => {
                // Ignore errors and keep fallback
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return cfg;
}
