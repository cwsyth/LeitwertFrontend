import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardFooterSearch() {
    return (
          <div className="dashboard-footer flex-7 w-full rounded-[var(--radius)] bg-background overflow-hidden">
            <Card>
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
