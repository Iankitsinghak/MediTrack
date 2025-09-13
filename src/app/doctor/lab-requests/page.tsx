"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { FilePlus2 } from "lucide-react";

const dummyLabRequests = [
    { id: "LAB001", patientName: "Alice Johnson", testName: "Lipid Panel", date: new Date("2024-05-20T10:15:00Z"), status: "Completed" },
    { id: "LAB002", patientName: "Diana Miller", testName: "Stress Test", date: new Date("2024-05-22T11:00:00Z"), status: "Scheduled" },
    { id: "LAB003", patientName: "Frank Wright", testName: "Echocardiogram", date: new Date("2024-05-25T13:00:00Z"), status: "Pending" },
]

export default function LabRequestsPage() {
    return (
        <div className="flex-1 space-y-4">
             <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Lab Requests</h1>
                <Button>
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    New Lab Request
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Laboratory Requests</CardTitle>
                    <CardDescription>Submit and track requests for lab tests.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Test Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dummyLabRequests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>{format(req.date, "PPP")}</TableCell>
                                        <TableCell className="font-medium">{req.patientName}</TableCell>
                                        <TableCell>{req.testName}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                req.status === 'Completed' ? 'secondary' : 
                                                req.status === 'Scheduled' ? 'default' : 'outline'
                                            }>{req.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <a href="#" className="text-primary hover:underline">View Results</a>
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
