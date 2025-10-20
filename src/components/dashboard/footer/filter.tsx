'use client';

import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronUp } from "lucide-react";

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

export default function DashboardFooterFilter() {
    const [open, setOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCountries = countries.filter(country =>
        country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 dashboard-footer-filter w-full rounded-[var(--radius)] bg-background overflow-hidden">
            <Card className="border-0 shadow-none">
                <CardHeader>
                    <CardTitle>
                        Filter
                    </CardTitle>
                    <CardDescription>
                       <div className="mt-2">
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild className="text-foreground">
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-68 justify-between"
                                    >
                                        {selectedCountry || "Select country..."}
                                        <ChevronUp
                                            className={`ml-2 h-4 w-4 shrink-0 transition-transform duration-200 ${
                                                open ? "rotate-180" : ""
                                            }`}
                                        />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-68 p-0" align="start">
                                    <div className="flex flex-col">
                                        {/* Search Input */}
                                        <div className="border-b p-2 bg-popover">
                                            <input
                                                type="text"
                                                placeholder="Search countries..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border-0 focus:outline-none focus:ring-0"
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
                       </div>
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
