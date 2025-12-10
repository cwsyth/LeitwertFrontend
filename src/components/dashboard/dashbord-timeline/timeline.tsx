"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, ChevronDown, Clock } from "lucide-react";
import { useTimeRangeStore, TimeRangePreset } from "@/lib/stores/time-range-store";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function TimeRangeSelector() {
    const { timeRange, preset, setPreset, setTimeRange } = useTimeRangeStore();
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

    // Datumseinschränkungen
    const MIN_DATE = new Date(new Date().getFullYear(), 9, 1); // 1. Oktober
    const MAX_DATE = new Date(); // Heute

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
        // Kombiniere Datum + Zeit
        const startDateTime = new Date(tempStartDate);
        startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

        const endDateTime = new Date(tempEndDate);
        endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

        setTimeRange(startDateTime, endDateTime, true);
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
        const num = parseInt(value);
        if (value === "" || (num >= 0 && num <= max)) {
            setter(value.padStart(2, "0"));
        }
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
                        {/* Start Datum + Zeit */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Von</label>
                            <Calendar
                                mode="single"
                                selected={tempStartDate}
                                onSelect={(date) => date && setTempStartDate(date)}
                                disabled={(date) => date < MIN_DATE || date > MAX_DATE}
                            />
                            {/* Zeit-Eingabe */}
                            <div className="flex items-center gap-2 pt-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={startHour}
                                    onChange={(e) => handleTimeInput(e.target.value, setStartHour, 23)}
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
                                    value={endHour}
                                    onChange={(e) => handleTimeInput(e.target.value, setEndHour, 23)}
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
                                    className="w-14 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="MM"
                                />
                            </div>
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
