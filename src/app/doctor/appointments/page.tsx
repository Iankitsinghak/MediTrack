import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AppointmentsPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Appointments</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Your Appointments</CardTitle>
                    <CardDescription>View your scheduled appointments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Doctor's appointment schedule will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
