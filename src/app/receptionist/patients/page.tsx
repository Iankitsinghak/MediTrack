import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PatientsPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Patient Directory</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Search Patients</CardTitle>
                    <CardDescription>Find existing patients in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Patient search and directory will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
