"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFirestore } from "@/hooks/use-firestore";
import type { Doctor } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus } from "lucide-react";

const addDoctorSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  department: z.string().min(3, "Department is required"),
  email: z.string().email("Invalid email address"),
});


export default function StaffPage() {
    const { toast } = useToast();
    const { data: doctors, loading: loadingDoctors } = useFirestore<Doctor>('doctors');

    const form = useForm<z.infer<typeof addDoctorSchema>>({
        resolver: zodResolver(addDoctorSchema),
        defaultValues: {
            fullName: "",
            department: "",
            email: "",
        }
    });

    async function onSubmit(values: z.infer<typeof addDoctorSchema>) {
        try {
            await addDoc(collection(db, "doctors"), {
                fullName: values.fullName,
                department: values.department,
                email: values.email,
                role: "Doctor",
                createdAt: serverTimestamp(),
            });
            toast({
                title: "Doctor Added",
                description: `${values.fullName} has been added to the staff.`,
            });
            form.reset();
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Failed to add doctor",
                description: (error as Error).message,
            });
            console.error("Error adding doctor:", error);
        }
    }


    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Staff</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Add New Doctor</CardTitle>
                    <CardDescription>Add a new doctor to the system. They will be available for appointments immediately.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl><Input placeholder="Dr. John Doe" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <FormControl><Input placeholder="e.g. Cardiology" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl><Input type="email" placeholder="doctor@example.com" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit"><UserPlus className="mr-2 h-4 w-4" /> Add Doctor</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Separator />
            
            <Card>
                <CardHeader>
                    <CardTitle>Staff List</CardTitle>
                    <CardDescription>List of all doctors currently in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingDoctors ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : doctors.length > 0 ? (
                                    doctors.map((doctor) => (
                                        <TableRow key={doctor.id}>
                                            <TableCell className="font-medium">{doctor.fullName}</TableCell>
                                            <TableCell>{doctor.department}</TableCell>
                                            <TableCell>{doctor.email}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No doctors found.
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
