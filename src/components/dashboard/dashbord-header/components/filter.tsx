'use client';

import { useState } from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

import { Check, ChevronUp } from "lucide-react";

import { countries as countriesData } from "countries-list";
import { CircleFlag } from "react-circle-flags";

import { Country } from "@/types/dashboard";

const worldCountry: Country = {
    code: 'world',
    name: 'World'
};

const sortedCountries: Country[] = Object.entries(countriesData).map(([code, data]) => ({
    code: code.toLowerCase(),
    name: data.name
})).sort((a, b) => a.name.localeCompare(b.name));

const countries: Country[] = [worldCountry, ...sortedCountries];

interface DashboardHeaderFilterProps {
    selectedCountry: Country;
    setSelectedCountry: React.Dispatch<React.SetStateAction<Country>>;
}

export default function DashboardHeaderFilter({ selectedCountry, setSelectedCountry }: DashboardHeaderFilterProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCountries = searchQuery
        ? countries.filter(country =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : countries;

    return (
        <Card className="flex-2">
            <CardHeader>
                <CardTitle>
                    Filter
                </CardTitle>
                <CardDescription className="text-foreground">
                    <div className="mt-2 space-y-3">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-68 justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        {selectedCountry && (
                                            <div className="flex items-center justify-center w-5 h-5 rounded-full">
                                                {selectedCountry.code === 'world' ? (
                                                    <span className="text-lg">🌍</span>
                                                ) : (
                                                    <CircleFlag countryCode={selectedCountry.code} height={16} />
                                                )}
                                            </div>
                                        )}
                                        <span>{selectedCountry?.name || "Select country..."}</span>
                                    </div>
                                    <ChevronUp
                                        className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                                            open ? "rotate-180" : ""
                                        }`}
                                    />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-68 p-0 overflow-hidden" align="start">
                                <div className="flex flex-col">
                                    {/* Search Input */}
                                    <div className="border-b p-2 bg-popover">
                                        <input
                                            type="text"
                                            placeholder="Search countries..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border-0 focus:outline-none focus:ring-0 bg-transparent"
                                        />
                                    </div>
                                    {/* Country List */}
                                    <div className="max-h-[300px] overflow-y-auto bg-popover">
                                        {filteredCountries.length === 0 ? (
                                            <div className="py-6 text-center text-sm text-muted-foreground">
                                                No country found.
                                            </div>
                                        ) : (
                                            filteredCountries.map((country) => (
                                                <div
                                                    key={country.code}
                                                    onClick={() => {
                                                        setSelectedCountry(country);
                                                        setOpen(false);
                                                        setSearchQuery("");
                                                    }}
                                                    className="relative flex cursor-pointer select-none items-center px-4 py-2 text-sm hover:bg-accent hover:text-popover-foreground"
                                                >
                                                    <Check
                                                        className={`mr-4 h-4 w-4 ${
                                                            selectedCountry?.code === country.code ? "opacity-100" : "opacity-0"
                                                        }`}
                                                    />
                                                    <div className="flex items-center justify-center w-5 h-5 rounded-full">
                                                        {country.code === 'world' ? (
                                                            <span className="text-lg mr-3">🌍</span>
                                                        ) : (
                                                            <CircleFlag countryCode={country.code} height={16} className="mr-3" />
                                                        )}
                                                    </div>
                                                    {country.name}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardDescription>
            </CardHeader>
        </Card>
    );
}
