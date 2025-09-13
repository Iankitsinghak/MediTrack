"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import React from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"


import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { UserRole } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  // Only Admins can be created through public signup now.
  role: z.literal(UserRole.Admin),
});

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: UserRole.Admin,
    },
  })


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        // Admins are stored in the 'admins' collection.
        const collectionName = `admins`;
        
        await setDoc(doc(db, collectionName, user.uid), {
            uid: user.uid,
            fullName: values.fullName,
            email: values.email,
            role: values.role,
            createdAt: serverTimestamp()
        });

        toast({
            title: "Account Created",
            description: "Your admin account has been successfully created.",
        });

        const dashboardPath = `/${values.role.toLowerCase()}/dashboard`
        router.push(dashboardPath)
    } catch (error: any) {
        console.error("Signup Error:", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.message || "There was a problem with your request.",
        });
    }
  }

  function onGoogleSignIn() {
    // In a real app, you'd call Firebase Google OAuth provider here
    router.push(`/admin/dashboard`)
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
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
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
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
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
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <p className="text-sm text-muted-foreground pt-2">
            You are signing up as an Admin. Other roles (Doctor, Receptionist, Pharmacist) must be created by an Admin from the dashboard.
        </p>
        
        <Button type="submit" className="w-full">
          Create Admin Account
        </Button>
      </form>
       <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
          OR
        </span>
      </div>
      <Button variant="outline" className="w-full" onClick={onGoogleSignIn}>
         <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 106.5 280.4 96 248 96c-84.3 0-152.3 67.8-152.3 151.8s68 151.8 152.3 151.8c99.1 0 127.9-81.5 133.7-114.3H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
        Sign up with Google
      </Button>
    </Form>
  )
}
