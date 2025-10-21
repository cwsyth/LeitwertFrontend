'use client';

import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ChevronUp, Search } from "lucide-react";

const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia",
    "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
    "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
    "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde",
    "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia",
    "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
    "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India",
    "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan",
    "Kenya", "Kiribati", "North Korea", "South Korea", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
    "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar",
    "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
    "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
    "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
    "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
    "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
    "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
    "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
    "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland",
    "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga",
    "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
    "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
    "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function DashboardHeaderFilter() {
    const [open, setOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [tier1, setTier1] = useState(true);
    const [tier2, setTier2] = useState(true);
    const [tier3, setTier3] = useState(true);
    const [searchText, setSearchText] = useState("");

    const filteredCountries = countries.filter(country =>
        country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card className="flex-1">
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
                                    {selectedCountry || "Select country..."}
                                    <ChevronUp
                                        className={`ml-2 h-4 w-4 shrink-0 transition-transform duration-300 ${
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
                                                    key={country}
                                                    onClick={() => {
                                                        setSelectedCountry(country);
                                                        setOpen(false);
                                                        setSearchQuery("");
                                                    }}
                                                    className="relative flex cursor-pointer select-none items-center px-4 py-2 text-sm hover:bg-accent hover:text-popover-foreground"
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${
                                                            selectedCountry === country ? "opacity-100" : "opacity-0"
                                                        }`}
                                                    />
                                                    {country}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Tier Checkboxes */}
                        <div className="ml-1 mt-1 flex gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="tier1"
                                    checked={tier1}
                                    onCheckedChange={(checked) => setTier1(checked as boolean)}
                                />
                                <label
                                    htmlFor="tier1"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Tier 1
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="tier2"
                                    checked={tier2}
                                    onCheckedChange={(checked) => setTier2(checked as boolean)}
                                />
                                <label
                                    htmlFor="tier2"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Tier 2
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="tier3"
                                    checked={tier3}
                                    onCheckedChange={(checked) => setTier3(checked as boolean)}
                                />
                                <label
                                    htmlFor="tier3"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Tier 3
                                </label>
                            </div>
                        </div>

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
                    </div>
                </CardDescription>
            </CardHeader>
        </Card>
    );
}
