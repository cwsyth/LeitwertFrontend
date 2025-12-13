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
    selectedCountry: Country | null;
    setSelectedCountry: React.Dispatch<React.SetStateAction<Country | null>>;
}

export default function DashboardHeader({ viewVisibility, toggleView, selectedCountry, setSelectedCountry }: DashboardHeaderProps) {
    return (
        <div className="dashboard-header w-full rounded-[var(--radius)] overflow-hidden flex gap-3 items-stretch">
            <StatusCard title={"Autonome Systeme"} apiEndpoint={"/v1/router/health"} selectedCountry={selectedCountry} />
            <StatusCard title={"Router"} apiEndpoint={"/v1/router/health"} selectedCountry={selectedCountry} />
            <DashboardHeaderFilter selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />
            <DashboardHeaderViews viewVisibility={viewVisibility} toggleView={toggleView} />
        </div>
    );
}
