import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardFooterStatistics() {
    return (
          <div className="dashboard-footer flex-4 w-full rounded-[var(--radius)] bg-background overflow-hidden">
            <Card>
                <CardHeader>
                    <CardTitle>
                        Globale Statistiken
                    </CardTitle>
                    <CardDescription>
                        Globale Statistiken
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
