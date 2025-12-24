/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {Button} from "@/components/ui/button";
import {Gauge, Pause, Play} from "lucide-react";

interface PlaybackControlsProps {
    isPlaying: boolean;
    playbackSpeed: number;
    onPlayPause: () => void;
    onSpeedChange: () => void;
}

export function PlaybackControls({
                                     isPlaying,
                                     playbackSpeed,
                                     onPlayPause,
                                     onSpeedChange,
                                 }: PlaybackControlsProps) {
    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onPlayPause}>
                {isPlaying ? (
                    <Pause className="h-4 w-4"/>
                ) : (
                    <Play className="h-4 w-4"/>
                )}
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={onSpeedChange}
                className="gap-2 min-w-[4rem]"
            >
                <Gauge className="h-4 w-4"/>
                {playbackSpeed}x
            </Button>
        </div>
    );
}
