import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardViewVisibility } from "@/types/dashboard";

interface DashboardHeaderResultsProps {
    viewVisibility: DashboardViewVisibility;
    toggleView: (view: keyof DashboardViewVisibility) => void;
}

interface ComponentItem {
    key: string;
    label: string;
}

const componentItems: ComponentItem[] = [
    { key: "bgpAnnouncements", label: "BGP Announcements" },
    { key: "searchResults", label: "Suchergebnisse" },
    { key: "globalStats", label: "Globale Statistiken" },
];

export default function DashboardHeaderViews({
    viewVisibility,
    toggleView,
}: DashboardHeaderResultsProps) {
    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle>Ansichten</CardTitle>
                <CardDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <Badge
                            variant="outline"
                            className="cursor-not-allowed bg-muted text-muted-foreground border-primary"
                        >
                            Straßenkarte
                        </Badge>
                        <Badge
                            variant="outline"
                            className="cursor-not-allowed bg-muted text-muted-foreground border-primary"
                        >
                            Netzwerkübersicht
                        </Badge>
                        {componentItems.map((item) => (
                            <Badge
                                key={item.key}
                                variant="outline"
                                className={`cursor-pointer transition-colors ${
                                    viewVisibility[
                                        item.key as keyof DashboardViewVisibility
                                    ]
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background text-muted-foreground border-muted"
                                }`}
                                onClick={() =>
                                    toggleView(
                                        item.key as keyof DashboardViewVisibility
                                    )
                                }
                            >
                                {item.label}
                            </Badge>
                        ))}
                    </div>
                </CardDescription>
            </CardHeader>
        </Card>
    );
}
