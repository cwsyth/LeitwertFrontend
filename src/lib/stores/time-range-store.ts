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

interface TimeRangeState {
    timeRange: TimeRange;
    debouncedTimeRange: TimeRange;
    preset: TimeRangePreset;
    _debounceTimer: NodeJS.Timeout | null;

    setTimeRange: (start: Date, end: Date, immediate?: boolean) => void;
    setPreset: (preset: TimeRangePreset) => void;
    getTimeRangeForAPI: () => { start: string; end: string };
}

const DEBOUNCE_MS = 500;

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
            const { start, end } = get().debouncedTimeRange;
            return {
                start: start.toISOString(),
                end: end.toISOString(),
            };
        },
    };
});
