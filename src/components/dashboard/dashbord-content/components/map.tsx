'use client';

import React from 'react';
import { useState } from 'react';
import { MapPin } from "lucide-react";
import RouterPin from '@/components/dashboard/dashbord-content/components/router-pin';

export default function DashboardContentMap() {
    return (
        <div className="dashboard-map w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden rounded-[var(--radius)]">
            <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                    {Array.from({ length: 64 }).map((_, i) => (
                        <div key={i} className="border border-gray-600" />
                    ))}
                </div>
            </div>

            <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                <RouterPin routerId={"rid-42835843790269319330715382585"} />
            </div>
            <div className="absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2">
                <RouterPin routerId={"rid-95827364019283746501928374650"} />
            </div>
            <div className="absolute top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <RouterPin routerId={"rid-34829105738291057382910573829"} />
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button className="bg-slate-700 text-white shadow-lg rounded p-2 hover:bg-slate-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
                <button className="bg-slate-700 text-white shadow-lg rounded p-2 hover:bg-slate-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                </button>
            </div>

            <div className="absolute bottom-4 left-4 bg-slate-700 text-white shadow-lg rounded-lg p-3 text-sm">
                <div className="font-semibold">Deutschland</div>
                <div className="text-slate-300 text-xs">Interaktive Karte</div>
            </div>
        </div>
    );
}
