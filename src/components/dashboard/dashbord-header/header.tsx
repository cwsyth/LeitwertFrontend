import DashboardHeaderFilter from "./components/filter";
import DashboardHeaderViews from "./components/views";
import { Country, DashboardViewVisibility } from "@/types/dashboard";
import React from "react";
import AnomalyCard from "./cards/anomaly-card";

interface DashboardHeaderProps {
    viewVisibility: DashboardViewVisibility;
    toggleView: (view: keyof DashboardViewVisibility) => void;
    selectedCountry: Country;
    setSelectedCountry: React.Dispatch<React.SetStateAction<Country>>;
}

export default function DashboardHeader({ viewVisibility, toggleView, selectedCountry, setSelectedCountry }: DashboardHeaderProps) {
    return (
        <div className="dashboard-header w-full rounded-[var(--radius)] overflow-hidden flex gap-3 items-stretch">
            <AnomalyCard title={"Autonomous Systems (AS)"} description={"(Country)"} apiEndpoint={"/v1/networks/health"} selectedCountry={selectedCountry} />
            <AnomalyCard title={"Routers"} description={"(Country)"} apiEndpoint={"/v1/router/health"} selectedCountry={selectedCountry} />
            <DashboardHeaderFilter selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />
            <DashboardHeaderViews viewVisibility={viewVisibility} toggleView={toggleView} />
        </div>
    );
}
