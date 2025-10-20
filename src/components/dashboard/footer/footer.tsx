import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardFooter() {
    return (
        <div className="dashboard-footer w-full rounded-[var(--radius)] bg-background overflow-hidden">
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
