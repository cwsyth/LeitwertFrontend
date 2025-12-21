/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

"use client";

import { createContext, useContext, ReactNode, useState } from 'react';

interface TimelineContextType {
    isMinimized: boolean;
    toggleMinimized: () => void;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

export function TimelineProvider({ children }: { children: ReactNode }) {
    const [isMinimized, setIsMinimized] = useState(false);

    const toggleMinimized = () => {
        setIsMinimized(prev => !prev);
    };

    return (
        <TimelineContext.Provider value={{ isMinimized, toggleMinimized }}>
            {children}
        </TimelineContext.Provider>
    );
}

export function useTimelineContext() {
    const context = useContext(TimelineContext);
    if (!context) {
        throw new Error('useTimelineContext must be used within TimelineProvider');
    }
    return context;
}
