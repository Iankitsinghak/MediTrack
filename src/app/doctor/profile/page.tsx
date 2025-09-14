
"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import type { Doctor } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User as UserIcon, Mail, Phone, Edit, Loader2, Stethoscope, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuthUser } from "@/hooks/use-auth-user";

const profileSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
});

function getInitials(name: string = "") {
  const names = name.split(' ');
  if (names.length > 1 && names[names.length - 1]) {
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}


export default function DoctorProfilePage() {
    const { user: doctor, loading, setUser: setDoctor } = useAuthUser<Doctor>('doctors');
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: "",
            phone: "",
        },
    });

    useEffect(() => {
        if (doctor) {
            form.reset({
                fullName: doctor.fullName || "",
                phone: doctor.phone || "",
            });
        }
    }, [doctor, form]);

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        if (!doctor || !doctor.id) return;
        try {
            const doctorRef = doc(db, "doctors", doctor.id);
            await updateDoc(doctorRef, {
                fullName: values.fullName,
                phone: values.phone,
            });
            toast({
                title: "Profile Updated",
                description: "Your information has been saved successfully.",
            });
            setDoctor(prev => prev ? { ...prev, ...values } as Doctor : null);
            setIsEditing(false);
        } catch (error) {
            console.error("Profile update error:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Could not save your changes. Please try again.",
            });
        }
    };

    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Your Profile</h1>
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>Doctor Profile</CardTitle>
                        <CardDescription>Your personal and professional information.</CardDescription>
                    </div>
                     <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} disabled={loading || !doctor}>
                        <Edit className="mr-2 h-4 w-4" />
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        </div>
                    ) : doctor ? (
                        <div>
                             <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                                <Avatar className="h-24 w-24 text-3xl">
                                    <AvatarImage src={`https://i.pravatar.cc/150?u=${doctor.uid}`} alt="Doctor Avatar" />
                                    <AvatarFallback>{getInitials(doctor.fullName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-2xl font-bold font-headline">{doctor.fullName}</h2>
                                    <p className="text-muted-foreground">{doctor.email}</p>
                                </div>
                            </div>

                            {isEditing ? (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
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
                                                    <FormControl><Input placeholder="Your contact number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-muted-foreground">{doctor.fullName}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-muted-foreground">{doctor.email}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-muted-foreground">{doctor.phone || "Not set"}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Stethoscope className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-muted-foreground">Department: {doctor.department}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-muted-foreground">Experience: {doctor.experience} years</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">Could not load doctor profile. Please try logging in again.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
