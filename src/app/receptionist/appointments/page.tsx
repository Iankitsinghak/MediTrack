"use client"

import { useState, useMemo, useEffect } from "react"
import { format, startOfDay } from "date-fns"
import { getPatients, scheduleAppointment, getAppointments } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useFirestore } from "@/hooks/use-firestore"
import type { Doctor, Appointment, Patient } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

const appointmentSchema = z.object({
    patientId: z.string({ required_error: "Please select a patient." }),
    doctorId: z.string({ required_error: "Please select a doctor." }),
    appointmentDate: z.date(),
    appointmentTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:mm."),
    reason: z.string().min(3, "Reason must be at least 3 characters."),
});

type AppointmentWithDate = Omit<Appointment, 'date'> & { date: Date | any }

export default function AppointmentsPage() {
    const { toast } = useToast();
    
    // State for local mock data
    const [allPatients, setAllPatients] = useState<Patient[]>([]);
    
    const { data: doctors, loading: loadingDoctors } = useFirestore<Doctor>('doctors');
    const { data: firestoreAppointments, loading: loadingAppointments } = useFirestore<AppointmentWithDate>('appointments');
    
    useEffect(() => {
        setAllPatients(getPatients());
    }, []);

    const [date, setDate] = useState<Date | undefined>(new Date())
    const [isModalOpen, setIsModalOpen] = useState(false);

    const form = useForm<z.infer<typeof appointmentSchema>>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            appointmentDate: date,
            appointmentTime: "09:00",
        }
    });

    const appointmentsForSelectedDate = useMemo(() => {
        if (!date) return [];
        const filtered = firestoreAppointments.filter(appt => {
            const apptDate = appt.date?.toDate ? appt.date.toDate() : new Date(appt.date);
            return startOfDay(apptDate).getTime() === startOfDay(date).getTime()
        });
        
        return filtered.sort((a, b) => {
             const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
             const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
             return dateA.getTime() - dateB.getTime()
        });
    }, [date, firestoreAppointments]);
    
    const handleDateSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
    }

    const openNewAppointmentModal = () => {
        form.reset({
            appointmentDate: date,
            appointmentTime: "09:00"
        });
        setIsModalOpen(true);
    };

    async function onSubmit(values: z.infer<typeof appointmentSchema>) {
        const [hours, minutes] = values.appointmentTime.split(':').map(Number);
        const appointmentDateTime = new Date(values.appointmentDate);
        appointmentDateTime.setHours(hours, minutes);

        const selectedDoctor = doctors.find(d => d.id === values.doctorId);
        if (!selectedDoctor) {
            toast({ variant: "destructive", title: "Doctor not found" });
            return;
        }

        try {
            await scheduleAppointment({
                patientId: values.patientId,
                doctorId: values.doctorId,
                doctorName: selectedDoctor.fullName!,
                date: appointmentDateTime,
                reason: values.reason,
            });
            
            toast({
                title: "Appointment Scheduled",
                description: "The new appointment has been added to the calendar.",
            });
            setIsModalOpen(false);
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Failed to schedule",
                description: (error as Error).message,
            });
            console.error("Scheduling error:", error);
        }
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Appointments</h1>
                <Button onClick={openNewAppointmentModal}>Schedule Appointment</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Appointment Calendar</CardTitle>
                        <CardDescription>Select a date to view or book appointments.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            className="rounded-md border"
                        />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Schedule for {date ? format(date, "PPP") : "..."}</CardTitle>
                        <CardDescription>
                            {appointmentsForSelectedDate.length} appointment(s) scheduled for this day.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loadingAppointments ? (
                            <div className="space-y-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ) : appointmentsForSelectedDate.length > 0 ? (
                            appointmentsForSelectedDate.map((appt) => (
                                <div key={appt.id} className="flex items-center gap-4 p-2 rounded-md border bg-muted/50">
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium leading-none">{appt.patientName}</p>
                                        <p className="text-sm text-muted-foreground">{appt.reason}</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <p className="font-medium">{format(appt.date?.toDate ? appt.date.toDate() : new Date(appt.date), "p")}</p>
                                        <p className="text-sm text-muted-foreground">{appt.doctorName}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-40 text-muted-foreground">
                                <p>No appointments for this date.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <DialogHeader>
                                <DialogTitle>New Appointment</DialogTitle>
                                <DialogDescription>
                                    Fill in the details to schedule a new appointment for {date ? format(date, "PPP") : ""}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                               <FormField
                                    control={form.control}
                                    name="patientId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Patient</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a patient" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {allPatients.map(p => <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="doctorId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Doctor</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                      <SelectValue placeholder={loadingDoctors ? "Loading..." : "Select a doctor"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {doctors.map(d => <SelectItem key={d.id} value={d.id!}>{d.fullName}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="appointmentTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Time</FormLabel>
                                            <FormControl><Input type="time" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reason for Visit</FormLabel>
                                            <FormControl><Input placeholder="e.g. Annual Checkup" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                                <Button type="submit">Schedule</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
