"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getPrescriptions, processPrescription } from "@/lib/data"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PrescriptionsPage() {
    const router = useRouter();
    const { toast } = useToast();
    // In a real app, you'd use a state management library or re-fetch data.
    // For this prototype, we'll use a local state to force re-renders.
    const [prescriptions, setPrescriptions] = useState(getPrescriptions());

    const handleProcess = (id: string) => {
        processPrescription(id);
        setPrescriptions([...getPrescriptions()]); // Force a re-render
        toast({
            title: "Prescription Processed",
            description: `Prescription ${id} has been marked as processed.`,
        });
    };

    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Process Prescriptions</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Prescription Queue</CardTitle>
                    <CardDescription>View and process incoming patient prescriptions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Medication</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prescriptions.length > 0 ? (
                                    prescriptions.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>{format(p.date, "PPP")}</TableCell>
                                            <TableCell className="font-medium">{p.patientName}</TableCell>
                                            <TableCell>{p.medication} - {p.dosage}</TableCell>
                                            <TableCell>{p.doctorName}</TableCell>
                                            <TableCell>
                                                <Badge variant={p.status === 'Pending' ? 'destructive' : 'secondary'}>{p.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {p.status === 'Pending' && (
                                                    <Button size="sm" onClick={() => handleProcess(p.id)}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Mark as Processed
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No prescriptions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
