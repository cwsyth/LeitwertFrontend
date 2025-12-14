import DashboardFooterSearch from "./components/search";
import { Country, DashboardViewVisibility, Router } from "@/types/dashboard";

interface DashboardFooterProps {
    viewVisibility: DashboardViewVisibility;
    selectedCountry: Country;
    routers: Router[];
    setSelectedRouter: React.Dispatch<React.SetStateAction<Router | null>>;
}

export default function DashboardFooter({ viewVisibility, selectedCountry, routers, setSelectedRouter }: DashboardFooterProps) {
    if (!viewVisibility.searchResults && !viewVisibility.globalStats) {
        return null;
    }

    return (
        <div className="dashboard-footer w-full rounded-[var(--radius)] flex gap-3 h-[500px]">
            {viewVisibility.searchResults ? (
                <DashboardFooterSearch selectedCountry={selectedCountry} routers={routers} setSelectedRouter={setSelectedRouter} />
            ) : (
                null
            )}
        </div>
    );
}
