import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function InventoryPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Inventory</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Hospital Inventory</CardTitle>
                    <CardDescription>Manage hospital-wide inventory.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Inventory management interface will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
