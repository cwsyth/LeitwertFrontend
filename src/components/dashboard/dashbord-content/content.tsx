import DashboardContentMap from "./components/map";
import DashboardContentHierarchy from "./components/hierarchy";
import { DashboardContentMode } from "@/types/dashboard";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardContentProps {
    mode: DashboardContentMode;
}

export default function DashboardContent({ mode }: DashboardContentProps) {
    return (
        <div className="h-180 w-full">
            <Card className="dashboard-content w-full h-full flex-1 bg-background">
                <CardContent className="h-full w-full">
                    {mode === "street" && <DashboardContentMap />}
                    {mode === "hierarchy" && <DashboardContentHierarchy />}
                </CardContent>
            </Card>
        </div>
    );
}
