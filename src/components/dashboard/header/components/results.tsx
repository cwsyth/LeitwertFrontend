import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardHeaderResults() {
    return (
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
    );
}
