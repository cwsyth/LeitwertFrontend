'use client';

import { useState } from "react";
import DashboardHeader from "./header/header";
import DashboardNav from "./nav/nav";
import DashboardContent from "./content/content";
import DashboardFooter from "./footer/footer";
import { DashboardViewMode } from "@/types/dashboard";

export default function Dashboard() {
    const [mode, setMode] = useState<DashboardViewMode>("street");

    return (
        <div className="dashboard-wrapper h-full flex flex-col items-center justify-center p8">
            <div className="dashboard w-full h-full flex flex-col items-center gap-4">
                <DashboardHeader />
                <DashboardNav mode={mode} setMode={setMode} />
                <DashboardContent mode={mode} />
                {/* <DashboardFooter /> currently not needed */}
            </div>
        </div>
    );
}
