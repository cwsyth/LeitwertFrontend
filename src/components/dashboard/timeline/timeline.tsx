import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardTimeline() {
    return (
        <div className="dashboard-footer w-full rounded-[var(--radius)] bg-background overflow-hidden">
            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>
                        Zeitleiste
                    </CardTitle>
                    <CardDescription>
                        Zeitleiste
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
