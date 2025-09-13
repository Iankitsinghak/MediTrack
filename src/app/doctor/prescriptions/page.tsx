import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PrescriptionsPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Prescriptions</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Prescriptions</CardTitle>
                    <CardDescription>Create and manage patient prescriptions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Prescription management interface will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
