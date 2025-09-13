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
import type { Doctor, Receptionist, Pharmacist, Admin } from "@/lib/types";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";


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
        const adminUser = auth.currentUser;
        if (!adminUser) {
             toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in as an admin to add staff.",
            });
            return;
        }

        try {
            // We can't use the Admin SDK in this environment, so we'll create the user on the client.
            // In a real production app, this would be a backend function for security.
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
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

            // Save the user profile to the correct collection
            await setDoc(doc(db, `${values.role.toLowerCase()}s`, user.uid), userProfile);
            
            toast({
                title: "Staff Member Added",
                description: `${values.fullName} has been created and can now log in.`,
            });
            
            // IMPORTANT: Sign the admin back in, as createUserWithEmailAndPassword signs the new user in.
            // This is a workaround for the client-side user creation.
             if (auth.currentUser?.uid !== adminUser.uid) {
                // To prevent session swapping, we must re-authenticate the admin.
                // This is a simplified approach. A robust solution uses a server-side endpoint (Cloud Function) to create users.
                await auth.updateCurrentUser(adminUser);
            }
            form.reset();

        } catch (error: any) {
            console.error("Error adding staff:", error);
            let description = "An unexpected error occurred.";
            if (error.code === 'auth/email-already-in-use') {
                description = "This email is already registered. Please use a different email.";
            }
             toast({
                variant: "destructive",
                title: "Failed to add staff",
                description: description,
            });
        }
    }

    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Staff</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Add New Staff Member</CardTitle>
                    <CardDescription>Create a new account for a Doctor, Receptionist, or Pharmacist.</CardDescription>
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
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Department/Info</TableHead>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingAdmins ? (
                                    <TableRow><TableCell colSpan={4}><Skeleton className="h-4 w-full" /></TableCell></TableRow>
                                ) : admins.map((admin) => (
                                    <TableRow key={admin.id}>
                                        <TableCell className="font-medium">{admin.fullName}</TableCell>
                                        <TableCell>{admin.role}</TableCell>
                                        <TableCell>N/A</TableCell>
                                        <TableCell>{admin.email}</TableCell>
                                    </TableRow>
                                ))}
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
                                        <TableCell colSpan={4}><Skeleton className="h-4 w-full" /></TableCell>
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
                                        <TableCell colSpan={4}><Skeleton className="h-4 w-full" /></TableCell>
                                    </TableRow>
                                ) : pharmacists.map((phar) => (
                                    <TableRow key={phar.id}>
                                        <TableCell className="font-medium">{phar.fullName}</TableCell>
                                        <TableCell>{phar.role}</TableCell>
                                        <TableCell>N/A</TableCell>
                                        <TableCell>{phar.email}</TableCell>
                                    </TableRow>
                                ))}
                                {!loadingDoctors && !loadingReceptionists && !loadingPharmacists && !loadingAdmins && doctors.length === 0 && receptionists.length === 0 && pharmacists.length === 0 && admins.length === 0 && (
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
