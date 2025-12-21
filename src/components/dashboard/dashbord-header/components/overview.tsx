import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatusItem {
    label: string;
    count: number;
    variant: "default" | "secondary" | "destructive";
    color?: string;
}

const statusItems: StatusItem[] = [
    { label: "gesund", count: 1400, variant: "default", color: "bg-green-500" },
    { label: "Warnung", count: 240, variant: "secondary", color: "bg-yellow-500" },
    { label: "kritisch", count: 60, variant: "destructive" },
];

export default function DashboardHeaderOverview() {
    const totalCount = statusItems.reduce((sum, item) => sum + item.count, 0);
    const percentage = 89;

    return (
        <Card className="flex-1">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">
                    Global Overview
                </CardTitle>
                <CardDescription className="text-foreground">
                    <div className="flex items-center">
                        {/* Status List */}
                        <div>
                            <div className="text-x mb-2">
                                Total routers: <span className="font-semibold text-sm">{totalCount}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                {statusItems.map((item) => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        <Badge
                                            variant={item.variant}
                                            className={`min-w-[75px] text-background justify-center text-xs ${item.color || ''}`}
                                        >
                                            {item.label}
                                        </Badge>
                                        <span className="font-semibold text-sm">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Circular Progress */}
                        <div className="ml-8">
                            <div className="relative w-28 h-28">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    {/* Background circle */}
                                    <circle
                                        cx="35"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        className="text-muted"
                                        opacity="0.2"
                                    />
                                    {/* Progress circle */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray={`${2 * Math.PI * 40}`}
                                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                                        className="text-foreground transition-all duration-500"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{percentage}%</div>
                                        <div className="text-[10px] font-bold mt-0.5">Health Score</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardDescription>
            </CardHeader>
        </Card>
    );
}
