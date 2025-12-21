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
import { NetworkTable } from "@/components/network/network-table";
import { BgpAnnounceChart } from "./dashbord-footer/charts/bgp-announce-chart";

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
        <div className="dashboard-wrapper h-full flex gap-3">
            <div className="dashboard w-6/10 h-full flex flex-col items-center gap-3">
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
            </div>
            <div className="w-4/10">
                <NetworkTable selectedCountry={selectedCountry} />
                {//viewVisibility.bgpAnnouncements && <BgpAnnounceChart router={selectedRouter?.asn} />
                }
            </div>
        </div>
    );
}
