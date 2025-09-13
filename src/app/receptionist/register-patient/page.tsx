import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPatientPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Register New Patient</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Patient Registration Form</CardTitle>
                    <CardDescription>Fill out the form below to add a new patient.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Patient registration form will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
