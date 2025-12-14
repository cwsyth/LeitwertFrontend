import DashboardContentMap from "./components/map";
import DashboardContentHierarchy from "./components/hierarchy";
import { Country, DashboardContentMode } from "@/types/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

interface DashboardContentProps {
    mode: DashboardContentMode;
    selectedCountry: Country | null;
    setSelectedCountry: React.Dispatch<React.SetStateAction<Country | null>>;
}

export default function DashboardContent({ mode, selectedCountry, setSelectedCountry }: DashboardContentProps) {
    return (
        <div className={mode === "street" ? "h-180 w-full" : "w-full"}>
            <Card className="dashboard-content w-full h-full flex-1 bg-background">
                <CardContent className="h-full w-full">
                    {mode === "street" && <DashboardContentMap selectedCountry={selectedCountry} />}
                    {mode === "hierarchy" && <DashboardContentHierarchy selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />}
                </CardContent>
            </Card>
        </div>
    );
}
