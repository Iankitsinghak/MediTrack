import { ReceptionistDashboard } from "@/components/dashboard/receptionist-dashboard";

export default function ReceptionistDashboardPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Receptionist Dashboard</h1>
            <ReceptionistDashboard />
        </div>
    )
}
