"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { useTimeRangeStore, TimeRangePreset } from "@/lib/stores/time-range-store";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function TimeRangeSelector() {
    const { timeRange, preset, setPreset, setTimeRange } = useTimeRangeStore();
    const [isOpen, setIsOpen] = useState(false);
    const [tempStartDate, setTempStartDate] = useState<Date>(timeRange.start);
    const [tempEndDate, setTempEndDate] = useState<Date>(timeRange.end);

    const MIN_DATE = new Date(2025, 9, 1); // 1.10.2025
    const MAX_DATE = new Date() // today

    // Formatiere den aktuellen Zeitraum für die Anzeige
    const formatTimeRange = () => {
        const start = format(timeRange.start, "dd. MMM HH:mm", { locale: de });
        const end = format(timeRange.end, "dd. MMM HH:mm", { locale: de });
        return `${start} - ${end}`;
    };

    const presetButtons = [
        { preset: TimeRangePreset.SMALL, label: "1 Tag" },
        { preset: TimeRangePreset.MEDIUM, label: "7 Tage" },
        { preset: TimeRangePreset.LARGE, label: "14 Tage" },
    ];

    const handleApplyCustomRange = () => {
        setTimeRange(tempStartDate, tempEndDate, true);
        setIsOpen(false);
    };

    const handleCancel = () => {
        setTempStartDate(timeRange.start);
        setTempEndDate(timeRange.end);
        setIsOpen(false);
    };

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

            {/* Custom Date Range Picker */}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={preset === TimeRangePreset.CUSTOM ? "default" : "outline"}
                        size="sm"
                        className="gap-2"
                    >
                        <CalendarIcon className="h-4 w-4" />
                        Custom
                        <ChevronDown className="h-3 w-3" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                    <div className="flex gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Von</label>
                            <Calendar
                                mode="single"
                                selected={tempStartDate}
                                onSelect={(date) => date && setTempStartDate(date)}
                                disabled={(date) => date < MIN_DATE || date > MAX_DATE}
                                locale={de}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bis</label>
                            <Calendar
                                mode="single"
                                selected={tempEndDate}
                                onSelect={(date) => date && setTempEndDate(date)}
                                disabled={(date) => date < tempStartDate || date > MAX_DATE}
                                locale={de}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleApplyCustomRange}
                            className="flex-1"
                        >
                            Anwenden
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Separator */}
            <div className="h-6 w-px bg-border" />

            {/* Current Time Range Display */}
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 font-normal">
                <CalendarIcon className="h-3.5 w-3.5" />
                {formatTimeRange()}
            </Badge>
        </div>
    );
}
