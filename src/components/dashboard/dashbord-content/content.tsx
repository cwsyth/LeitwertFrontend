import DashboardContentMap from "./components/map";
import DashboardContentHierarchy from "./components/hierarchy";
import { Country, DashboardContentMode, Router } from "@/types/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

interface DashboardContentProps {
    mode: DashboardContentMode,
    selectedCountry: Country,
    setRouters: React.Dispatch<React.SetStateAction<Router[]>>;
    setSelectedCountry: React.Dispatch<React.SetStateAction<Country>>;
    setSelectedAs: (asNumber: number) => void
    selectedAs: number;
}

export default function DashboardContent({ mode, selectedCountry, setRouters, setSelectedCountry, setSelectedAs }: DashboardContentProps) {
    return (
        <div className="w-full h-full overflow-scroll">
            <Card className="dashboard-content w-full h-full bg-background overflow-scroll">
                <CardContent className="h-full w-full ">
                    {mode === "street" && <DashboardContentMap selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} setRouters={setRouters} />}
                    {mode === "hierarchy" && <DashboardContentHierarchy
                        selectedCountry={selectedCountry}
                        setSelectedCountry={setSelectedCountry}
                        setSelectedAs={setSelectedAs}
                    />}
                </CardContent>
            </Card>
        </div>
    );
}
