import DashboardHeader from "./header/header";
import DashboardNav from "./nav/nav";
import DashboardContent from "./content/content";
import DashboardFooter from "./footer/footer";

export default function Dashboard() {
    return (
        <div className="dashboard-wrapper h-full flex flex-col items-center justify-center p8">
            <div className="dashboard w-full h-full flex flex-col items-center gap-4">
                <DashboardHeader />
                <DashboardNav />
                <DashboardContent />
                <DashboardFooter />
            </div>
        </div>
    );
}
