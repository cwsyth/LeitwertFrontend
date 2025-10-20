import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { DashboardViewMode } from "@/types/dashboard";

interface DashboardNavProps {
    mode: DashboardViewMode;
    setMode: (mode: DashboardViewMode) => void;
}

export default function DashboardNav({ mode, setMode }: DashboardNavProps) {

  return (
    <div className="dashboard-nav w-full">
        <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => v && setMode(v as DashboardViewMode)}
            className="flex w-full items-center rounded-lg border bg-muted p-1 bg-stone-200"
        >
            <ToggleGroupItem
                value="street"
                className="flex-1 px-3 rounded-[var(--radius)] data-[state=on]:bg-background data-[state=on]:shadow"
            >
                Straßenkarte
            </ToggleGroupItem>

            <ToggleGroupItem
                value="hierarchy"
                className="flex-1 px-3 rounded-[var(--radius)] data-[state=on]:bg-background data-[state=on]:shadow"
            >
                Hierarchie
            </ToggleGroupItem>

            <ToggleGroupItem
                value="grid"
                className="flex-1 px-3 rounded-[var(--radius)] data-[state=on]:bg-background data-[state=on]:shadow"
            >
                Zeitleiste
            </ToggleGroupItem>

        </ToggleGroup>
    </div>
  );
}
