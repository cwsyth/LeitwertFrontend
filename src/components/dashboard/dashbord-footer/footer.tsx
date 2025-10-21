import DashboardFooterSearch from "./components/search";
import DashboardFooterStatistics from "./components/statistics";
import { DashboardViewVisibility } from "@/types/dashboard";

interface DashboardFooterProps {
    viewVisibility: DashboardViewVisibility;
}

export default function DashboardFooter({ viewVisibility }: DashboardFooterProps) {
    return (
        <div className="dashboard-footer w-full rounded-[var(--radius)] flex gap-3">
            {viewVisibility.searchResults && <DashboardFooterSearch />}
            {viewVisibility.globalStats && <DashboardFooterStatistics />}
        </div>
    );
}
