"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"

const dummyConsultations = [
    { id: "CON001", patientName: "Alice Johnson", date: new Date("2024-05-20T10:00:00Z"), diagnosis: "Stable Angina" },
    { id: "CON002", patientName: "Diana Miller", date: new Date("2024-05-18T14:30:00Z"), diagnosis: "Hypertension" },
    { id: "CON003", patientName: "Frank Wright", date: new Date("2024-05-15T09:00:00Z"), diagnosis: "Mitral Valve Prolapse" },
]

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
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Diagnosis</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dummyConsultations.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell>{format(c.date, "PPP")}</TableCell>
                                        <TableCell className="font-medium">{c.patientName}</TableCell>
                                        <TableCell>{c.diagnosis}</TableCell>
                                        <TableCell className="text-right">
                                            {/* In a real app, this would link to the full consultation note */}
                                            <a href="#" className="text-primary hover:underline">View Details</a>
                                        </TableCell>
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
