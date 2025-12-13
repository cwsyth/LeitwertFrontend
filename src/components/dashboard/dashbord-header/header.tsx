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
            <StatusCard title={"Autonome Systeme"} apiEndpoint={"http://localhost:5001/api/v1/router/health"} />
            <StatusCard title={"Router"} apiEndpoint={"http://localhost:5001/api/v1/router/health"} />
            <DashboardHeaderFilter selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />
            <DashboardHeaderViews viewVisibility={viewVisibility} toggleView={toggleView} />
        </div>
    );
}
