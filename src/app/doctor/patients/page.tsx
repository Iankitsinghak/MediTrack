"use client"

import { useState, useMemo, useEffect } from "react"
import { getPatients } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { useSearchParams } from 'next/navigation'

export default function PatientsPage() {
    const searchParams = useSearchParams()
    const loggedInDoctorId = searchParams.get('doctorId');
    
    const [allPatients, setAllPatients] = useState(getPatients());
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setAllPatients(getPatients());
    }, []);

    const doctorPatients = useMemo(() => {
        if (!loggedInDoctorId) return [];
        return allPatients.filter(patient => patient.doctorId === loggedInDoctorId);
    }, [allPatients, loggedInDoctorId]);

    const filteredPatients = useMemo(() => {
        if (!searchTerm) return doctorPatients;
        return doctorPatients.filter(patient => 
            patient.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, doctorPatients]);

    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Patient List</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Your Patients</CardTitle>
                    <CardDescription>
                        Showing {filteredPatients.length} of your {doctorPatients.length} assigned patients.
                    </CardDescription>
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
