import { Country, DashboardViewVisibility, Router } from "@/types/dashboard";
import { NetworkTable } from "@/components/network/network-table";
import { BgpAnnounceChart } from "./charts/bgp-announce-chart";

interface DashboardFooterProps {
    viewVisibility: DashboardViewVisibility;
    selectedCountry: Country;
    routers: Router[];
    selectedRouter: Router | null;
    setSelectedRouter: React.Dispatch<React.SetStateAction<Router | null>>;
}

export default function DashboardFooter({ viewVisibility, selectedCountry, routers, selectedRouter, setSelectedRouter }: DashboardFooterProps) {
    return (
        <div className="dashboard-footer w-full rounded-[var(--radius)] flex flex-col gap-3">
            <NetworkTable selectedCountry={selectedCountry} routers={routers} />
            {viewVisibility.bgpAnnouncements && <BgpAnnounceChart router={selectedRouter?.asn} />}
        </div>
    );
}
