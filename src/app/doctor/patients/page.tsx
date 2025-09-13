import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PatientsPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Patients</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Patient List</CardTitle>
                    <CardDescription>View and manage your patients.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Patient list and management features will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
