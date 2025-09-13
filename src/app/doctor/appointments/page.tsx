"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { useFirestore } from "@/hooks/use-firestore"
import { doc, updateDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Appointment } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, Check } from "lucide-react"
import { useSearchParams } from 'next/navigation'
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"


export default function AppointmentsPage() {
    const searchParams = useSearchParams()
    const { toast } = useToast();
    const loggedInDoctorId = searchParams.get('doctorId')

    const { data: appointments, loading } = useFirestore<Appointment>('appointments', where('doctorId', '==', loggedInDoctorId || ''));

    const sortedAppointments = useMemo(() => {
        return [...appointments].sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
            return dateA.getTime() - dateB.getTime();
        });
    }, [appointments]);

    const upcomingAppointments = sortedAppointments.filter(a => a.status === 'Scheduled');
    const completedAppointments = sortedAppointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled');
    
    const handleStatusUpdate = async (appointmentId: string, status: 'Completed' | 'Cancelled') => {
        const appointmentRef = doc(db, 'appointments', appointmentId);
        try {
            await updateDoc(appointmentRef, { status });
            toast({
                title: "Appointment Updated",
                description: `The appointment has been marked as ${status}.`
            });
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Update Failed",
                description: (error as Error).message,
            });
        }
    };


    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Your Appointments</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Clock className="h-6 w-6"/> Upcoming Appointments</CardTitle>
                    <CardDescription>You have {upcomingAppointments.length} upcoming appointments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({length: 3}).map((_, i) => (
                                         <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Skeleton className="h-8 w-20 inline-block" />
                                                <Skeleton className="h-8 w-20 inline-block" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : upcomingAppointments.length > 0 ? (
                                    upcomingAppointments.map((appt) => (
                                        <TableRow key={appt.id}>
                                            <TableCell>{format(appt.date.toDate(), "PPP p")}</TableCell>
                                            <TableCell className="font-medium">{appt.patientName}</TableCell>
                                            <TableCell>{appt.reason}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" onClick={() => handleStatusUpdate(appt.id, 'Completed')}>Complete</Button>
                                                <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(appt.id, 'Cancelled')}>Cancel</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No upcoming appointments.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Check className="h-6 w-6" /> Appointment History</CardTitle>
                    <CardDescription>Review your past appointments.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {loading ? (
                                     Array.from({length: 2}).map((_, i) => (
                                         <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        </TableRow>
                                     ))
                                 ) : completedAppointments.length > 0 ? (
                                    completedAppointments.map((appt) => (
                                        <TableRow key={appt.id}>
                                            <TableCell>{format(appt.date.toDate(), "PPP p")}</TableCell>
                                            <TableCell className="font-medium">{appt.patientName}</TableCell>
                                            <TableCell>{appt.reason}</TableCell>
                                            <TableCell>{appt.status}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                     <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No completed appointments found.
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
