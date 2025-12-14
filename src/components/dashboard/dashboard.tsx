"use client";

import { useState } from "react";
import DashboardHeader from "./dashbord-header/header";
import DashboardNav from "./dashbord-nav/nav";
import DashboardContent from "./dashbord-content/content";
import DashboardFooter from "./dashbord-footer/footer";
import {
    DashboardContentMode,
    DashboardViewVisibility,
    Country,
} from "@/types/dashboard";
import { BgpAnnounceChart } from "./dashbord-content/components/charts/bgp-announce-chart";
import dynamic from "next/dynamic";
import {Skeleton} from "@/components/ui/skeleton";

export default function Dashboard() {
    const [mode, setMode] = useState<DashboardContentMode>("street");
    const [viewVisibility, setViewVisibility] =
        useState<DashboardViewVisibility>({
            timeline: true,
            searchResults: true,
            globalStats: true,
            bgpAnnouncements: true,
        });

    const toggleView = (view: keyof DashboardViewVisibility) => {
        setViewVisibility((prev) => ({
            ...prev,
            [view]: !prev[view],
        }));
    };

    const [selectedCountry, setSelectedCountry] = useState<Country | null>({
        code: "world",
        name: "World",
    });

    const TimeRangeSelector = dynamic(
        () => import('./dashbord-timeline/timeline'),
        {
            ssr: false,
            loading: () => (
                <div className="flex items-center justify-end w-full">
                    <Skeleton className="h-9 w-55" />
                </div>
            )
        }
    );

    return (
        <div className="dashboard-wrapper h-full flex flex-col items-center justify-center p8">
            <div className="dashboard w-full h-full flex flex-col items-center gap-3">
                <TimeRangeSelector />
                <DashboardHeader
                    viewVisibility={viewVisibility}
                    toggleView={toggleView}
                    selectedCountry={selectedCountry}
                    setSelectedCountry={setSelectedCountry}
                />
                <DashboardNav mode={mode} setMode={setMode} />
                <DashboardContent
                    mode={mode}
                    selectedCountry={selectedCountry}
                    setSelectedCountry={setSelectedCountry}
                />
                {viewVisibility.bgpAnnouncements && <BgpAnnounceChart />}
                <DashboardFooter viewVisibility={viewVisibility} />
            </div>
        </div>
    );
}
