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
}

export default function DashboardContent({ mode, selectedCountry, setRouters, setSelectedCountry }: DashboardContentProps) {
    return (
        <div className="w-full h-full">
            <Card className="dashboard-content w-full h-full bg-background">
                <CardContent className="h-full w-full">
                    {mode === "street" && <DashboardContentMap selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} setRouters={setRouters} />}
                    {mode === "hierarchy" && <DashboardContentHierarchy selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />}
                </CardContent>
            </Card>
        </div>
    );
}
