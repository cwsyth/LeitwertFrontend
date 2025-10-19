'use client';

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";

export default function DashboardNav() {
 const [mode, setMode] = useState<"street" | "grid" | "hierarchy">("street");

  return (
    <div className="dashboard-nav w-full">
        <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => v && setMode(v as typeof mode)}
            className="flex w-full items-center rounded-full border bg-muted p-1"
        >

        <ToggleGroupItem
            value="street"
            className="flex-1 rounded-full px-3 data-[state=on]:bg-background data-[state=on]:shadow"
        >
            Straßen-Karte
        </ToggleGroupItem>

        <ToggleGroupItem
            value="grid"
            className="flex-1 rounded-full px-3 data-[state=on]:bg-background data-[state=on]:shadow"
        >
            Raster
        </ToggleGroupItem>

        <ToggleGroupItem
            value="hierarchy"
            className="flex-1 rounded-full px-3 data-[state=on]:bg-background data-[state=on]:shadow"
        >
            Hierarchie
      </ToggleGroupItem>
    </ToggleGroup>
    </div>
  );
}
