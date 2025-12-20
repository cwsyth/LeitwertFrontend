/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import { create } from 'zustand';
import { WindowSize, TimeRangePreset, TimeRange } from '@/types/time-range';

interface TimeRangeState {
    // Zeitbereich
    timeRange: TimeRange;
    preset: TimeRangePreset;

    // Playback
    isPlaying: boolean;
    playbackSpeed: number;
    playbackPosition: Date | null;
    windowSize: WindowSize;

    // Private Timer
    _playbackTimer: NodeJS.Timeout | null;

    // Actions
    setTimeRange: (start: Date, end: Date) => void;
    setPreset: (preset: TimeRangePreset) => void;
    togglePlayback: () => void;
    setPlaybackSpeed: (speed: number) => void;
    setPlaybackPosition: (position: Date) => void;
    resetPlayback: () => void;
    setWindowSize: (size: WindowSize) => void;
}

const getStepSize = (windowSize: WindowSize, speed: number): number => {
    const baseStepMs = {
        small: 60 * 1000,                    // 1 Minute
        medium: 60 * 60 * 1000,              // 1 Stunde
        large: 24 * 60 * 60 * 1000,          // 1 Tag
    }[windowSize];

    return baseStepMs * speed;
};

export const useTimeRangeStore = create<TimeRangeState>((set, get) => {
    const now = new Date();
    const initialStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return {
        timeRange: { start: initialStart, end: now },
        preset: TimeRangePreset.SMALL,
        isPlaying: false,
        playbackSpeed: 1,
        playbackPosition: null,
        windowSize: 'small',
        _playbackTimer: null,

        setTimeRange: (start, end) => {
            set({
                timeRange: { start, end },
                preset: TimeRangePreset.CUSTOM
            });
        },

        setPreset: (preset) => {
            if (preset === TimeRangePreset.CUSTOM) return;

            const now = new Date();
            const startOffsets: Record<Exclude<TimeRangePreset, TimeRangePreset.CUSTOM>, number> = {
                [TimeRangePreset.SMALL]: 24 * 60 * 60 * 1000,      // 1 Tag
                [TimeRangePreset.MEDIUM]: 7 * 24 * 60 * 60 * 1000, // 7 Tage
                [TimeRangePreset.LARGE]: 14 * 24 * 60 * 60 * 1000, // 14 Tage
            };

            const offset = startOffsets[preset];
            const start = new Date(now.getTime() - offset);

            set({ preset });
            get().setTimeRange(start, now);
        },

        togglePlayback: () => {
            const state = get();

            if (state._playbackTimer) {
                clearInterval(state._playbackTimer);
            }

            const initialStepMs = getStepSize(state.windowSize, 1);

            const startPosition = state.playbackPosition
                ? new Date(state.playbackPosition.getTime())
                : new Date(state.timeRange.start.getTime() + initialStepMs);

            set({
                isPlaying: true,
                playbackPosition: startPosition
            });

            const timer = setInterval(() => {
                const currentState = get();

                if (!currentState.isPlaying) {
                    clearInterval(timer);
                    return;
                }

                const stepMs = getStepSize(currentState.windowSize, currentState.playbackSpeed);
                const current = currentState.playbackPosition!;
                const nextPosition = new Date(current.getTime() + stepMs);

                if (nextPosition > currentState.timeRange.end) {
                    const resetStepMs = getStepSize(currentState.windowSize, 1);
                    const newPosition = new Date(currentState.timeRange.start.getTime() + resetStepMs);

                    set({ playbackPosition: newPosition });
                    return;
                }

                set({ playbackPosition: nextPosition });
            }, 1000 / state.playbackSpeed);

            set({ _playbackTimer: timer });
        },

        pausePlayback: () => {
            const state = get();

            // Pause if playing to allow manual scrubbing
            if (state.isPlaying) {
                if (state._playbackTimer) {
                    clearInterval(state._playbackTimer);
                }
                set({
                    isPlaying: false,
                    _playbackTimer: null
                });
            }

            set({ playbackPosition: position });
        },

        resetPlayback: () => {
            const state = get();

            if (state._playbackTimer) {
                clearInterval(state._playbackTimer);
            }

            set({
                isPlaying: false,
                playbackPosition: null,
                _playbackTimer: null
            });
        },

        setWindowSize: (size: WindowSize) => {
            set({ windowSize: size });
        }
    };
});
