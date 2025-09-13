import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function IcuBedsPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">ICU & Beds</h1>
            <Card>
                <CardHeader>
                    <CardTitle>ICU and Bed Management</CardTitle>
                    <CardDescription>Monitor and manage bed occupancy.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>ICU and bed management interface will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
