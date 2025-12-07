'use client';

import { CountriesTreeMap } from "@/components/network/CountriesTreeMap";
import { AsTreeMap } from "@/components/network/AsTreeMap";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
    AS_SIZE_METRIC_LABELS,
    AsSizeMetric,
    COUNTRY_SIZE_METRIC_LABELS,
    CountrySizeMetric
} from "@/types/network";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

export default function DashboardContentHierarchy() {
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [showCountryView, setShowCountryView] = useState(false);
    const [limit, setLimit] = useState(50);
    const [showLabels, setShowLabels] = useState(true);
    const [useGradient, setUseGradient] = useState(true);
    const [countrySizeMetric, setCountrySizeMetric] = useState<CountrySizeMetric>('asCount');
    const [asSizeMetric, setAsSizeMetric] = useState<AsSizeMetric>('ipCount');

    const handleCountryClick = (countryCode: string) => {
        setSelectedCountry(countryCode);
        setShowCountryView(true);
    };

    const handleBackToWorld = () => {
        setShowCountryView(false);
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            setLimit(value);
        }
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

            {/* Customization Options */}
            <div className="mb-6 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="limit-input" className="whitespace-nowrap">
                            Anzahl
                        </Label>
                        <Input
                            id="limit-input"
                            type="number"
                            min="1"
                            value={limit}
                            onChange={handleLimitChange}
                            className="w-18"
                        />
                    </div>
                    {/* Label Toggle */}
                    <div className="flex items-center gap-2">
                        <Label htmlFor="show-labels" className="whitespace-nowrap">
                            Labels
                        </Label>
                        <Switch
                            id="show-labels"
                            checked={showLabels}
                            onCheckedChange={setShowLabels}
                        />
                    </div>
                    {/* Gradient Toggle */}
                    <div className="flex items-center gap-2">
                        <Label htmlFor="use-gradient" className="whitespace-nowrap">
                            Farbverlauf
                        </Label>
                        <Switch
                            id="use-gradient"
                            checked={useGradient}
                            onCheckedChange={setUseGradient}
                        />
                    </div>
                    {/* Size Metric Select */}
                    <div className="flex items-center gap-2">
                        <Label htmlFor="size-metric" className="whitespace-nowrap">
                            Größe nach
                        </Label>
                        {!showCountryView ? (
                            <Select
                                value={countrySizeMetric}
                                onValueChange={(value) => setCountrySizeMetric(value as CountrySizeMetric)}
                            >
                                <SelectTrigger id="size-metric" className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(COUNTRY_SIZE_METRIC_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Select
                                value={asSizeMetric}
                                onValueChange={(value) => setAsSizeMetric(value as AsSizeMetric)}
                            >
                                <SelectTrigger id="size-metric" className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(AS_SIZE_METRIC_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
            </div>

            {/* TreeMap Content */}
            {!showCountryView ? (
                <CountriesTreeMap
                    limit={limit}
                    showLabels={showLabels}
                    useGradient={useGradient}
                    sizeMetric={countrySizeMetric}
                    onCountryClick={handleCountryClick}
                />
            ) : (
                selectedCountry && (
                    <AsTreeMap
                        countryCode={selectedCountry}
                        limit={limit}
                        showLabels={showLabels}
                        useGradient={useGradient}
                        sizeMetric={asSizeMetric}
                    />
                )
            )}
        </div>
    );
}