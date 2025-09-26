
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { useSearchParams } from 'next/navigation'
import { useFirestore } from "@/hooks/use-firestore"
import type { Patient } from "@/lib/types"
import { where } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"

export default function PatientsPage() {
    const searchParams = useSearchParams()
    const loggedInDoctorId = searchParams.get('doctorId');
    
    const [searchTerm, setSearchTerm] = useState("");

    const query = useMemo(() => loggedInDoctorId ? where('doctorId', '==', loggedInDoctorId) : undefined, [loggedInDoctorId]);
    const { data: doctorPatients, loading } = useFirestore<Patient>('patients', query);


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
                                {loading ? (
                                     Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={`skel-${i}`}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredPatients.length > 0 ? (
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
