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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/lib/types";
import { useFirestore } from "@/hooks/use-firestore";
import type { Doctor, Receptionist, Pharmacist, Admin, BaseUser } from "@/lib/types";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useMemo } from "react";


const addStaffSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
    const { data: admins, loading: loadingAdmins } = useFirestore<Admin>('admins');

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
        // This is a simplified client-side user creation.
        // In a production app, this should be a secure Cloud Function.
        const adminUser = auth.currentUser;
        if (!adminUser) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in as an admin to perform this action.",
            });
            return;
        }

        // We can't create a user and then immediately re-authenticate the admin
        // without the admin's password. This is a limitation of the client-side SDK.
        // The ideal solution is a Cloud Function. For this demo, we'll create the
        // user record in Firestore, but auth creation would need a backend process.
        // The current implementation simulates this by creating a user on the client,
        // which has the side-effect of logging the admin out.

        try {
            // This is where a call to a Cloud Function would go.
            // e.g., const { data } = await functions.httpsCallable('createStaffUser')(values);

            // To make this work in the prototype environment, we create the user on the client.
            // NOTE: This will sign the admin out. This is a known limitation.
            const tempAuth = auth; // Use a direct reference
            const userCredential = await createUserWithEmailAndPassword(tempAuth, values.email, values.password);
            const user = userCredential.user;

            const userProfile: any = {
                uid: user.uid,
                fullName: values.fullName,
                email: values.email,
                role: values.role,
                createdAt: serverTimestamp()
            };

            if (values.role === UserRole.Doctor) {
                userProfile.department = values.department;
            }

            await setDoc(doc(db, `${values.role.toLowerCase()}s`, user.uid), userProfile);
            
            toast({
                title: "Staff Member Added",
                description: `${values.fullName} has been created. You will be logged out. Please log in again.`,
            });
            
            form.reset();
            
            // Sign out the newly created user and force admin to log back in
            await tempAuth.signOut();
            window.location.href = '/login';


        } catch (error: any) {
            console.error("Error adding staff:", error);
            let description = "An unexpected error occurred. This may be due to prototype limitations.";
            if (error.code === 'auth/email-already-in-use') {
                description = "This email is already registered. Please use a different email.";
            } else if (error.code === 'auth/network-request-failed') {
                 description = "Network error. Could not connect to authentication service.";
            }
             toast({
                variant: "destructive",
                title: "Failed to add staff",
                description: description,
            });
        }
    }
    
    const allStaff = useMemo(() => {
        const staff = [...admins, ...doctors, ...pharmacists, ...receptionists];
        const roleOrder = {
            [UserRole.Admin]: 1,
            [UserRole.Doctor]: 2,
            [UserRole.Pharmacist]: 3,
            [UserRole.Receptionist]: 4,
        };
        // Sort by role, then by full name
        return staff.sort((a, b) => {
            if (a.role !== b.role) {
                return roleOrder[a.role] - roleOrder[b.role];
            }
            return (a.fullName || '').localeCompare(b.fullName || '');
        });
    }, [admins, doctors, pharmacists, receptionists]);

    const loading = loadingAdmins || loadingDoctors || loadingPharmacists || loadingReceptionists;


    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Staff</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Add New Staff Member</CardTitle>
                    <CardDescription>Create a new account. NOTE: Due to prototype limitations, you will be logged out after adding a user.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                            <FormLabel>Login Email</FormLabel>
                                            <FormControl><Input type="email" placeholder="staff@medichain.com" {...field} /></FormControl>
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
                                        <FormItem className="lg:col-span-4">
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
                                    <TableHead>S/N</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Department/Info</TableHead>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={`skel-${i}`}>
                                            <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : allStaff.length > 0 ? (
                                    allStaff.map((staff, index) => (
                                    <TableRow key={staff.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{staff.fullName}</TableCell>
                                        <TableCell>{staff.role}</TableCell>
                                        <TableCell>{(staff as Doctor).department || 'N/A'}</TableCell>
                                        <TableCell>{staff.email}</TableCell>
                                    </TableRow>
                                ))) : (
                                     <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
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
