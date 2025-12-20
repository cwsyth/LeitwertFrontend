/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {create} from 'zustand';
import {TimeRange, TimeRangePreset, WindowSize} from '@/types/time-range';

interface TimeRangeState {
    // Time range selection
    timeRange: TimeRange;
    preset: TimeRangePreset;

    // Playback controls
    isPlaying: boolean;
    playbackSpeed: number;
    playbackPosition: Date | null;
    windowSize: WindowSize;

    // Private interval timer (prefix _ indicates internal use only)
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

// Calculate playback step size based on window size and speed multiplier
const getStepSize = (windowSize: WindowSize, speed: number): number => {
    const baseStepMs = {
        small: 60 * 1000,                    // 1 minute
        medium: 60 * 60 * 1000,              // 1 hour
        large: 24 * 60 * 60 * 1000,          // 1 day
    }[windowSize];

    return baseStepMs * speed;
};

export const useTimeRangeStore = create<TimeRangeState>((set, get) => {
    const now = new Date();
    const initialStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return {
        timeRange: {start: initialStart, end: now},
        preset: TimeRangePreset.SMALL,
        isPlaying: false,
        playbackSpeed: 1,
        playbackPosition: null,
        windowSize: 'small',
        _playbackTimer: null,

        setTimeRange: (start, end) => {
            set({
                timeRange: {start, end},
                preset: TimeRangePreset.CUSTOM
            });
        },

        setPreset: (preset) => {
            if (preset === TimeRangePreset.CUSTOM) return;

            const now = new Date();
            const startOffsets: Record<Exclude<TimeRangePreset, TimeRangePreset.CUSTOM>, number> = {
                [TimeRangePreset.SMALL]: 24 * 60 * 60 * 1000,      // 1 day
                [TimeRangePreset.MEDIUM]: 7 * 24 * 60 * 60 * 1000, // 7 days
                [TimeRangePreset.LARGE]: 14 * 24 * 60 * 60 * 1000, // 14 days
            };

            const offset = startOffsets[preset];
            const start = new Date(now.getTime() - offset);

            set({preset});
            get().setTimeRange(start, now);
        },

        togglePlayback: () => {
            const state = get();

            if (state.isPlaying) {
                // Pause playback
                if (state._playbackTimer) {
                    clearInterval(state._playbackTimer);
                }

                set({
                    isPlaying: false,
                    _playbackTimer: null
                });
            } else {
                // Start playback
                if (state._playbackTimer) {
                    clearInterval(state._playbackTimer);
                }

                const initialStepMs = getStepSize(state.windowSize, 1);

                // Resume from current position or start from beginning
                const startPosition = state.playbackPosition
                    ? new Date(state.playbackPosition.getTime())
                    : new Date(state.timeRange.start.getTime() + initialStepMs);

                set({
                    isPlaying: true,
                    playbackPosition: startPosition
                });

                // Advance playback position every second
                const timer = setInterval(() => {
                    const currentState = get();

                    if (!currentState.isPlaying) {
                        clearInterval(timer);
                        return;
                    }

                    const stepMs = getStepSize(currentState.windowSize, currentState.playbackSpeed);
                    const current = currentState.playbackPosition!;
                    const nextPosition = new Date(current.getTime() + stepMs);

                    // Loop back to start if end is reached
                    if (nextPosition > currentState.timeRange.end) {
                        const resetStepMs = getStepSize(currentState.windowSize, 1);
                        const newPosition = new Date(currentState.timeRange.start.getTime() + resetStepMs);

                        set({playbackPosition: newPosition});
                        return;
                    }

                    set({playbackPosition: nextPosition});
                }, 1000 / state.playbackSpeed);

                set({_playbackTimer: timer});
            }
        },

        setPlaybackSpeed: (speed) => {
            const state = get();
            const wasPlaying = state.isPlaying;

            set({playbackSpeed: speed});

            // Restart playback with new speed if currently playing
            if (wasPlaying) {
                get().togglePlayback(); // Pause
                // Small delay to ensure clean state transition
                setTimeout(() => get().togglePlayback(), 10); // Resume
            }
        },

        setPlaybackPosition: (position: Date) => {
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

            set({playbackPosition: position});
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
            set({windowSize: size});
        }
    };
});
