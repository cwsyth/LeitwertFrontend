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
    Router,
} from "@/types/dashboard";
import { BgpAnnounceChart } from "./dashbord-content/components/charts/bgp-announce-chart";

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

    const [selectedCountry, setSelectedCountry] = useState<Country>({
        code: "world",
        name: "World",
    });

    const [routers, setRouters] = useState<Router[]>([]);

    const [selectedRouter, setSelectedRouter] = useState<Router | null>(null);

    return (
        <div className="dashboard-wrapper h-full flex flex-col items-center justify-center p8">
            <div className="dashboard w-full h-full flex flex-col items-center gap-3">
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
                    setRouters={setRouters}
                    setSelectedCountry={setSelectedCountry}
                />
                <DashboardFooter
                    viewVisibility={viewVisibility}
                    selectedCountry={selectedCountry}
                    routers={routers}
                    setSelectedRouter={setSelectedRouter}
                />
                {viewVisibility.bgpAnnouncements && <BgpAnnounceChart router={selectedRouter?.asn} />}
            </div>
        </div>
    );
}
