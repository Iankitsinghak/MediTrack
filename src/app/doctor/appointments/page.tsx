"use client"

import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { getAppointments } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, Check } from "lucide-react"

// For this prototype, we'll hardcode the logged-in doctor's ID.
// In a real app, this would come from an authentication context.
const LOGGED_IN_DOCTOR_ID = "doc1";

export default function AppointmentsPage() {
    // We need to manage appointments in state to reflect changes
    const [appointments, setAppointments] = useState(getAppointments());

    // This effect can be used to refetch data in a real app.
    // For our prototype, it just ensures we have the latest from our mock data store.
    useEffect(() => {
        setAppointments(getAppointments());
    }, []);


    const doctorAppointments = useMemo(() => {
        return appointments
            .filter(appt => appt.doctorId === LOGGED_IN_DOCTOR_ID)
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [appointments]);

    const upcomingAppointments = doctorAppointments.filter(a => a.status === 'Scheduled');
    const completedAppointments = doctorAppointments.filter(a => a.status === 'Completed');

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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {upcomingAppointments.length > 0 ? (
                                    upcomingAppointments.map((appt) => (
                                        <TableRow key={appt.id}>
                                            <TableCell>{format(appt.date, "PPP p")}</TableCell>
                                            <TableCell className="font-medium">{appt.patientName}</TableCell>
                                            <TableCell>{appt.reason}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
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
                    <CardTitle className="flex items-center gap-2"><Check className="h-6 w-6" /> Completed Appointments</CardTitle>
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {completedAppointments.length > 0 ? (
                                    completedAppointments.map((appt) => (
                                        <TableRow key={appt.id}>
                                            <TableCell>{format(appt.date, "PPP p")}</TableCell>
                                            <TableCell className="font-medium">{appt.patientName}</TableCell>
                                            <TableCell>{appt.reason}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                     <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
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
