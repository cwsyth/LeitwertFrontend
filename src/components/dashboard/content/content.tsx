import DashboardContentMap from "./map/map";
import DashboardContentHierarchy from "./hierarchy/hierarchy";
import DashboardContentTimeline from "./timeline/timeline";
import { DashboardViewMode } from "@/types/dashboard";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardContentProps {
    mode: DashboardViewMode;
}

export default function DashboardContent({ mode }: DashboardContentProps) {
    return (
        <Card className="dashboard-content w-full flex-1 bg-background">
            <CardContent className="h-full w-full">
                {mode === "street" && <DashboardContentMap />}
                {mode === "hierarchy" && <DashboardContentHierarchy />}
                {mode === "grid" && <DashboardContentTimeline />}
            </CardContent>
        </Card>
    );
}
