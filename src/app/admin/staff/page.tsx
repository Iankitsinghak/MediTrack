
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
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.nativeEnum(UserRole),
  department: z.string().optional(),
  experience: z.coerce.number().optional(),
  story: z.string().optional(),
}).refine(data => {
    if (data.role === UserRole.Doctor) {
        return !!data.department && data.department.length > 2 && data.experience !== undefined && data.experience >= 0;
    }
    return true;
}, {
    message: "Department and Experience are required for doctors.",
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
            phone: "",
            role: UserRole.Doctor,
            department: "",
            experience: 0,
            story: "",
        }
    });

    const role = form.watch("role");

    async function onSubmit(values: z.infer<typeof addStaffSchema>) {
        try {
            // NOTE: Using createUserWithEmailAndPassword on the client will temporarily
            // sign in the new user, which can disrupt the admin's session.
            // A robust solution uses a Cloud Function to create users.
            // For this prototype, we'll accept this limitation.
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            const userProfile: any = {
                uid: user.uid,
                fullName: values.fullName,
                email: values.email,
                phone: values.phone,
                role: values.role,
                story: values.story || '',
                createdAt: serverTimestamp()
            };

            if (values.role === UserRole.Doctor) {
                userProfile.department = values.department;
                userProfile.experience = values.experience;
            }

            await setDoc(doc(db, `${values.role.toLowerCase()}s`, user.uid), userProfile);
            
            toast({
                title: "Staff Member Added",
                description: `${values.fullName} has been created. You may need to re-login to restore your admin session.`,
            });
            
            form.reset();
            // Intentionally not signing out the admin to avoid disruption.
            // The admin can manually log out and log back in if their session is affected.

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
                    <CardDescription>Create a new account for a staff member.</CardDescription>
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
                                            <FormLabel>Login Email</FormLabel>
                                            <FormControl><Input type="email" placeholder="staff@medichain.com" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl><Input placeholder="+1 234 567 890" {...field} /></FormControl>
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
                                 <>
                                    <FormField
                                        control={form.control}
                                        name="department"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Specialization</FormLabel>
                                                <FormControl><Input placeholder="e.g. Cardiology" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="experience"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Experience (Years)</FormLabel>
                                                <FormControl><Input type="number" placeholder="5" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                 </>
                               )}
                                <FormField
                                    control={form.control}
                                    name="story"
                                    render={({ field }) => (
                                        <FormItem className="lg:col-span-3">
                                            <FormLabel>Staff Story / Bio</FormLabel>
                                            <FormControl><Input placeholder="A short bio about the staff member..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                    <TableHead>Details</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Bio</TableHead>
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
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : allStaff.length > 0 ? (
                                    allStaff.map((staff, index) => (
                                    <TableRow key={staff.uid || staff.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{staff.fullName}</TableCell>
                                        <TableCell>{staff.role}</TableCell>
                                        <TableCell>
                                            {(staff.role === UserRole.Doctor) && `Dept: ${(staff as Doctor).department}, Exp: ${(staff as Doctor).experience} yrs`}
                                            {(staff.role !== UserRole.Doctor) && 'N/A'}
                                        </TableCell>
                                        <TableCell>{staff.email}<br/>{staff.phone}</TableCell>
                                        <TableCell>{staff.story}</TableCell>
                                    </TableRow>
                                ))) : (
                                     <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
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

    