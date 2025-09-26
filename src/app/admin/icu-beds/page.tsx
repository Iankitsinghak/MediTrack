
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Bed, BedDouble, BedSingle } from "lucide-react";

const bedStats = [
    { title: "Total Beds", value: "50", icon: BedDouble },
    { title: "Occupied", value: "42", icon: Bed },
    { title: "Available", value: "8", icon: BedSingle },
];

const bedData = [
    { id: 'ICU-01', floor: '3rd Floor', wing: 'A', status: 'Occupied', patient: 'Rakesh Sharma', since: '2024-07-28' },
    { id: 'ICU-02', floor: '3rd Floor', wing: 'A', status: 'Occupied', patient: 'Priya Patel', since: '2024-07-27' },
    { id: 'ICU-03', floor: '3rd Floor', wing: 'A', status: 'Available', patient: 'N/A', since: 'N/A' },
    { id: 'GEN-101', floor: '1st Floor', wing: 'B', status: 'Occupied', patient: 'Amit Singh', since: '2024-07-29' },
    { id: 'GEN-102', floor: '1st Floor', wing: 'B', status: 'Available', patient: 'N/A', since: 'N/A' },
    { id: 'PED-01', floor: '2nd Floor', wing: 'C', status: 'Occupied', patient: 'Aarav Gupta', since: '2024-07-29' },
];

export default function IcuBedsPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">ICU & Bed Management</h1>

            <div className="grid gap-4 md:grid-cols-3">
                {bedStats.map(stat => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Live Bed Status</CardTitle>
                    <CardDescription>Monitor and manage hospital-wide bed occupancy in real-time.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bed Number</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Occupied Since</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bedData.map((bed) => (
                                    <TableRow key={bed.id}>
                                        <TableCell className="font-medium">{bed.id}</TableCell>
                                        <TableCell>{bed.floor}, Wing {bed.wing}</TableCell>
                                        <TableCell>
                                            <Badge variant={bed.status === 'Occupied' ? 'destructive' : 'secondary'}>
                                                {bed.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{bed.patient}</TableCell>
                                        <TableCell>{bed.since}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
