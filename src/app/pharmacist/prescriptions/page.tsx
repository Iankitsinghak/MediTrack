import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PrescriptionsPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Prescriptions</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Process Prescriptions</CardTitle>
                    <CardDescription>View and process incoming prescriptions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Prescription processing queue will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
