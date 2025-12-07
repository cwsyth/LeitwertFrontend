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
    CountrySizeMetric, NetworkStatus
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
    const [statusFilter, setStatusFilter] = useState<NetworkStatus | 'all'>('all');

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
            {/* Customization Options */}
            <div className="mb-6 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-6">
                    {/* View Select */}
                    <div className="flex items-center gap-2">
                        <Label htmlFor="view-select" className="whitespace-nowrap">
                            Ansicht
                        </Label>
                        <Select
                            value={showCountryView ? "country" : "world"}
                            onValueChange={(value) => {
                                if (value === "world") {
                                    setShowCountryView(false);
                                } else if (selectedCountry) {
                                    setShowCountryView(true);
                                }
                            }}
                            disabled={!selectedCountry && !showCountryView}
                        >
                            <SelectTrigger id="view-select" className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="world">World View</SelectItem>
                                <SelectItem value="country" disabled={!selectedCountry}>
                                    Country View
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Limit Input */}
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
                            Sortierung
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

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Label htmlFor="status-filter" className="whitespace-nowrap">
                            Status
                        </Label>
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value as NetworkStatus | 'all')}
                        >
                            <SelectTrigger id="status-filter" className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Alle</SelectItem>
                                <SelectItem value="healthy">Healthy</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
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
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
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
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        onBackClick={handleBackToWorld}
                    />
                )
            )}
        </div>
    );
}