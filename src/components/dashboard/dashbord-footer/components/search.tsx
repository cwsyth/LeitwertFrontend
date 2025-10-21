'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
                <CardContent className="p-0 mt-4 max-h-[200px] overflow-y-auto">
                    <div className="grid grid-cols-3 gap-2">
                        <Card className="">
                            <CardHeader>
                                <CardTitle>
                                    Berlin
                                </CardTitle>
                                <CardDescription>
                                    DE
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-1">
                                <Badge variant="default" className="min-w-[60px] text-background justify-center text-xs bg-green-500">120 ok</Badge>
                                <Badge variant="secondary" className="min-w-[60px] text-background justify-center text-xs bg-yellow-500">5 warn</Badge>
                                <Badge variant="destructive" className="min-w-[60px] text-background justify-center text-xs">5 down</Badge>
                            </CardContent>
                        </Card>
                        <Card className="">
                            <CardHeader>
                                <CardTitle>
                                    München
                                </CardTitle>
                                <CardDescription>
                                    DE
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-1">
                                <Badge variant="default" className="min-w-[60px] text-background justify-center text-xs bg-green-500">120 ok</Badge>
                                <Badge variant="secondary" className="min-w-[60px] text-background justify-center text-xs bg-yellow-500">5 warn</Badge>
                                <Badge variant="destructive" className="min-w-[60px] text-background justify-center text-xs">5 down</Badge>
                            </CardContent>
                        </Card>
                        <Card className="">
                            <CardHeader>
                                <CardTitle>
                                    Köln
                                </CardTitle>
                                <CardDescription>
                                    DE
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-1">
                                <Badge variant="default" className="min-w-[60px] text-background justify-center text-xs bg-green-500">120 ok</Badge>
                                <Badge variant="secondary" className="min-w-[60px] text-background justify-center text-xs bg-yellow-500">5 warn</Badge>
                                <Badge variant="destructive" className="min-w-[60px] text-background justify-center text-xs">5 down</Badge>
                            </CardContent>
                        </Card>
                        <Card className="">
                            <CardHeader>
                                <CardTitle>
                                    Berlin
                                </CardTitle>
                                <CardDescription>
                                    DE
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-1">
                                <Badge variant="default" className="min-w-[60px] text-background justify-center text-xs bg-green-500">120 ok</Badge>
                                <Badge variant="secondary" className="min-w-[60px] text-background justify-center text-xs bg-yellow-500">5 warn</Badge>
                                <Badge variant="destructive" className="min-w-[60px] text-background justify-center text-xs">5 down</Badge>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
                <hr className="border-stone-300"></hr>
            </CardHeader>
        </Card>
    );
}
