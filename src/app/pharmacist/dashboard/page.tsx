import { PharmacistDashboard } from "@/components/dashboard/pharmacist-dashboard";

export default function PharmacistDashboardPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Pharmacist Dashboard</h1>
            <PharmacistDashboard />
        </div>
    )
}
