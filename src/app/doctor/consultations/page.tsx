import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ConsultationsPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Consultations</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Past Consultations</CardTitle>
                    <CardDescription>Review notes from previous patient consultations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Consultation history and notes will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
