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
            <div className="flex-1">
                <AnomalyCard
                    title={"Autonomous Systems (AS)"}
                    description={"Total number of detected AS anomalies within the selected country and time range."}
                    apiEndpoint={"/v1/networks/health"}
                    selectedCountry={selectedCountry}
                />
            </div>
            <div className="flex-1">
                <AnomalyCard
                    title={"Routers"}
                    description={"Total number of detected router anomalies within the selected country and time range."}
                    apiEndpoint={"/v1/router/health"}
                    selectedCountry={selectedCountry}
                />

            </div>
            <div className="flex-1">
                <DashboardHeaderFilter selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />
            </div>
            <div className="flex-1">
                <DashboardHeaderViews viewVisibility={viewVisibility} toggleView={toggleView} />
            </div>
        </div>
    );
}
