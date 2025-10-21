import DashboardHeaderFilter from "./components/filter";
import DashboardHeaderOverview from "./components/overview";
import DashboardHeaderResults from "./components/results";
import { DashboardViewVisibility } from "@/types/dashboard";

interface DashboardHeaderProps {
    viewVisibility: DashboardViewVisibility;
    toggleView: (view: keyof DashboardViewVisibility) => void;
}

export default function DashboardHeader({ viewVisibility, toggleView }: DashboardHeaderProps) {
    return (
        <div className="dashboard-header w-full rounded-[var(--radius)] overflow-hidden flex gap-3 h-50">
            <DashboardHeaderOverview />
            <DashboardHeaderFilter />
            <DashboardHeaderResults viewVisibility={viewVisibility} toggleView={toggleView} />
        </div>
    );
}
