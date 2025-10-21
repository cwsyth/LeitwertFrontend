import DashboardFooterSearch from "./components/search";
import DashboardFooterStatistics from "./components/statistics";
import { DashboardViewVisibility } from "@/types/dashboard";

interface DashboardFooterProps {
    viewVisibility: DashboardViewVisibility;
}

export default function DashboardFooter({ viewVisibility }: DashboardFooterProps) {
    return (
        <div className="dashboard-footer w-full rounded-[var(--radius)] flex gap-3 h-90">
            {viewVisibility.searchResults ? (
                <DashboardFooterSearch />
            ) : (
                <div className="flex-7" />
            )}
            {viewVisibility.globalStats ? (
                <DashboardFooterStatistics />
            ) : (
                <div className="flex-4" />
            )}
        </div>
    );
}
