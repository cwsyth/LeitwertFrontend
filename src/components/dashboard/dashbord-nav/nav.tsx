import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { DashboardContentMode } from "@/types/dashboard";
import { Map, Network } from "lucide-react";

interface DashboardNavProps {
    mode: DashboardContentMode;
    setMode: (mode: DashboardContentMode) => void;
}

export default function DashboardNav({ mode, setMode }: DashboardNavProps) {

  return (
    <div className="dashboard-nav w-full">
        <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => setMode(v as DashboardContentMode)}
            className="flex w-full items-center rounded-lg border p-1 bg-accent"
        >
            <ToggleGroupItem
                value="street"
                className="flex-1 px-3 rounded-[var(--radius)] data-[state=on]:bg-background data-[state=on]:shadow"
            >
                <Map className="mr-1 h-4 w-4" />
                Straßenkarte
            </ToggleGroupItem>

            <ToggleGroupItem
                value="hierarchy"
                className="flex-1 px-3 rounded-[var(--radius)] data-[state=on]:bg-background data-[state=on]:shadow"
            >
                <Network className="mr-1 h-4 w-4" />
                Netzwerkübersicht
            </ToggleGroupItem>

            { /* <ToggleGroupItem
                value="grid"
                className="flex-1 px-3 rounded-[var(--radius)] data-[state=on]:bg-background data-[state=on]:shadow"
            >
                <Calendar className="mr-1 h-4 w-4" />
                Zeitleiste
            </ToggleGroupItem> */ }

        </ToggleGroup>
    </div>
  );
}
