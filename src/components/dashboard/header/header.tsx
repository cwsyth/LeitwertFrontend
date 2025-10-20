import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardHeader() {
    return (
        <div className="dashboard-header w-full rounded-[var(--radius)] overflow-hidden flex gap-4 h-35">
            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>
                        Filter
                    </CardTitle>
                    <CardDescription>
                        Filter
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>
                        Gesamtüberblick
                    </CardTitle>
                    <CardDescription>
                        Gesamtüberblick
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>
                        Suchergebnisse
                    </CardTitle>
                    <CardDescription>
                        Suchergebnisse
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
