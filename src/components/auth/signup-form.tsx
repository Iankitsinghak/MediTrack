"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/lib/types"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const adminSignupSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});


export function AdminSignupForm() {
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof adminSignupSchema>>({
        resolver: zodResolver(adminSignupSchema),
        defaultValues: { fullName: "", email: "", password: "" }
    });

    async function onSubmit(values: z.infer<typeof adminSignupSchema>) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            const adminProfile = {
                uid: user.uid,
                fullName: values.fullName,
                email: values.email,
                role: UserRole.Admin,
                createdAt: serverTimestamp(),
            };

            await setDoc(doc(db, "admins", user.uid), adminProfile);

            toast({
                title: "Admin Account Created",
                description: "Redirecting to your new dashboard...",
            });

            // No need to sign in again, createUserWithEmailAndPassword does it automatically
            router.push('/admin/dashboard');
            router.refresh();

        } catch (error: any) {
            console.error("Admin Signup Error:", error);
            let description = "An unexpected error occurred.";
             if (error.code === 'auth/email-already-in-use') {
                description = "This email is already registered. Please try logging in.";
            }
            toast({
                variant: "destructive",
                title: "Signup Failed",
                description: description,
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input placeholder="Admin Name" {...field} /></FormControl>
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
                            <FormControl><Input type="email" placeholder="admin@medichain.com" {...field} /></FormControl>
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
                <Button type="submit" className="w-full">Create Admin Account</Button>
            </form>
        </Form>
    );
}
