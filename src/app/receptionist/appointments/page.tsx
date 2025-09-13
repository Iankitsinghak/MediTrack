import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AppointmentsPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Appointments</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Appointment Scheduler</CardTitle>
                    <CardDescription>Manage and schedule patient appointments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>A full-featured appointment scheduler will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
