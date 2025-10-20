import DashboardContentMap from "./map/map";
import DashboardContentHierarchy from "./hierarchy/hierarchy";
import DashboardContentTimeline from "./timeline/timeline";
import { DashboardViewMode } from "@/types/dashboard";

interface DashboardContentProps {
    mode: DashboardViewMode;
}

export default function DashboardContent({ mode }: DashboardContentProps) {
    return (
        <div className="dashboard-content w-full flex-1 rounded-[var(--radius)] bg-background overflow-hidden">
            {mode === "street" && <DashboardContentMap />}
            {mode === "hierarchy" && <DashboardContentHierarchy />}
            {mode === "grid" && <DashboardContentTimeline />}
        </div>
    );
}
