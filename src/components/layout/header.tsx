"use client";

import { Router, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimelineContext } from "@/contexts/timeline-context";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const TimeRangeSelector = dynamic(
    () => import('@/components/timeline/timeline'),
    { ssr: false }
);

export default function Header() {
    const { isMinimized, toggleMinimized } = useTimelineContext();

    return (
        <header className="main-header sticky top-0 z-50 flex items-center justify-center
                p-5 bg-stone-900/80 backdrop-blur-md border border-white/10 rounded-xl px-5 py-4 shadow-xl">
            <div className="max-w-[var(--content-max-width)] w-full pl-7 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {/* Logo */}
                    <div className="w-10 h-10 rounded-[var(--radius)] bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <Router className="w-6 h-6 text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Lagebild Dashboard
                    </h1>
                </div>

                {/* Timeline Section */}
                <div className="flex items-center gap-2">
                    <AnimatePresence>
                        {!isMinimized && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, width: 0 }}
                                animate={{ opacity: 1, x: 0, width: "auto" }}
                                exit={{ opacity: 0, x: 20, width: 0 }}
                                transition={{
                                    duration: 0.4,
                                    ease: [0.4, 0, 0.2, 1]
                                }}
                                className="overflow-hidden"
                            >
                                <TimeRangeSelector />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Toggle Button */}
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMinimized}
                            className="text-white hover:bg-white/10 transition-colors"
                        >
                            <motion.div
                                animate={{ rotate: isMinimized ? 0 : 180 }}
                                transition={{ duration: 0.3 }}
                            >
                                {isMinimized ? (
                                    <ChevronLeft className="w-5 h-5" />
                                ) : (
                                    <ChevronRight className="w-5 h-5" />
                                )}
                            </motion.div>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </header>
    );
}
