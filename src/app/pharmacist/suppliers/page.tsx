import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SuppliersPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Suppliers</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Suppliers</CardTitle>
                    <CardDescription>View and manage medication suppliers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Supplier management interface will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
