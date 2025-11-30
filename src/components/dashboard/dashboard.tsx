"use client";

import { useState } from "react";
import DashboardHeader from "./dashbord-header/header";
import DashboardNav from "./dashbord-nav/nav";
import DashboardContent from "./dashbord-content/content";
import DashboardTimeline from "./dashbord-timeline/timeline";
import DashboardFooter from "./dashbord-footer/footer";
import {
    DashboardContentMode,
    DashboardViewVisibility,
} from "@/types/dashboard";
import { BgpAnnounceChart } from "./dashbord-content/components/charts/bgp-announce-chart";
import { AnomalyChart } from "./dashbord-content/components/charts/anomaly-chart";

export default function Dashboard() {
    const [mode, setMode] = useState<DashboardContentMode>("street");
    const [viewVisibility, setViewVisibility] =
        useState<DashboardViewVisibility>({
            timeline: true,
            searchResults: true,
            globalStats: true,
            bgpAnnouncements: false,
            anomalies: false,
        });

    const toggleView = (view: keyof DashboardViewVisibility) => {
        setViewVisibility((prev) => ({
            ...prev,
            [view]: !prev[view],
        }));
    };

    return (
        <div className="dashboard-wrapper h-full flex flex-col items-center justify-center p8">
            <div className="dashboard w-full h-full flex flex-col items-center gap-3">
                <DashboardHeader
                    viewVisibility={viewVisibility}
                    toggleView={toggleView}
                />
                <DashboardNav mode={mode} setMode={setMode} />
                <DashboardContent mode={mode} />
                {viewVisibility.bgpAnnouncements && <BgpAnnounceChart />}
                {viewVisibility.anomalies && <AnomalyChart />}
                {viewVisibility.timeline && <DashboardTimeline />}
                <DashboardFooter viewVisibility={viewVisibility} />
            </div>
        </div>
    );
}
