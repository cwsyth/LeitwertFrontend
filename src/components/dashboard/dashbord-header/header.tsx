import DashboardHeaderFilter from "./components/filter";
import DashboardHeaderOverview from "./components/overview";
import DashboardHeaderViews from "./components/views";
import { Country, DashboardViewVisibility } from "@/types/dashboard";

interface DashboardHeaderProps {
    viewVisibility: DashboardViewVisibility;
    toggleView: (view: keyof DashboardViewVisibility) => void;
    selectedCountry: Country | null;
    setSelectedCountry: React.Dispatch<React.SetStateAction<Country | null>>;
}

export default function DashboardHeader({ viewVisibility, toggleView, selectedCountry, setSelectedCountry }: DashboardHeaderProps) {
    return (
        <div className="dashboard-header w-full rounded-[var(--radius)] overflow-hidden flex gap-3 h-50">
            <DashboardHeaderOverview />
            <DashboardHeaderFilter selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />
            <DashboardHeaderViews viewVisibility={viewVisibility} toggleView={toggleView} />
        </div>
    );
}
