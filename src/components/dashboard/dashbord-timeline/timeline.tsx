"use client";

import {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Calendar as CalendarIcon,
    Clock,
    Gauge,
    Pause,
    Play
} from "lucide-react";
import { useTimeRangeStore, TimeRangePreset } from "@/lib/stores/time-range-store";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {Slider} from "@/components/ui/slider";

export default function TimeRangeSelector() {
    const {
        timeRange,
        preset,
        isPlaying,
        playbackSpeed,
        playbackWindow,
        playbackPosition,
        setPreset,
        setTimeRange,
        startPlayback,
        pausePlayback,
        setPlaybackSpeed: setStorePlaybackSpeed,
        resetPlayback
    } = useTimeRangeStore();
    const [isOpen, setIsOpen] = useState(false);

    // Datum States
    const [tempStartDate, setTempStartDate] = useState<Date>(timeRange.start);
    const [tempEndDate, setTempEndDate] = useState<Date>(timeRange.end);

    // Zeit States (Stunden und Minuten)
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

    const [sliderValue, setSliderValue] = useState(0);
    const [showTooltip, setShowTooltip] = useState(false);

    // Datumseinschränkungen
    const MIN_DATE = new Date(new Date().getFullYear(), 9, 1); // 1. Oktober
    const MAX_DATE = new Date(); // Heute

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

    // Formatiere den aktuellen Zeitraum für die Anzeige
    const formatTimeRange = () => {
        const start = format(timeRange.start, "dd. MMM HH:mm", { locale: de });
        const end = format(timeRange.end, "dd. MMM HH:mm", { locale: de });
        return `${start} - ${end}`;
    };

    const formatPlaybackPosition = () => {
        if (!playbackPosition) return "";
        return format(playbackPosition, "HH:mm:ss", { locale: de });
    };

    const presetButtons = [
        { preset: TimeRangePreset.SMALL, label: "-1 Tag" },
        { preset: TimeRangePreset.MEDIUM, label: "-7 Tage" },
        { preset: TimeRangePreset.LARGE, label: "-14 Tage" },
    ];

    const speedOptions = [
        { value: 0.5, label: "0,5x" },
        { value: 1, label: "1x" },
        { value: 2, label: "2x" },
    ];

    const handlePresetClick = (presetValue: TimeRangePreset) => {
        setPreset(presetValue);
        resetPlayback();
        setIsOpen(false);
    };

    const handleApplyCustomRange = () => {
        // Kombiniere Datum + Zeit
        const startDateTime = new Date(tempStartDate);
        startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

        const endDateTime = new Date(tempEndDate);
        endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

        setTimeRange(startDateTime, endDateTime, true);
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

    // Validiere Zeit-Input (0-23 für Stunden, 0-59 für Minuten)
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
        const currentIndex = speedOptions.findIndex(opt => opt.value === playbackSpeed);
        const nextIndex = (currentIndex + 1) % speedOptions.length;
        setStorePlaybackSpeed(speedOptions[nextIndex].value);
    };

    const handleSliderChange = (value: number[]) => {
        const percentage = value[0];

        const totalDuration = timeRange.end.getTime() - timeRange.start.getTime();
        const newPositionMs = timeRange.start.getTime() + (totalDuration * percentage / 100);

        const newPosition = new Date(newPositionMs);
        newPosition.setSeconds(0, 0);

        setSliderValue(percentage);

        // TODO: Setze neue Position im Store
        console.log('🎚️ Slider moved to:', newPosition);
    };

    return (
        <div className="flex items-center justify-end w-full gap-3">
            {/* Slider mit Zeitmarken - LINKS */}
            <div className="flex items-center gap-2" style={{ width: '300px' }}>
                {/* Start-Zeit */}
                <span className="text-xs text-white whitespace-nowrap">
                {format(timeRange.start, "dd.MM HH:mm", { locale: de })}
            </span>

                {/* Slider */}
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
                            className="absolute -top-8 bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs shadow-md pointer-events-none"
                            style={{ left: `${sliderValue}%`, transform: 'translateX(-50%)' }}
                        >
                            {format(playbackPosition, "dd.MM HH:mm", { locale: de })}
                        </div>
                    )}
                </div>

                {/* End-Zeit */}
                <span className="text-xs text-white whitespace-nowrap">
                {format(timeRange.end, "dd.MM HH:mm", { locale: de })}
            </span>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border" />

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
                {/* Play/Pause Button */}
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

                {/* Speed Button */}
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

            {/* Separator */}
            <div className="h-6 w-px bg-border" />

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="gap-2"
                    >
                        <CalendarIcon className="h-4 w-4" />
                        {formatTimeRange()}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                    {/* Preset Buttons */}
                    <div className="pb-4 border-b">
                        <label className="text-sm font-medium block mb-2">Schnellwahl</label>
                        <div className="flex gap-2">
                            {presetButtons.map(({ preset: presetValue, label }) => (
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
                            {/* Zeit-Eingabe */}
                            <div className="flex items-center gap-2 pt-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    min="0"
                                    max="23"
                                    maxLength={2}
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
                                    maxLength={2}
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
                            {/* Zeit-Eingabe */}
                            <div className="flex items-center gap-2 pt-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    min="0"
                                    max="23"
                                    maxLength={2}
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
                                    maxLength={2}
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
        </div>
    );
}
