/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import {
    Calendar as CalendarIcon,
    Clock,
    Gauge,
    Pause,
    Play,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";

import { useTimeRangeStore } from "@/lib/stores/time-range-store";
import { TimeRangePreset, WindowConfig, WindowSize } from "@/types/time-range";
import { API_BASE_URL } from "@/lib/config";
import { useRuntimeConfig } from "@/lib/useRuntimeConfig";

// Date range boundaries for calendar picker
const MIN_DATE = new Date(new Date().getFullYear(), 9, 1); // Oct 1st
const MAX_DATE = new Date(); // Today

// Quick select preset buttons
const PRESET_BUTTONS = [
    { preset: TimeRangePreset.SMALL, label: "-1 Tag" },
    { preset: TimeRangePreset.MEDIUM, label: "-7 Tage" },
    { preset: TimeRangePreset.LARGE, label: "-14 Tage" },
] as const;

// Playback speed multipliers
const SPEED_OPTIONS = [
    { value: 0.5, label: "0,5x" },
    { value: 1, label: "1x" },
    { value: 2, label: "2x" },
    { value: 5, label: "5x" },
    { value: 10, label: "10x" },
    { value: 20, label: "20x" },
    { value: 50, label: "50x" },
    { value: 100, label: "100x" },
] as const;

// Types
interface AvailableTimeRange {
    from: string;
    to: string;
}

interface TempDateTime {
    startDate: Date;
    endDate: Date;
    startHour: string;
    startMinute: string;
    endHour: string;
    endMinute: string;
}

// Fetches available time range from API (data confirmed to exist)
function useAvailableTimeRange() {
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

// Determines allowed window sizes based on time range duration
function getWindowConfig(durationHours: number): WindowConfig {
    const durationDays = durationHours / 24;

    if (durationHours <= 24) {
        return {
            allowedSizes: ["small", "medium"],
            defaultSize: "small",
            disabledSizes: ["large"],
        };
    } else if (durationDays <= 14) {
        return {
            allowedSizes: ["medium", "large"],
            defaultSize: "medium",
            disabledSizes: ["small"],
        };
    } else {
        return {
            allowedSizes: ["large"],
            defaultSize: "large",
            disabledSizes: ["small", "medium"],
        };
    }
}

// Formats API time range for button label (e.g. "Mo. 16.12 00:00 Uhr - Di. 17.12 00:00 Uhr")
function formatAvailableRangeLabel(range: AvailableTimeRange): string {
    const from = new Date(range.from);
    const to = new Date(range.to);

    const fromStr = format(from, "EEE dd.MM HH:mm", { locale: enGB });
    const toStr = format(to, "EEE dd.MM HH:mm", { locale: enGB });

    return `${fromStr} Uhr - ${toStr} Uhr`;
}

export default function TimeRangeSelector() {
    const {
        timeRange,
        preset,
        isPlaying,
        playbackSpeed,
        playbackPosition,
        windowSize,
        setPreset,
        setTimeRange,
        togglePlayback,
        setPlaybackSpeed: setStorePlaybackSpeed,
        setPlaybackPosition,
        setWindowSize,
        resetPlayback,
    } = useTimeRangeStore();

    const {
        timeRange: availableTimeRange,
        isLoading: isLoadingAvailableRange,
    } = useAvailableTimeRange();

    // UI state for popover and tooltip
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Draft state for date/time picker - only committed to store on "Apply"
    const [tempDateTime, setTempDateTime] = useState<TempDateTime>(() => ({
        startDate: timeRange.start,
        endDate: timeRange.end,
        startHour: timeRange.start.getHours().toString().padStart(2, "0"),
        startMinute: timeRange.start.getMinutes().toString().padStart(2, "0"),
        endHour: timeRange.end.getHours().toString().padStart(2, "0"),
        endMinute: timeRange.end.getMinutes().toString().padStart(2, "0"),
    }));

    // Calculate duration in hours (cached, only recalculates when timeRange changes)
    const timeRangeDuration = useMemo(() => {
        const durationMs = timeRange.end.getTime() - timeRange.start.getTime();
        return durationMs / (1000 * 60 * 60);
    }, [timeRange]);

    // Determine which window sizes are allowed based on duration
    const windowConfig = useMemo(
        () => getWindowConfig(timeRangeDuration),
        [timeRangeDuration]
    );

    // Calculate slider position based on playback position (0-100%)
    const sliderValue = useMemo(() => {
        if (!playbackPosition) return 0;
        const totalDuration =
            timeRange.end.getTime() - timeRange.start.getTime();
        const elapsed = playbackPosition.getTime() - timeRange.start.getTime();
        return (elapsed / totalDuration) * 100;
    }, [playbackPosition, timeRange]);

    // Button data for available time range (includes selected state)
    const availableRangeButton = useMemo(() => {
        if (!availableTimeRange) return null;
        return {
            label: formatAvailableRangeLabel(availableTimeRange),
            isSelected: (() => {
                const apiStart = new Date(availableTimeRange.from).getTime();
                const apiEnd = new Date(availableTimeRange.to).getTime();
                const currentStart = timeRange.start.getTime();
                const currentEnd = timeRange.end.getTime();
                return apiStart === currentStart && apiEnd === currentEnd;
            })(),
        };
    }, [availableTimeRange, timeRange]);

    // Sync temp state when store timeRange changes (e.g. from preset buttons)
    useEffect(() => {
        setTempDateTime({
            startDate: timeRange.start,
            endDate: timeRange.end,
            startHour: timeRange.start.getHours().toString().padStart(2, "0"),
            startMinute: timeRange.start
                .getMinutes()
                .toString()
                .padStart(2, "0"),
            endHour: timeRange.end.getHours().toString().padStart(2, "0"),
            endMinute: timeRange.end.getMinutes().toString().padStart(2, "0"),
        });
    }, [timeRange]);

    // Auto-adjust window size if current size becomes invalid
    useEffect(() => {
        if (!windowConfig.allowedSizes.includes(windowSize)) {
            setWindowSize(windowConfig.defaultSize);
        }
    }, [windowSize, windowConfig, setWindowSize]);

    // Event Handlers
    const handlePresetClick = useCallback(
        (presetValue: TimeRangePreset) => {
            setPreset(presetValue);
            resetPlayback();
            setIsOpen(false);
        },
        [setPreset, resetPlayback]
    );

    const handleAvailableRangeClick = useCallback(() => {
        if (!availableTimeRange) return;

        const start = new Date(availableTimeRange.from);
        const end = new Date(availableTimeRange.to);

        setTimeRange(start, end);
        resetPlayback();
        setIsOpen(false);
    }, [availableTimeRange, setTimeRange, resetPlayback]);

    const handleApplyCustomRange = useCallback(() => {
        const startDateTime = new Date(tempDateTime.startDate);
        startDateTime.setHours(
            parseInt(tempDateTime.startHour),
            parseInt(tempDateTime.startMinute),
            0,
            0
        );

        const endDateTime = new Date(tempDateTime.endDate);
        endDateTime.setHours(
            parseInt(tempDateTime.endHour),
            parseInt(tempDateTime.endMinute),
            0,
            0
        );

        setTimeRange(startDateTime, endDateTime);
        resetPlayback();
        setIsOpen(false);
    }, [tempDateTime, setTimeRange, resetPlayback]);

    const handleCancel = useCallback(() => {
        // Reset temp state to current store values
        setTempDateTime({
            startDate: timeRange.start,
            endDate: timeRange.end,
            startHour: timeRange.start.getHours().toString().padStart(2, "0"),
            startMinute: timeRange.start
                .getMinutes()
                .toString()
                .padStart(2, "0"),
            endHour: timeRange.end.getHours().toString().padStart(2, "0"),
            endMinute: timeRange.end.getMinutes().toString().padStart(2, "0"),
        });
        setIsOpen(false);
    }, [timeRange]);

    const handleTimeInput = useCallback(
        (
            value: string,
            field: keyof Pick<
                TempDateTime,
                "startHour" | "startMinute" | "endHour" | "endMinute"
            >,
            max: number
        ) => {
            const cleanValue = value.replace(/^0+/, "") || "0";
            const num = parseInt(cleanValue);

            if (!isNaN(num) && num >= 0 && num <= max) {
                setTempDateTime((prev) => ({ ...prev, [field]: cleanValue }));
            } else if (value === "") {
                setTempDateTime((prev) => ({ ...prev, [field]: "0" }));
            }
        },
        []
    );

    const handleTimeBlur = useCallback(
        (
            field: keyof Pick<
                TempDateTime,
                "startHour" | "startMinute" | "endHour" | "endMinute"
            >
        ) => {
            // Pad with leading zero on blur
            setTempDateTime((prev) => ({
                ...prev,
                [field]: prev[field].padStart(2, "0"),
            }));
        },
        []
    );

    const handlePlayPause = useCallback(() => {
        togglePlayback();
    }, [togglePlayback]);

    const handleSpeedChange = useCallback(() => {
        // Cycle through speed options
        const currentIndex = SPEED_OPTIONS.findIndex(
            (opt) => opt.value === playbackSpeed
        );
        const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
        setStorePlaybackSpeed(SPEED_OPTIONS[nextIndex].value);
    }, [playbackSpeed, setStorePlaybackSpeed]);

    const handleSliderChange = useCallback(
        (values: number[]) => {
            // Convert slider percentage to actual timestamp
            const percentage = values[0];
            const totalDuration =
                timeRange.end.getTime() - timeRange.start.getTime();
            const elapsed = (percentage / 100) * totalDuration;
            const newPosition = new Date(timeRange.start.getTime() + elapsed);

            setPlaybackPosition(newPosition);
        },
        [timeRange, setPlaybackPosition]
    );

    return (
        <div className="flex items-center justify-end w-full gap-3">
            {/* Window Size Selector */}
            <div className="flex items-center gap-2">
                <Select
                    value={windowSize}
                    onValueChange={(value) =>
                        setWindowSize(value as WindowSize)
                    }
                >
                    <SelectTrigger className="w-25 text-black bg-white">
                        <span>Window</span>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            value="small"
                            disabled={windowConfig.disabledSizes.includes(
                                "small"
                            )}
                        >
                            Small
                        </SelectItem>
                        <SelectItem
                            value="medium"
                            disabled={windowConfig.disabledSizes.includes(
                                "medium"
                            )}
                        >
                            Medium
                        </SelectItem>
                        <SelectItem
                            value="large"
                            disabled={windowConfig.disabledSizes.includes(
                                "large"
                            )}
                        >
                            Large
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Date Time Picker */}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                    {/* Available Data Range */}
                    {availableRangeButton && (
                        <div className="pb-4 border-b">
                            <label className="text-sm font-medium block mb-2">
                                Time Ranges with Available Data
                            </label>
                            <Button
                                variant={
                                    availableRangeButton.isSelected
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={handleAvailableRangeClick}
                                disabled={isLoadingAvailableRange}
                            >
                                {availableRangeButton.label}
                            </Button>
                        </div>
                    )}

                    {/* Preset Buttons */}
                    <div className="pb-4 border-b">
                        <label className="text-sm font-medium block mb-2">
                            Presets
                        </label>
                        <div className="flex gap-2">
                            {PRESET_BUTTONS.map(
                                ({ preset: presetValue, label }) => (
                                    <Button
                                        key={presetValue}
                                        variant={
                                            preset === presetValue
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                            handlePresetClick(presetValue)
                                        }
                                        className="flex-1"
                                    >
                                        {label}
                                    </Button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Custom Date + Time Picker */}
                    <div className="flex gap-4 pt-4">
                        {/* Start Date + Time */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium">From</label>
                            <Calendar
                                mode="single"
                                selected={tempDateTime.startDate}
                                onSelect={(date) =>
                                    date &&
                                    setTempDateTime((prev) => ({
                                        ...prev,
                                        startDate: date,
                                    }))
                                }
                                disabled={(date) =>
                                    date < MIN_DATE || date > MAX_DATE
                                }
                                locale={enGB}
                            />
                            <div className="flex items-center gap-2 pt-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={tempDateTime.startHour}
                                    onChange={(e) =>
                                        handleTimeInput(
                                            e.target.value,
                                            "startHour",
                                            23
                                        )
                                    }
                                    onBlur={() => handleTimeBlur("startHour")}
                                    className="w-14 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="HH"
                                />
                                <span className="text-muted-foreground">:</span>
                                <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={tempDateTime.startMinute}
                                    onChange={(e) =>
                                        handleTimeInput(
                                            e.target.value,
                                            "startMinute",
                                            59
                                        )
                                    }
                                    onBlur={() => handleTimeBlur("startMinute")}
                                    className="w-14 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="MM"
                                />
                            </div>
                        </div>

                        {/* End Date + Time */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium">To</label>
                            <Calendar
                                mode="single"
                                selected={tempDateTime.endDate}
                                onSelect={(date) =>
                                    date &&
                                    setTempDateTime((prev) => ({
                                        ...prev,
                                        endDate: date,
                                    }))
                                }
                                disabled={(date) =>
                                    date < tempDateTime.startDate ||
                                    date > MAX_DATE
                                }
                                locale={enGB}
                            />
                            <div className="flex items-center gap-2 pt-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={tempDateTime.endHour}
                                    onChange={(e) =>
                                        handleTimeInput(
                                            e.target.value,
                                            "endHour",
                                            23
                                        )
                                    }
                                    onBlur={() => handleTimeBlur("endHour")}
                                    className="w-14 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="HH"
                                />
                                <span className="text-muted-foreground">:</span>
                                <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={tempDateTime.endMinute}
                                    onChange={(e) =>
                                        handleTimeInput(
                                            e.target.value,
                                            "endMinute",
                                            59
                                        )
                                    }
                                    onBlur={() => handleTimeBlur("endMinute")}
                                    className="w-14 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="MM"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleApplyCustomRange}
                            className="flex-1"
                        >
                            Apply
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Slider with time markers */}
            <div className="flex items-center gap-2" style={{ width: "300px" }}>
                <Badge
                    variant="secondary"
                    className="gap-1.5 px-2 py-1 font-semibold"
                >
                    {format(timeRange.start, "dd.MM HH:mm", { locale: enGB })} Uhr
                </Badge>

                <div className="flex-1 flex flex-col items-center relative">
                    <Slider
                        value={[sliderValue]}
                        onValueChange={handleSliderChange}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&>span:first-child]:bg-gray-600 [&>span>span]:bg-transparent"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    />
                    {showTooltip && playbackPosition && (
                        <div
                            className="absolute -top-8 bg-popover text-popover-foreground px-3 py-1 rounded-md text-xs shadow-md pointer-events-none whitespace-nowrap min-w-fit"
                            style={{
                                left: `${sliderValue}%`,
                                transform: "translateX(-50%)",
                            }}
                        >
                            {format(playbackPosition, "dd.MM HH:mm", {
                                locale: enGB,
                            })}
                        </div>
                    )}
                </div>

                <Badge
                    variant="secondary"
                    className="gap-1.5 px-2 py-1 font-semibold"
                >
                    {format(timeRange.end, "dd.MM HH:mm", { locale: enGB })} Uhr
                </Badge>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border" />

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePlayPause}>
                    {isPlaying ? (
                        <Pause className="h-4 w-4" />
                    ) : (
                        <Play className="h-4 w-4" />
                    )}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSpeedChange}
                    className="gap-2 min-w-[4rem]"
                >
                    <Gauge className="h-4 w-4" />
                    {playbackSpeed}x
                </Button>
            </div>
        </div>
    );
}
