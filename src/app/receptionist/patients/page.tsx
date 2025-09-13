"use client"

import { useState, useMemo } from "react"
import { getPatients } from "@/lib/data"
import type { Patient } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

export default function PatientsPage() {
    const allPatients = getPatients();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPatients = useMemo(() => {
        if (!searchTerm) return allPatients;
        return allPatients.filter(patient => 
            patient.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allPatients]);

    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Patient Directory</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Search Patients</CardTitle>
                    <CardDescription>Find existing patients in the system. Found {filteredPatients.length} of {allPatients.length} patients.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 relative">
                         <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Date of Birth</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Patient ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map((patient) => (
                                        <TableRow key={patient.id}>
                                            <TableCell className="font-medium">{patient.fullName}</TableCell>
                                            <TableCell>{patient.dateOfBirth}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{patient.gender}</Badge>
                                            </TableCell>
                                            <TableCell>{patient.id}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No patients found.
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
