"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

enum TimeSliderSpeed {
    Half = 0.5,
    Normal = 1,
    Double = 2,
    Quadruple = 4,
}

enum TimeRange {
    LastDay = "24h",
    LastThreeDays = "3d",
    LastWeek = "7d",
}

const timeRangeOptions = [
    { value: TimeRange.LastDay, label: "Letzter Tag", hours: 24 },
    { value: TimeRange.LastThreeDays, label: "Letzte drei Tage", hours: 72 },
    { value: TimeRange.LastWeek, label: "Letzte Woche", hours: 168 },
];

export default function DashboardTimeline() {
    const [currentTime, setCurrentTime] = useState(50); // 0-100%
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState<TimeSliderSpeed>(
        TimeSliderSpeed.Normal
    );
    const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.LastDay);

    // Hole die maximale Anzahl an Stunden für den gewählten Bereich
    const selectedRange = timeRangeOptions.find((r) => r.value === timeRange);
    const maxHours = selectedRange ? selectedRange.hours : 24;

    // Konvertiere Prozent zu Stunden basierend auf dem gewählten Bereich
    const currentHour = Math.floor((currentTime / 100) * maxHours);

    // Berechne das aktuelle Datum/Uhrzeit vom Slider
    const now = new Date();
    const selectedDate = new Date(
        now.getTime() - (maxHours - currentHour) * 60 * 60 * 1000
    );

    const formattedDateTime = selectedDate.toLocaleString("de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const handleSkipBack = () => {
        setCurrentTime(0);
        setIsPlaying(false);
    };

    const handleStepBack = () => {
        setCurrentTime(Math.max(0, currentTime - 4.35)); // -1 Stunde
    };

    const handleStepForward = () => {
        setCurrentTime(Math.min(100, currentTime + 4.35)); // +1 Stunde
    };

    const handleSkipForward = () => {
        setCurrentTime(100);
        setIsPlaying(false);
    };

    const handleSliderChange = (value: number[]) => {
        setCurrentTime(value[0]);
        setIsPlaying(false);
    };

    return (
        <div className="dashboard-footer w-full rounded-[var(--radius)] bg-background overflow-hidden">
            <Card className="flex-1">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-base">
                                Zeitleiste
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-sm font-medium">
                                {formattedDateTime}
                            </div>
                            <Select
                                value={timeRange}
                                onValueChange={(value) =>
                                    setTimeRange(value as TimeRange)
                                }
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeRangeOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Zeitmarker */}
                    <div className="grid grid-cols-6 gap-1 text-xs text-muted-foreground">
                        {Array.from({ length: 6 }, (_, i) => {
                            const step = Math.floor(maxHours / 5);
                            const hour = i * step;
                            const markerDate = new Date(
                                now.getTime() -
                                    (maxHours - hour) * 60 * 60 * 1000
                            );
                            const isActive =
                                currentHour >= hour &&
                                currentHour < hour + step;

                            return (
                                <div
                                    key={i}
                                    className={`text-center transition-colors ${
                                        isActive
                                            ? "text-primary font-semibold"
                                            : ""
                                    }`}
                                >
                                    {markerDate.toLocaleDateString("de-DE", {
                                        day: "2-digit",
                                        month: "2-digit",
                                    })}{" "}
                                    {markerDate.toLocaleTimeString("de-DE", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    {/* Slider */}
                    <div className="px-1">
                        <Slider
                            value={[currentTime]}
                            onValueChange={handleSliderChange}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                        />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1.5">
                            <Button
                                onClick={handleSkipBack}
                                variant="outline"
                                size="icon-sm"
                                title="Zum Start"
                            >
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <polygon points="19 20 9 12 19 4 19 20" />
                                    <line x1="5" y1="19" x2="5" y2="5" />
                                </svg>
                            </Button>
                            <Button
                                onClick={handleStepBack}
                                disabled={currentTime === 0}
                                variant="outline"
                                size="sm"
                            >
                                -1h
                            </Button>
                            <Button
                                onClick={() => setIsPlaying(!isPlaying)}
                                size="sm"
                                variant={isPlaying ? "destructive" : "default"}
                            >
                                {isPlaying ? (
                                    <>
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <rect
                                                x="6"
                                                y="4"
                                                width="4"
                                                height="16"
                                            />
                                            <rect
                                                x="14"
                                                y="4"
                                                width="4"
                                                height="16"
                                            />
                                        </svg>
                                        <span>Pause</span>
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                        <span>Start</span>
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleStepForward}
                                disabled={currentTime === 100}
                                variant="outline"
                                size="sm"
                            >
                                +1h
                            </Button>
                            <Button
                                onClick={handleSkipForward}
                                variant="outline"
                                size="icon-sm"
                                title="Zum Ende"
                            >
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <polygon points="5 4 15 12 5 20 5 4" />
                                    <line x1="19" y1="5" x2="19" y2="19" />
                                </svg>
                            </Button>
                        </div>

                        {/* Speed Controls */}
                        <div className="flex gap-1">
                            {[
                                TimeSliderSpeed.Half,
                                TimeSliderSpeed.Normal,
                                TimeSliderSpeed.Double,
                                TimeSliderSpeed.Quadruple,
                            ].map((speed) => (
                                <Toggle
                                    key={speed}
                                    pressed={playbackSpeed === speed}
                                    onPressedChange={() =>
                                        setPlaybackSpeed(speed)
                                    }
                                    size="sm"
                                    variant="outline"
                                    className="px-2.5 text-xs font-mono"
                                >
                                    {speed}x
                                </Toggle>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
