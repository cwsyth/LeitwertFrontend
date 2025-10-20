import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardFooterFilter from "../footer/filter";

export default function DashboardHeader() {
    return (
        <div className="dashboard-header w-full rounded-[var(--radius)] overflow-hidden flex gap-3 h-35">
            <DashboardFooterFilter />
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
        </div>
    );
}
