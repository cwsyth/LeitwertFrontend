import DashboardHeaderFilter from "./components/filter";
import DashboardHeaderViews from "./components/views";
import { Country, DashboardViewVisibility } from "@/types/dashboard";
import React from "react";
import {
    StatusCard
} from "@/components/dashboard/dashbord-content/cards/status-card";

interface DashboardHeaderProps {
    viewVisibility: DashboardViewVisibility;
    toggleView: (view: keyof DashboardViewVisibility) => void;
    selectedCountry: Country;
    setSelectedCountry: React.Dispatch<React.SetStateAction<Country>>;
}

export default function DashboardHeader({ viewVisibility, toggleView, selectedCountry, setSelectedCountry }: DashboardHeaderProps) {
    return (
        <div className="dashboard-header w-full rounded-[var(--radius)] overflow-hidden flex gap-3 items-stretch">
            <div className="flex-3">
                <StatusCard title={"Autonome Systeme"} description={"(Land)"} apiEndpoint={"/v1/networks/health"} selectedCountry={selectedCountry} />
            </div>
            <div className="flex-3">
                <StatusCard title={"Router"} description={"(Land)"} apiEndpoint={"/v1/router/health"} selectedCountry={selectedCountry} />
            </div>
            <DashboardHeaderFilter selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />
            <DashboardHeaderViews viewVisibility={viewVisibility} toggleView={toggleView} />
        </div>
    );
}
