import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LabRequestsPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Lab Requests</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Laboratory Requests</CardTitle>
                    <CardDescription>Submit and track requests for lab tests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Lab request submission and tracking interface will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
