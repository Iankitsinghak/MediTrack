import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function StaffPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Staff</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Staff Management</CardTitle>
                    <CardDescription>Add, edit, or remove staff members.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Staff management interface will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
