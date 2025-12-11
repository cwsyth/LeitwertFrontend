import { create } from 'zustand';

export enum TimeRangePreset {
    SMALL = '1d',
    MEDIUM = '7d',
    LARGE = '14d',
    CUSTOM = 'custom'
}

interface TimeRange {
    start: Date;
    end: Date;
}

export interface GranularityConfig {
    minAge: number;
    maxAge: number;
    stepMinutes: number;
    windowMinutes: number;
    label: string;
}

export const GRANULARITY_LEVELS: GranularityConfig[] = [
    { minAge: 0, maxAge: 7, stepMinutes: 1, windowMinutes: 60, label: 'Minütlich' },
    { minAge: 7, maxAge: 14, stepMinutes: 60, windowMinutes: 1440, label: 'Stündlich' },
    { minAge: 14, maxAge: Infinity, stepMinutes: 1440, windowMinutes: 10080, label: 'Täglich' }
];

interface TimeRangeState {
    timeRange: TimeRange;
    debouncedTimeRange: TimeRange;
    preset: TimeRangePreset;
    _debounceTimer: NodeJS.Timeout | null;
    isPlaying: boolean;
    playbackSpeed: number;
    playbackPosition: Date | null;
    playbackWindow: TimeRange | null;
    _playbackTimer: NodeJS.Timeout | null;

    setTimeRange: (start: Date, end: Date, immediate?: boolean) => void;
    setPreset: (preset: TimeRangePreset) => void;
    getTimeRangeForAPI: () => { start: string; end: string };

    startPlayback: () => void;
    pausePlayback: () => void;
    setPlaybackSpeed: (speed: number) => void;
    setPlaybackPosition: (position: Date) => void;
    resetPlayback: () => void;
}

const DEBOUNCE_MS = 500;

function getAgeInDays(date: Date): number {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return diffMs / (1000 * 60 * 60 * 24);
}

function getGranularityForDate(date: Date): GranularityConfig {
    const age = getAgeInDays(date);
    return GRANULARITY_LEVELS.find(
        level => age >= level.minAge && age < level.maxAge
    ) || GRANULARITY_LEVELS[GRANULARITY_LEVELS.length - 1];
}

export const useTimeRangeStore = create<TimeRangeState>((set, get) => {
    const now = new Date();
    const initialStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return {
        timeRange: {
            start: initialStart,
            end: now,
        },
        debouncedTimeRange: {
            start: initialStart,
            end: now,
        },
        preset: TimeRangePreset.SMALL,
        _debounceTimer: null,

        isPlaying: false,
        playbackSpeed: 1,
        playbackPosition: null,
        playbackWindow: null,
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
            const now = new Date();
            let start: Date;

            switch (preset) {
                case TimeRangePreset.SMALL:
                    start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case TimeRangePreset.MEDIUM:
                    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case TimeRangePreset.LARGE:
                    start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    return;
            }

            set({ preset });
            get().setTimeRange(start, now, true);
        },

        getTimeRangeForAPI: () => {
            const state = get();

            // Wenn Playback aktiv, nutze playbackWindow
            if (state.playbackWindow) {
                return {
                    start: state.playbackWindow.start.toISOString(),
                    end: state.playbackWindow.end.toISOString(),
                };
            }

            // Sonst nutze debouncedTimeRange
            const { start, end } = state.debouncedTimeRange;
            return {
                start: start.toISOString(),
                end: end.toISOString(),
            };
        },

        startPlayback: () => {
            const state = get();

            if (state._playbackTimer) {
                clearInterval(state._playbackTimer);
            }

            const windowEnd = state.playbackPosition
                ? new Date(state.playbackPosition.getTime())
                : new Date(state.timeRange.start.getTime() + 60000);

            const windowStart = new Date(windowEnd.getTime() - 60000);

            console.log('Playback start');
            console.log('Period:', state.timeRange.start, '-', state.timeRange.end);
            console.log('Initial window:', windowStart, '-', windowEnd);

            set({
                isPlaying: true,
                playbackPosition: windowEnd,
                playbackWindow: {
                    start: windowStart,
                    end: windowEnd
                }
            });

            const timer = setInterval(() => {
                const currentState = get();

                if (!currentState.isPlaying) {
                    clearInterval(timer);
                    return;
                }

                const current = currentState.playbackPosition!;

                const nextStart = new Date(current.getTime() + 60000);
                const nextEnd = new Date(nextStart.getTime() + 60000);

                console.log('Next window:', nextStart, '-', nextEnd);

                if (nextEnd > currentState.timeRange.end) {
                    console.log('Playback end');

                    const newPosition = new Date(currentState.timeRange.start.getTime() + 60000);

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
                    playbackWindow: {
                        start: nextStart,
                        end: nextEnd
                    }
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

                setTimeout(() => {
                    get().startPlayback();
                }, 10);
            }
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

        setPlaybackPosition: (position: Date) => {
            if (get().isPlaying) {
                get().pausePlayback();
            }

            set({
                playbackPosition: position,
                playbackWindow: null
            });
        },
    };
});
