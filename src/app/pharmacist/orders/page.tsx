import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function OrdersPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Orders</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Medication Orders</CardTitle>
                    <CardDescription>Create and track orders for new stock.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Medication ordering interface will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
