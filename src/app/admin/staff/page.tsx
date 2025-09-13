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
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFirestore } from "@/hooks/use-firestore";
import type { Doctor, Receptionist, Pharmacist } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/lib/types";


const addStaffSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.nativeEnum(UserRole),
  department: z.string().optional(),
}).refine(data => {
    if (data.role === UserRole.Doctor) {
        return !!data.department && data.department.length > 2;
    }
    return true;
}, {
    message: "Department is required for doctors.",
    path: ["department"],
});


export default function StaffPage() {
    const { toast } = useToast();
    const { data: doctors, loading: loadingDoctors } = useFirestore<Doctor>('doctors');
    const { data: receptionists, loading: loadingReceptionists } = useFirestore<Receptionist>('receptionists');
    const { data: pharmacists, loading: loadingPharmacists } = useFirestore<Pharmacist>('pharmacists');

    const form = useForm<z.infer<typeof addStaffSchema>>({
        resolver: zodResolver(addStaffSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            role: UserRole.Doctor,
            department: ""
        }
    });

    const role = form.watch("role");

    async function onSubmit(values: z.infer<typeof addStaffSchema>) {
        try {
            const collectionName = `${values.role.toLowerCase()}s`;
            
            const staffData: any = {
                fullName: values.fullName,
                email: values.email,
                // In a real app, you would hash this password before storing it.
                // For this prototype, we're storing it as-is for simplicity.
                password: values.password,
                role: values.role,
                createdAt: serverTimestamp(),
            };

            if (values.role === UserRole.Doctor) {
                staffData.department = values.department;
            }

            await addDoc(collection(db, collectionName), staffData);
            
            toast({
                title: "Staff Member Added",
                description: `${values.fullName} has been added as a ${values.role}.`,
            });
            form.reset();
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Failed to add staff member",
                description: (error as Error).message,
            });
            console.error("Error adding staff:", error);
        }
    }

    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Staff</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Add New Staff Member</CardTitle>
                    <CardDescription>Add a new Doctor, Receptionist, or Pharmacist to the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
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
                                            <FormControl><Input type="email" placeholder="staff@example.com" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.values(UserRole).filter(r => r !== UserRole.Admin).map(r => (
                                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                               {role === UserRole.Doctor && (
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
                               )}
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit"><UserPlus className="mr-2 h-4 w-4" /> Add Staff Member</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Separator />
            
            <Card>
                <CardHeader>
                    <CardTitle>Staff List</CardTitle>
                    <CardDescription>List of all staff currently in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingDoctors ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={`doc-skel-${i}`}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : doctors.map((doctor) => (
                                    <TableRow key={doctor.id}>
                                        <TableCell className="font-medium">{doctor.fullName}</TableCell>
                                        <TableCell>{doctor.role}</TableCell>
                                        <TableCell>{doctor.department}</TableCell>
                                        <TableCell>{doctor.email}</TableCell>
                                    </TableRow>
                                ))}
                                {loadingReceptionists ? (
                                    <TableRow>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell>N/A</TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    </TableRow>
                                ) : receptionists.map((rec) => (
                                    <TableRow key={rec.id}>
                                        <TableCell className="font-medium">{rec.fullName}</TableCell>
                                        <TableCell>{rec.role}</TableCell>
                                        <TableCell>N/A</TableCell>
                                        <TableCell>{rec.email}</TableCell>
                                    </TableRow>
                                ))}
                                {loadingPharmacists ? (
                                    <TableRow>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell>N/A</TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    </TableRow>
                                ) : pharmacists.map((phar) => (
                                    <TableRow key={phar.id}>
                                        <TableCell className="font-medium">{phar.fullName}</TableCell>
                                        <TableCell>{phar.role}</TableCell>
                                        <TableCell>N/A</TableCell>
                                        <TableCell>{phar.email}</TableCell>
                                    </TableRow>
                                ))}
                                {!loadingDoctors && !loadingReceptionists && !loadingPharmacists && doctors.length === 0 && receptionists.length === 0 && pharmacists.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No staff found. Add one above to get started.
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
