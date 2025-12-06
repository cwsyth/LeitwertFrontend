'use client';

import { CountriesTreeMap } from "@/components/network/CountriesTreeMap";
import { AsTreeMap } from "@/components/network/AsTreeMap";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DashboardContentHierarchy() {
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [showCountryView, setShowCountryView] = useState(false);

    const handleCountryClick = (countryCode: string) => {
        setSelectedCountry(countryCode);
        setShowCountryView(true);
    };

    const handleBackToWorld = () => {
        setShowCountryView(false);
    };

    return (
        <div className="dashboard-hierarchy container mx-auto p-6">
            {/* Header with Toggle */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">
                    Network Hierarchy
                </h1>

                <div className="flex items-center gap-4">
                    {showCountryView && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBackToWorld}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    )}

                    <div className="flex items-center space-x-2">
                        <Label htmlFor="view-mode">World View</Label>
                        <Switch
                            id="view-mode"
                            checked={showCountryView}
                            onCheckedChange={setShowCountryView}
                            disabled={!selectedCountry}
                        />
                        <Label htmlFor="view-mode">Country View</Label>
                    </div>
                </div>
            </div>

            {/* TreeMap Content */}
            {!showCountryView ? (
                <CountriesTreeMap
                    limit={50}
                    onCountryClick={handleCountryClick}
                />
            ) : (
                selectedCountry && (
                    <AsTreeMap
                        countryCode={selectedCountry}
                        limit={50}
                    />
                )
            )}
        </div>
    );
}