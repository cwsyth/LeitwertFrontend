"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { useTimeRangeStore, TimeRangePreset } from "@/lib/stores/time-range-store";

export default function TimeRangeSelector() {
    const { timeRange, preset, setPreset } = useTimeRangeStore();

    const formatTimeRange = () => {
        const start = timeRange.start.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
        const end = timeRange.end.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
        return `${start} - ${end}`;
    };

    const presetButtons = [
        { preset: TimeRangePreset.SMALL, label: "1 Tag" },
        { preset: TimeRangePreset.MEDIUM, label: "7 Tage" },
        { preset: TimeRangePreset.LARGE, label: "14 Tage" },
    ];

    return (
        <div className="flex items-center gap-2">
            {/* Preset Buttons */}
            <div className="flex gap-1">
                {presetButtons.map(({ preset: presetValue, label }) => (
                    <Button
                        key={presetValue}
                        variant={preset === presetValue ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreset(presetValue)}
                    >
                        {label}
                    </Button>
                ))}
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border" />

            {/* Current Time Range Display */}
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 font-normal">
                <Calendar className="h-3.5 w-3.5" />
                {formatTimeRange()}
            </Badge>
        </div>
    );
}
