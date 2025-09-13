import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BillingPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Billing</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Billing & Invoicing</CardTitle>
                    <CardDescription>View and manage patient billing.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Billing and invoicing features will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
