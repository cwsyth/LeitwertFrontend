"use client";

import {useState} from "react";
import DashboardHeader from "./dashbord-header/header";
import DashboardNav from "./dashbord-nav/nav";
import DashboardContent from "./dashbord-content/content";
import {
    Country,
    DashboardContentMode,
    DashboardViewVisibility,
    Router,
} from "@/types/dashboard";
import {NetworkTable} from "@/components/network-table/network-table";
import {BgpAnnounceChart} from "./dashbord-footer/charts/bgp-announce-chart";

export default function Dashboard() {
    const [mode, setMode] = useState<DashboardContentMode>("street");

    const [viewVisibility, setViewVisibility] =
        useState<DashboardViewVisibility>({
            timeline: true,
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

    const [selectedAs, setSelectedAs] = useState<number>(0);
    const [selectedRouter, setSelectedRouter] = useState<Router | null>(null);

    return (
        <div className="dashboard-wrapper h-full flex gap-3">
            <div className="dashboard w-3/5 h-full flex flex-col gap-3">
                <div className="w-full flex-shrink-0">
                    <DashboardHeader
                        viewVisibility={viewVisibility}
                        toggleView={toggleView}
                        selectedCountry={selectedCountry}
                        setSelectedCountry={setSelectedCountry}
                    />
                </div>
                <div className="w-full flex-shrink-0">
                    <DashboardNav mode={mode} setMode={setMode} />
                </div>
                <div className="w-full flex-grow min-h-0">
                    <DashboardContent
                        mode={mode}
                        selectedCountry={selectedCountry}
                        setSelectedCountry={setSelectedCountry}
                        setRouters={setRouters}
                />
                </div>
            </div>
            <div className="w-2/5 h-full flex flex-col gap-3">
                <div className="flex-1 min-h-0 overflow-auto">
                    <NetworkTable
                        selectedCountry={selectedCountry}
                        routers={routers}
                        setSelectedRouter={setSelectedRouter}
                        selectedAs={selectedAs}
                        setSelectedAs={setSelectedAs}
                    />
                </div>
                {viewVisibility.bgpAnnouncements &&
                    <div className="flex-1 min-h-0 overflow-auto">
                        <BgpAnnounceChart router={selectedRouter?.asn} selectedCountry={selectedCountry} />
                    </div>
                }
            </div>
        </div>
    );
}
