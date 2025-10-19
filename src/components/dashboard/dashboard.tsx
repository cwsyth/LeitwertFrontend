import Footer from "../layout/footer";
import DashboardContent from "./content/content";
import DashboardHeader from "./header/header";
import DashboardNav from "./nav/nav";

export default function Dashboard() {
    return (
        <div className="dashboard-wrapper h-full flex flex-col items-center justify-center">
            <div className="dashboard">
                <DashboardHeader />
                <DashboardNav />
                <DashboardContent />
                <Footer />
            </div>
        </div>
    );
}
