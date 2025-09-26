
"use client"

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { FilePlus2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useFirestore } from "@/hooks/use-firestore";
import { useAuthUser } from "@/hooks/use-auth-user";
import type { Doctor, Patient, LabRequest } from "@/lib/types";
import { addDoc, collection, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

const labRequestSchema = z.object({
    patientId: z.string({ required_error: "Please select a patient." }),
    testName: z.string().min(3, "Test name is required."),
});

export default function LabRequestsPage() {
    const { toast } = useToast();
    const { user: doctor, loading: loadingDoctor } = useAuthUser<Doctor>('doctors');
    
    const patientQuery = useMemo(() => doctor?.uid ? where('doctorId', '==', doctor.uid) : undefined, [doctor?.uid]);
    const { data: patients, loading: loadingPatients } = useFirestore<Patient>('patients', patientQuery);

    const labRequestQuery = useMemo(() => doctor?.uid ? where('doctorId', '==', doctor.uid) : undefined, [doctor?.uid]);
    const { data: labRequests, loading: loadingLabRequests } = useFirestore<LabRequest>('labRequests', labRequestQuery);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const form = useForm<z.infer<typeof labRequestSchema>>({
        resolver: zodResolver(labRequestSchema),
        defaultValues: {
            patientId: "",
            testName: "",
        }
    });

    const handleNewRequestClick = () => {
        form.reset();
        setIsModalOpen(true);
    };

    async function onSubmit(values: z.infer<typeof labRequestSchema>) {
        if (!doctor) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to create a lab request." });
            return;
        }

        const selectedPatient = patients.find(p => p.id === values.patientId);
        if (!selectedPatient) {
             toast({ variant: "destructive", title: "Error", description: "Selected patient not found." });
            return;
        }

        try {
            await addDoc(collection(db, "labRequests"), {
                ...values,
                patientName: selectedPatient.fullName,
                doctorId: doctor.uid,
                doctorName: doctor.fullName,
                date: serverTimestamp(),
                status: "Pending",
            });
            toast({
                title: "Lab Request Submitted",
                description: `Request for ${values.testName} for ${selectedPatient.fullName} has been created.`
            });
            setIsModalOpen(false);

        } catch (error) {
            console.error("Error creating lab request:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to submit lab request. Please try again." });
        }
    }

    const sortedRequests = useMemo(() => {
        return [...labRequests].sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date();
            const dateB = b.date?.toDate ? b.date.toDate() : new Date();
            return dateB.getTime() - dateA.getTime();
        });
    }, [labRequests]);

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Lab Requests</h1>
                <Button onClick={handleNewRequestClick} disabled={loadingDoctor}>
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
                                {loadingLabRequests ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : sortedRequests.length > 0 ? (
                                    sortedRequests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell>{req.date?.toDate ? format(req.date.toDate(), "PPP") : '...'}</TableCell>
                                            <TableCell className="font-medium">{req.patientName}</TableCell>
                                            <TableCell>{req.testName}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    req.status === 'Completed' ? 'secondary' :
                                                    req.status === 'Scheduled' ? 'default' : 'outline'
                                                }>{req.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <a href="#" className="text-primary hover:underline">
                                                    {req.status === 'Completed' ? 'View Results' : 'View Details'}
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                     <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No lab requests found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <DialogHeader>
                                <DialogTitle>New Lab Request</DialogTitle>
                                <DialogDescription>
                                    Select a patient and specify the required test.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="patientId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Patient</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select a patient"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {patients.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="testName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Test Name</FormLabel>
                                            <FormControl><Input placeholder="e.g., Complete Blood Count (CBC)" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                     {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Request
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
