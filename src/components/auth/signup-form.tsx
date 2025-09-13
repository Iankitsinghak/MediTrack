"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { UserRole } from "@/lib/types"
import { handleAddStaff } from "@/lib/actions"

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
        
        // Ensure this is the first admin
        const adminsCollection = collection(db, 'admins');
        const adminsSnapshot = await getDocs(adminsCollection);
        if (!adminsSnapshot.empty) {
            toast({
                variant: "destructive",
                title: "Signup Forbidden",
                description: "An administrator account already exists. Please log in.",
            });
            return;
        }

        const result = await handleAddStaff({ ...values, role: UserRole.Admin });

        if (result.error) {
            toast({
                variant: "destructive",
                title: "Signup Failed",
                description: result.error,
            });
        } else {
            toast({
                title: "Admin Account Created",
                description: "You can now log in with your credentials.",
            });
            router.push('/login');
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
