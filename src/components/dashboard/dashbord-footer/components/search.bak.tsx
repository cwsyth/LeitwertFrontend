'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Country, Router } from "@/types/dashboard";

interface DashboardFooterSearchProps {
    selectedCountry: Country;
    routers: Router[];
    setSelectedRouter: React.Dispatch<React.SetStateAction<Router | null>>;
}

export default function DashboardFooterSearch({ selectedCountry, routers, setSelectedRouter }: DashboardFooterSearchProps) {
    const [searchText, setSearchText] = useState("");

    const filteredRouters = routers.filter((router: Router) =>
        ("AS" + String(router.asn)).toLowerCase().startsWith(searchText.toLowerCase())
    );
    const handleRouterClick = (router: Router) => {
        setSelectedRouter(router);
    };

    return (
         <Card className="w-full">
            <CardHeader>
                <CardTitle>
                    Suchergebnisse in {selectedCountry.name}
                </CardTitle>
                <CardDescription className="text-foreground">
                    {/* Search Field */}
                    <div className="relative w-68 mt-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="AS name..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                </CardDescription>
                <CardContent className="p-0 mt-4 max-h-[350px] overflow-y-auto">
                    <div className="grid grid-cols-3 gap-2">
                        {filteredRouters.map((router, index) => (
                            <Card key={`${router.asn}-${router.router_id}-${index}`} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => handleRouterClick(router)}>
                                <CardHeader>
                                    <CardTitle>
                                        AS{router.asn}
                                    </CardTitle>
                                    <CardDescription>
                                        <div>
                                            {router.router_id}
                                        </div>
                                        <div>
                                            {selectedCountry.code.toUpperCase()} - {router.location.city || "Unbekannt"} - {router.location.region || "Unbekannt"}
                                        </div>
                                        <div className="text-xs text-zinc-300">
                                            country - city - region
                                        </div>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex gap-1">
                                    { <Badge variant="default" className="min-w-[60px] text-background justify-center text-xs bg-green-500">ok</Badge> }
                                    { <Badge variant="secondary" className="min-w-[60px] text-background justify-center text-xs bg-yellow-500">warn</Badge> }
                                    { <Badge variant="destructive" className="min-w-[60px] text-background justify-center text-xs">down</Badge> }
                                    { <Badge variant="outline" className="min-w-[60px] text-foreground justify-center text-xs">n/a</Badge> }
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
                <hr className="border-stone-300"></hr>
            </CardHeader>
        </Card>
    );
}
