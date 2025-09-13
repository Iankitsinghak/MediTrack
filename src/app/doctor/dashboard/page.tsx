import { DoctorDashboard } from "@/components/dashboard/doctor-dashboard";

export default function DoctorDashboardPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Doctor Dashboard</h1>
            <DoctorDashboard />
        </div>
    )
}
