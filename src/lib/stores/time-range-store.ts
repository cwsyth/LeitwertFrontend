import { create } from 'zustand';
import { WindowSize, TimeRangePreset, TimeRange } from '@/types/time-range';

interface TimeRangeState {
    // Zeitbereich
    timeRange: TimeRange;
    debouncedTimeRange: TimeRange;
    preset: TimeRangePreset;

    // Playback
    isPlaying: boolean;
    playbackSpeed: number;
    playbackPosition: Date | null;
    playbackWindow: TimeRange | null;
    windowSize: WindowSize;

    // Private Timer
    _debounceTimer: NodeJS.Timeout | null;
    _playbackTimer: NodeJS.Timeout | null;

    // Actions
    setTimeRange: (start: Date, end: Date, immediate?: boolean) => void;
    setPreset: (preset: TimeRangePreset) => void;
    getTimeRangeForAPI: () => { start: string; end: string };
    startPlayback: () => void;
    pausePlayback: () => void;
    setPlaybackSpeed: (speed: number) => void;
    setPlaybackPosition: (position: Date) => void;
    resetPlayback: () => void;
    setWindowSize: (size: WindowSize) => void;
}

const DEBOUNCE_MS = 500;

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
        debouncedTimeRange: { start: initialStart, end: now },
        preset: TimeRangePreset.SMALL,
        isPlaying: false,
        playbackSpeed: 1,
        playbackPosition: null,
        playbackWindow: null,
        windowSize: 'small',
        _debounceTimer: null,
        _playbackTimer: null,

        setTimeRange: (start, end, immediate = false) => {
            const state = get();

            if (state._debounceTimer) {
                clearTimeout(state._debounceTimer);
            }

            set({
                timeRange: { start, end },
                preset: TimeRangePreset.CUSTOM
            });

            if (immediate) {
                set({ debouncedTimeRange: { start, end } });
            } else {
                const timer = setTimeout(() => {
                    set({ debouncedTimeRange: { start, end } });
                }, DEBOUNCE_MS);
                set({ _debounceTimer: timer });
            }
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
            get().setTimeRange(start, now, true);
        },

        getTimeRangeForAPI: () => {
            const state = get();

            if (state.playbackWindow) {
                return {
                    start: state.playbackWindow.start.toISOString(),
                    end: state.playbackWindow.end.toISOString(),
                };
            }

            return {
                start: state.debouncedTimeRange.start.toISOString(),
                end: state.debouncedTimeRange.end.toISOString(),
            };
        },

        startPlayback: () => {
            const state = get();

            if (state._playbackTimer) {
                clearInterval(state._playbackTimer);
            }

            const initialStepMs = getStepSize(state.windowSize, 1);

            const windowEnd = state.playbackPosition
                ? new Date(state.playbackPosition.getTime())
                : new Date(state.timeRange.start.getTime() + initialStepMs);

            const windowStart = new Date(windowEnd.getTime() - initialStepMs);

            set({
                isPlaying: true,
                playbackPosition: windowEnd,
                playbackWindow: { start: windowStart, end: windowEnd }
            });

            const timer = setInterval(() => {
                const currentState = get();

                if (!currentState.isPlaying) {
                    clearInterval(timer);
                    return;
                }

                const stepMs = getStepSize(currentState.windowSize, currentState.playbackSpeed);
                const current = currentState.playbackPosition!;
                const nextStart = new Date(current.getTime());
                const nextEnd = new Date(nextStart.getTime() + stepMs);

                if (nextEnd > currentState.timeRange.end) {
                    const resetStepMs = getStepSize(currentState.windowSize, 1);
                    const newPosition = new Date(currentState.timeRange.start.getTime() + resetStepMs);

                    set({
                        playbackPosition: newPosition,
                        playbackWindow: {
                            start: currentState.timeRange.start,
                            end: newPosition
                        }
                    });
                    return;
                }

                set({
                    playbackPosition: nextEnd,
                    playbackWindow: { start: nextStart, end: nextEnd }
                });
            }, 1000 / state.playbackSpeed);

            set({ _playbackTimer: timer });
        },

        pausePlayback: () => {
            const state = get();

            if (state._playbackTimer) {
                clearInterval(state._playbackTimer);
            }

            set({
                isPlaying: false,
                _playbackTimer: null
            });
        },

        setPlaybackSpeed: (speed) => {
            const wasPlaying = get().isPlaying;
            const currentPosition = get().playbackPosition;

            set({ playbackSpeed: speed });

            if (wasPlaying && currentPosition) {
                get().pausePlayback();
                setTimeout(() => get().startPlayback(), 10);
            }
        },

        setPlaybackPosition: (position: Date) => {
            if (get().isPlaying) {
                get().pausePlayback();
            }

            set({
                playbackPosition: position,
                playbackWindow: null
            });
        },

        resetPlayback: () => {
            const state = get();

            if (state._playbackTimer) {
                clearInterval(state._playbackTimer);
            }

            set({
                isPlaying: false,
                playbackPosition: null,
                playbackWindow: null,
                _playbackTimer: null
            });
        },

        setWindowSize: (size: WindowSize) => {
            set({ windowSize: size });
        }
    };
});
