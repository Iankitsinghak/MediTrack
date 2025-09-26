
"use client"

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Mic, FilePlus2, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useFirestore } from "@/hooks/use-firestore";
import type { Doctor, Patient, Prescription } from "@/lib/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDoc, collection, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}
declare const window: CustomWindow;

const prescriptionSchema = z.object({
    patientId: z.string({ required_error: "Please select a patient." }),
    medication: z.string().min(3, "Medication details are required."),
});

export default function PrescriptionsPage() {
    const { toast } = useToast();
    const { user: doctor, loading: loadingDoctor } = useAuthUser<Doctor>('doctors');
    const { data: patients, loading: loadingPatients } = useFirestore<Patient>('patients', where('doctorId', '==', doctor?.uid || ''));
    const { data: prescriptions, loading: loadingPrescriptions } = useFirestore<Prescription>('prescriptions', where('doctorId', '==', doctor?.uid || ''));

    const [isListening, setIsListening] = useState(false);
    const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
    const recognitionRef = useRef<any>(null);

    const form = useForm<z.infer<typeof prescriptionSchema>>({
        resolver: zodResolver(prescriptionSchema),
        defaultValues: {
            patientId: "",
            medication: "",
        }
    });

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsSpeechRecognitionSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                form.setValue("medication", form.getValues("medication") + finalTranscript);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                toast({
                    variant: "destructive",
                    title: "Speech Recognition Error",
                    description: `An error occurred: ${event.error}`,
                });
                setIsListening(false);
            };

            recognition.onend = () => {
                if (isListening) {
                    setIsListening(false);
                    toast({
                        title: "Dictation Stopped",
                        description: "Your voice input has been captured.",
                    });
                }
            };
            
            recognitionRef.current = recognition;
        } else {
             setIsSpeechRecognitionSupported(false);
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast, form, isListening]);

    const handleMicClick = () => {
        if (!isSpeechRecognitionSupported) {
             toast({
                variant: "destructive",
                title: "Browser Not Supported",
                description: "Your browser does not support speech recognition.",
            });
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
            toast({
                title: "Dictation Started",
                description: "Your voice is now being recorded. Click the mic again to stop.",
            });
        }
    }
    
    async function onSubmit(values: z.infer<typeof prescriptionSchema>) {
        if (!doctor) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to create a prescription." });
            return;
        }
        
        const selectedPatient = patients.find(p => p.id === values.patientId);
        if (!selectedPatient) {
             toast({ variant: "destructive", title: "Error", description: "Selected patient not found." });
            return;
        }

        try {
            await addDoc(collection(db, "prescriptions"), {
                patientId: values.patientId,
                patientName: selectedPatient.fullName,
                doctorId: doctor.uid,
                doctorName: doctor.fullName,
                medication: values.medication,
                date: serverTimestamp(),
                status: "Pending"
            });

            toast({
                title: "Prescription Created",
                description: `A new prescription for ${selectedPatient.fullName} has been saved.`
            });
            form.reset();

        } catch (error) {
            console.error("Error creating prescription:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to create prescription. Please try again." });
        }
    }

    const sortedPrescriptions = [...prescriptions].sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date();
        const dateB = b.date?.toDate ? b.date.toDate() : new Date();
        return dateB.getTime() - dateA.getTime();
    });


    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Prescriptions</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Create New Prescription</CardTitle>
                    <CardDescription>Write a new prescription or use voice-to-text to dictate.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!isSpeechRecognitionSupported && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Speech Recognition Not Supported</AlertTitle>
                            <AlertDescription>
                                Your browser doesn't support the Web Speech API. Please try a different browser like Chrome or type manually.
                            </AlertDescription>
                        </Alert>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                name="medication"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Medication & Dosage</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="e.g., Metoprolol 25mg, 1 tablet twice daily..."
                                                className="min-h-[150px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-between items-center">
                                <Button type="button" variant={isListening ? "destructive" : "outline"} size="icon" onClick={handleMicClick} disabled={!isSpeechRecognitionSupported}>
                                    <Mic className="h-4 w-4" />
                                    <span className="sr-only">{isListening ? "Stop Listening" : "Start Dictation"}</span>
                                </Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <FilePlus2 className="mr-2 h-4 w-4" />
                                    Create Prescription
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Prescription History</CardTitle>
                    <CardDescription>Review prescriptions you have written for your patients.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Medication</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingPrescriptions ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : sortedPrescriptions.length > 0 ? (
                                    sortedPrescriptions.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>{p.date?.toDate ? format(p.date.toDate(), "PPP") : '...'}</TableCell>
                                            <TableCell className="font-medium">{p.patientName}</TableCell>
                                            <TableCell>{p.medication}</TableCell>
                                            <TableCell>
                                                <Badge variant={p.status === 'Pending' ? 'destructive' : 'secondary'}>{p.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No prescription history found.
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
