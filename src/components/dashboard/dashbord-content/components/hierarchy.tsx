'use client';

import {
    CountriesView
} from "@/components/dashboard/dashbord-content/components/network-treemap/countries-view";
import {
    AsView
} from "@/components/dashboard/dashbord-content/components/network-treemap/as-view";
import React, {useEffect, useState} from "react";
import {AsSizeMetric, CountrySizeMetric} from "@/types/network";
import {Country} from "@/types/dashboard";
import {countries as countriesData} from "countries-list";
import {
    TreeMapFilters
} from "@/components/dashboard/dashbord-content/components/network-treemap/filters/treemap-filters";

interface DashboardContentHierarchyProps {
    selectedCountry: Country;
    setSelectedCountry: React.Dispatch<React.SetStateAction<Country>>;
    setSelectedAs: (asNumber: number) => void
}

export default function DashboardContentHierarchy({ selectedCountry, setSelectedCountry, setSelectedAs }: DashboardContentHierarchyProps) {
    const [limit, setLimit] = useState(50);
    const [inputLimit, setInputLimit] = useState("50");
    const [showLabels, setShowLabels] = useState(true);
    const [useGradient, setUseGradient] = useState(true);
    const [countrySizeMetric, setCountrySizeMetric] = useState<CountrySizeMetric>('as_count');
    const [asSizeMetric, setAsSizeMetric] = useState<AsSizeMetric>('ip_count');
    const [thresholds, setThresholds] = useState({
        healthy: { min: 0, max: 2 },
        warning: { min: 3, max: 5 },
        critical: { min: 6, max: Infinity }
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const value = parseInt(inputLimit, 10);
            if (!isNaN(value) && value > 0) {
                setLimit(value);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [inputLimit]);

    const handleCountryClick = (countryCode: string) => {
        const upperCode = countryCode.toUpperCase() as keyof typeof countriesData;
        const countryName = countriesData[upperCode]?.name || countryCode;
        setSelectedCountry({
            code: countryCode.toLowerCase(),
            name: countryName
        });
    };

    const handleBackToWorld = () => {
        setSelectedCountry({ code: 'world', name: 'World' });
    };

    const handleLimitChange = (value: string) => {
        setInputLimit(value);
    };

    const isWorldView = !selectedCountry || selectedCountry.code === 'world';

    return (
        <div className="dashboard-hierarchy container mx-auto">
            {/* Customization Options */}
            <TreeMapFilters
                limitValue={inputLimit}
                onLimitChange={handleLimitChange}
                showLabels={showLabels}
                onShowLabelsChange={setShowLabels}
                useGradient={useGradient}
                onUseGradientChange={setUseGradient}
                isCountryView={isWorldView}
                countryMetric={countrySizeMetric}
                asMetric={asSizeMetric}
                onCountryMetricChange={setCountrySizeMetric}
                onAsMetricChange={setAsSizeMetric}
                thresholds={thresholds}
                onThresholdsChange={setThresholds}
            />

            <div className="overflow-hidden">
                {/* TreeMap Content */}
                {isWorldView ? (
                    <CountriesView
                        limit={limit}
                        showLabels={showLabels}
                        useGradient={useGradient}
                        sizeMetric={countrySizeMetric}
                        onCountryClick={handleCountryClick}
                        thresholds={thresholds}
                    />
                ) : (
                    <AsView
                        countryCode={selectedCountry.code.toUpperCase()}
                        limit={limit}
                        showLabels={showLabels}
                        useGradient={useGradient}
                        sizeMetric={asSizeMetric}
                        onBackClick={handleBackToWorld}
                        thresholds={thresholds}
                        setSelectedAs={setSelectedAs}
                    />
                )}
            </div>
        </div>
    );
}
