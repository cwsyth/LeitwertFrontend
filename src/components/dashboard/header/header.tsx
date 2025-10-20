import DashboardHeaderFilter from "./components/filter";
import DashboardHeaderOverview from "./components/overview";
import DashboardHeaderResults from "./components/results";

export default function DashboardHeader() {
    return (
        <div className="dashboard-header w-full rounded-[var(--radius)] overflow-hidden flex gap-3 h-50">
            <DashboardHeaderOverview />
            <DashboardHeaderFilter />
            <DashboardHeaderResults />
        </div>
    );
}
