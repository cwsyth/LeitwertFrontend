'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function DashboardFooterSearch() {
    const [searchText, setSearchText] = useState("");

    return (
         <Card className="flex-7">
            <CardHeader>
                <CardTitle>
                    Suchergebnisse
                </CardTitle>
                <CardDescription className="text-foreground">
                        {/* Search Field */}
                    <div className="relative w-68 mt-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Router, Stadt, AS..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                </CardDescription>
                <CardContent className="p-0">
                    <div className="grid grid-cols-3 gap-2">
                        <Card className="">
                            <CardHeader>
                                <CardTitle>
                                    Berlin
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="">
                            <CardHeader>
                                <CardTitle>
                                    Berlin
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="">
                            <CardHeader>
                                <CardTitle>
                                    Berlin
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                </CardContent>
            </CardHeader>
        </Card>
    );
}
