/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Gauge, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

import { useTimeRangeStore } from "@/lib/stores/time-range-store";
import { TimeRangePreset, WindowSize, WindowConfig } from "@/types/time-range";
import {API_BASE_URL} from "@/lib/config";

interface AvailableTimeRange {
    from: string;
    to: string;
}

function useAvailableTimeRange() {
    const [timeRange, setTimeRange] = useState<AvailableTimeRange | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAvailableTimeRange() {
            try {
                const response = await fetch(`${API_BASE_URL}/v1/bgp/usable-time-range`);
                if (response.ok) {
                    const data = await response.json();
                    setTimeRange(data);
                }
            } catch (error) {
                console.error('Failed to fetch usable time range:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchAvailableTimeRange();
    }, []);

    return { timeRange, isLoading };
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
        startPlayback,
        pausePlayback,
        setPlaybackSpeed: setStorePlaybackSpeed,
        setPlaybackPosition,
        setWindowSize,
        resetPlayback
    } = useTimeRangeStore();

    const { timeRange: availableTimeRange, isLoading: isLoadingAvailableRange } = useAvailableTimeRange();

    const [isOpen, setIsOpen] = useState(false);
    const [sliderValue, setSliderValue] = useState(0);
    const [showTooltip, setShowTooltip] = useState(false);

    const [tempStartDate, setTempStartDate] = useState<Date>(timeRange.start);
    const [tempEndDate, setTempEndDate] = useState<Date>(timeRange.end);

    const [startHour, setStartHour] = useState<string>(
        timeRange.start.getHours().toString().padStart(2, "0")
    );
    const [startMinute, setStartMinute] = useState<string>(
        timeRange.start.getMinutes().toString().padStart(2, "0")
    );
    const [endHour, setEndHour] = useState<string>(
        timeRange.end.getHours().toString().padStart(2, "0")
    );
    const [endMinute, setEndMinute] = useState<string>(
        timeRange.end.getMinutes().toString().padStart(2, "0")
    );

    const MIN_DATE = new Date(new Date().getFullYear(), 9, 1); // 1. Oktober
    const MAX_DATE = new Date(); // Heute

    const PRESET_BUTTONS = [
        { preset: TimeRangePreset.SMALL, label: "-1 Tag" },
        { preset: TimeRangePreset.MEDIUM, label: "-7 Tage" },
        { preset: TimeRangePreset.LARGE, label: "-14 Tage" },
    ];

    const SPEED_OPTIONS = [
        { value: 0.5, label: "0,5x" },
        { value: 1, label: "1x" },
        { value: 2, label: "2x" },
        { value: 5, label: "5x" },
        { value: 10, label: "10x" },
        { value: 20, label: "20x" },
        { value: 50, label: "50x" },
        { value: 100, label: "100x" }
    ];

    const getTimeRangeDuration = (): number => {
        const durationMs = timeRange.end.getTime() - timeRange.start.getTime();
        return durationMs / (1000 * 60 * 60);
    };

    const getWindowConfig = (): WindowConfig => {
        const durationHours = getTimeRangeDuration();
        const durationDays = durationHours / 24;

        if (durationHours <= 24) {
            return {
                allowedSizes: ['small', 'medium'],
                defaultSize: 'small',
                disabledSizes: ['large']
            };
        } else if (durationDays <= 14) {
            return {
                allowedSizes: ['medium', 'large'],
                defaultSize: 'medium',
                disabledSizes: ['small']
            };
        } else {
            return {
                allowedSizes: ['large'],
                defaultSize: 'large',
                disabledSizes: ['small', 'medium']
            };
        }
    };

    const windowConfig = getWindowConfig();

    useEffect(() => {
        if (playbackPosition) {
            const totalDuration = timeRange.end.getTime() - timeRange.start.getTime();
            const elapsed = playbackPosition.getTime() - timeRange.start.getTime();
            const percentage = (elapsed / totalDuration) * 100;
            setSliderValue(percentage);
        } else {
            setSliderValue(0);
        }
    }, [playbackPosition, timeRange]);

    useEffect(() => {
        if (!windowConfig.allowedSizes.includes(windowSize)) {
            setWindowSize(windowConfig.defaultSize);
        }
    }, [timeRange, windowSize, windowConfig.allowedSizes, windowConfig.defaultSize, setWindowSize]);

    // Event Handlers
    const handlePresetClick = (presetValue: TimeRangePreset) => {
        setPreset(presetValue);
        resetPlayback();
        setIsOpen(false);
    };

    const handleApplyCustomRange = () => {
        const startDateTime = new Date(tempStartDate);
        startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

        const endDateTime = new Date(tempEndDate);
        endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

        setTimeRange(startDateTime, endDateTime);
        resetPlayback();
        setIsOpen(false);
    };

    const handleCancel = () => {
        setTempStartDate(timeRange.start);
        setTempEndDate(timeRange.end);
        setStartHour(timeRange.start.getHours().toString().padStart(2, "0"));
        setStartMinute(timeRange.start.getMinutes().toString().padStart(2, "0"));
        setEndHour(timeRange.end.getHours().toString().padStart(2, "0"));
        setEndMinute(timeRange.end.getMinutes().toString().padStart(2, "0"));
        setIsOpen(false);
    };

    const handleTimeInput = (
        value: string,
        setter: (val: string) => void,
        max: number
    ) => {
        const cleanValue = value.replace(/^0+/, "") || "0";
        const num = parseInt(cleanValue);

        if (!isNaN(num) && num >= 0 && num <= max) {
            setter(cleanValue);
        } else if (value === "") {
            setter("0");
        }
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            pausePlayback();
        } else {
            startPlayback();
        }
    };

    const handleSpeedChange = () => {
        const currentIndex = SPEED_OPTIONS.findIndex(opt => opt.value === playbackSpeed);
        const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
        setStorePlaybackSpeed(SPEED_OPTIONS[nextIndex].value);
    };

    const handleSliderChange = (value: number[]) => {
        const percentage = value[0];
        const totalDuration = timeRange.end.getTime() - timeRange.start.getTime();
        const newPositionMs = timeRange.start.getTime() + (totalDuration * percentage / 100);
        const newPosition = new Date(newPositionMs);
        newPosition.setSeconds(0, 0);

        setSliderValue(percentage);
        setPlaybackPosition(newPosition);
    };

    const formatAvailableRangeLabel = (range: AvailableTimeRange): string => {
        const from = new Date(range.from);
        const to = new Date(range.to);

        const fromStr = format(from, "EEE dd.MM HH:mm", { locale: de });
        const toStr = format(to, "EEE dd.MM HH:mm", { locale: de });

        return `${fromStr} Uhr - ${toStr} Uhr`;
    };

    const availableRangeButton = availableTimeRange ? {
        label: formatAvailableRangeLabel(availableTimeRange),
        isAvailable: true
    } : null;

    const isAvailableRangeSelected = (): boolean => {
        if (!availableTimeRange) return false;

        const apiStart = new Date(availableTimeRange.from).getTime();
        const apiEnd = new Date(availableTimeRange.to).getTime();
        const currentStart = timeRange.start.getTime();
        const currentEnd = timeRange.end.getTime();

        return apiStart === currentStart && apiEnd === currentEnd;
    };

    const handleAvailableRangeClick = () => {
        if (!availableTimeRange) return;

        const start = new Date(availableTimeRange.from);
        const end = new Date(availableTimeRange.to);

        setTimeRange(start, end);
        resetPlayback();
        setIsOpen(false);
    };

    return (
        <div className="flex items-center justify-end w-full gap-3">
            {/* Window Size Selector */}
            <Select
                value={windowSize}
                onValueChange={(value) => setWindowSize(value as WindowSize)}
            >
                <SelectTrigger className="w-25 text-black bg-white">
                    <span>Window</span>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem
                        value="small"
                        disabled={windowConfig.disabledSizes.includes('small')}
                    >
                        Minütlich
                    </SelectItem>
                    <SelectItem
                        value="medium"
                        disabled={windowConfig.disabledSizes.includes('medium')}
                    >
                        Stündlich
                    </SelectItem>
                    <SelectItem
                        value="large"
                        disabled={windowConfig.disabledSizes.includes('large')}
                    >
                        Täglich
                    </SelectItem>
                </SelectContent>
            </Select>

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
                            <label className="text-sm font-medium block mb-2">Zeiträume mit gesicherten Daten</label>
                            <Button
                                variant={isAvailableRangeSelected() ? "default" : "outline"}
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
                        <label className="text-sm font-medium block mb-2">Schnellwahl</label>
                        <div className="flex gap-2">
                            {PRESET_BUTTONS.map(({ preset: presetValue, label }) => (
                                <Button
                                    key={presetValue}
                                    variant={preset === presetValue ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePresetClick(presetValue)}
                                    className="flex-1"
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Date + Time Picker */}
                    <div className="flex gap-4 pt-4">
                        {/* Start Datum + Zeit */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Von</label>
                            <Calendar
                                mode="single"
                                selected={tempStartDate}
                                onSelect={(date) => date && setTempStartDate(date)}
                                disabled={(date) => date < MIN_DATE || date > MAX_DATE}
                                locale={de}
                            />
                            <div className="flex items-center gap-2 pt-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={startHour}
                                    onChange={(e) => handleTimeInput(e.target.value, setStartHour, 23)}
                                    onBlur={(e) => setStartHour(e.target.value.padStart(2, "0"))}
                                    className="w-14 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="HH"
                                />
                                <span className="text-muted-foreground">:</span>
                                <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={startMinute}
                                    onChange={(e) => handleTimeInput(e.target.value, setStartMinute, 59)}
                                    onBlur={(e) => setStartMinute(e.target.value.padStart(2, "0"))}
                                    className="w-14 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="MM"
                                />
                            </div>
                        </div>

                        {/* End Datum + Zeit */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Bis</label>
                            <Calendar
                                mode="single"
                                selected={tempEndDate}
                                onSelect={(date) => date && setTempEndDate(date)}
                                disabled={(date) => date < tempStartDate || date > MAX_DATE}
                                locale={de}
                            />
                            <div className="flex items-center gap-2 pt-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={endHour}
                                    onChange={(e) => handleTimeInput(e.target.value, setEndHour, 23)}
                                    onBlur={(e) => setEndHour(e.target.value.padStart(2, "0"))}
                                    className="w-14 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="HH"
                                />
                                <span className="text-muted-foreground">:</span>
                                <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={endMinute}
                                    onChange={(e) => handleTimeInput(e.target.value, setEndMinute, 59)}
                                    onBlur={(e) => setEndMinute(e.target.value.padStart(2, "0"))}
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

            {/* Slider mit Zeitmarken */}
            <div className="flex items-center gap-2" style={{ width: '300px' }}>
                <Badge variant="secondary" className="gap-1.5 px-2 py-1 font-semibold">
                    {format(timeRange.start, "dd.MM HH:mm", { locale: de })} Uhr
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
                            style={{ left: `${sliderValue}%`, transform: 'translateX(-50%)' }}
                        >
                            {format(playbackPosition, "dd.MM HH:mm", { locale: de })}
                        </div>
                    )}
                </div>

                <Badge variant="secondary" className="gap-1.5 px-2 py-1 font-semibold">
                    {format(timeRange.end, "dd.MM HH:mm", { locale: de })} Uhr
                </Badge>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border" />

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePlayPause}
                >
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
