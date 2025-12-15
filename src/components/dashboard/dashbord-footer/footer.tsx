import DashboardFooterSearch from "./components/search";
import { Country, DashboardViewVisibility, Router } from "@/types/dashboard";
import { NetworkTable } from "@/components/network/network-table";

interface DashboardFooterProps {
    viewVisibility: DashboardViewVisibility;
    selectedCountry: Country;
    routers: Router[];
    setSelectedRouter: React.Dispatch<React.SetStateAction<Router | null>>;
}

export default function DashboardFooter({ viewVisibility, selectedCountry, routers, setSelectedRouter }: DashboardFooterProps) {
    return (
        <div className="dashboard-footer w-full rounded-[var(--radius)] flex flex-col gap-3">
            {(viewVisibility.searchResults || viewVisibility.globalStats) && (
                <div className="flex gap-3 h-[500px]">
                    {viewVisibility.searchResults && (
                        <DashboardFooterSearch selectedCountry={selectedCountry} routers={routers} setSelectedRouter={setSelectedRouter} />
                    )}
                </div>
            )}
            {selectedCountry.code !== 'world' && (
                <NetworkTable selectedCountry={selectedCountry} />
            )}
        </div>
    );
}
