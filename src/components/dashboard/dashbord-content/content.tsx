import DashboardContentMap from "./components/map";
import DashboardContentHierarchy from "./components/hierarchy";
import { Country, DashboardContentMode, Router } from "@/types/dashboard";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardContentProps {
    mode: DashboardContentMode,
    selectedCountry: Country,
    setRouters: React.Dispatch<React.SetStateAction<Router[]>>
}

export default function DashboardContent({ mode, selectedCountry, setRouters }: DashboardContentProps) {
    return (
        <div className="h-180 w-full">
            <Card className="dashboard-content w-full h-full flex-1 bg-background">
                <CardContent className="h-full w-full">
                    {mode === "street" && <DashboardContentMap selectedCountry={selectedCountry} setRouters={setRouters} />}
                    {mode === "hierarchy" && <DashboardContentHierarchy />}
                </CardContent>
            </Card>
        </div>
    );
}
