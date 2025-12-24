/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";

import {useTimeRangeStore} from "@/lib/stores/time-range-store";
import {TimeRangePreset, WindowSize} from "@/types/time-range";
import {TempDateTime} from "@/components/timeline/timeline-types";
import {SPEED_OPTIONS} from "@/components/timeline/timeline-constants";
import {useAvailableTimeRange} from "@/hooks/use-available-time-range";
import {
    formatAvailableRangeLabel,
    getWindowConfig,
    padTimeValue,
    validateTimeInput
} from "@/components/timeline/timeline-utils";
import {
    PlaybackControls
} from "@/components/timeline/components/playback-controls";
import {
    TimeRangeDisplay
} from "@/components/timeline/components/time-range-display";
import {
    CustomRangePicker
} from "@/components/timeline/components/custom-range-picker";

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

    const { timeRange: availableTimeRange } = useAvailableTimeRange();

    // UI state for popover
    const [isOpen, setIsOpen] = useState(false);

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
        (value: string, field: keyof TempDateTime, max: number) => {
            const validated = validateTimeInput(value, max);
            setTempDateTime((prev) => ({...prev, [field]: validated}));
        },
        []
    );

    const handleTimeBlur = useCallback((field: keyof TempDateTime) => {
        setTempDateTime((prev) => ({
            ...prev,
            [field]: padTimeValue(prev[field] as string),
        }));
    }, []);

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

            <CustomRangePicker
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                tempDateTime={tempDateTime}
                onTempDateTimeChange={(update) =>
                    setTempDateTime((prev) => ({...prev, ...update}))
                }
                onTimeInput={handleTimeInput}
                onTimeBlur={handleTimeBlur}
                onApply={handleApplyCustomRange}
                onCancel={handleCancel}
                availableRangeLabel={
                    availableTimeRange
                        ? formatAvailableRangeLabel(availableTimeRange)
                        : undefined
                }
                onLoadAvailableRange={
                    availableTimeRange ? handleAvailableRangeClick : undefined
                }
                currentPreset={preset}
                onPresetClick={handlePresetClick}
            />

            {/* Slider with time markers */}
            <TimeRangeDisplay
                startTime={timeRange.start}
                endTime={timeRange.end}
                currentPosition={playbackPosition}
                sliderValue={sliderValue}
                onSliderChange={handleSliderChange}
            />

            {/* Separator */}
            <div className="h-6 w-px bg-border"/>

            <PlaybackControls
                isPlaying={isPlaying}
                playbackSpeed={playbackSpeed}
                onPlayPause={handlePlayPause}
                onSpeedChange={handleSpeedChange}
            />
        </div>
    );
}
