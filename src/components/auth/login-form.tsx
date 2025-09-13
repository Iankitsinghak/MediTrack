"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"

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
import { Separator } from "@/components/ui/separator"
import { UserRole, type Doctor, type Receptionist, type Pharmacist } from "@/lib/types"
import { getDoctors, getPharmacists, getReceptionists } from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import React, { useEffect } from "react"

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.nativeEnum(UserRole),
  staffId: z.string().optional(),
})

export function LoginForm() {
  const router = useRouter()
  // Using mock data for the login selection
  const doctors = getDoctors();
  const receptionists = getReceptionists();
  const pharmacists = getPharmacists();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "password123", // Pre-filled for demo purposes
      role: UserRole.Doctor,
    },
  })

  const role = form.watch("role")

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    let dashboardPath = `/${values.role.toLowerCase()}/dashboard`

    if (values.role === UserRole.Admin) {
        // Admin login is simplified for the demo
        router.push(dashboardPath);
        return;
    }
    
    if (!values.staffId) {
        form.setError("staffId", { type: "manual", message: "Please select a staff member." });
        return;
    }

    if (values.role === UserRole.Doctor) {
        dashboardPath += `?doctorId=${values.staffId}`;
    } else if (values.role === UserRole.Receptionist) {
        dashboardPath += `?receptionistId=${values.staffId}`;
    } else if (values.role === UserRole.Pharmacist) {
        dashboardPath += `?pharmacistId=${values.staffId}`;
    }

    router.push(dashboardPath)
  }
  
  function onGoogleSignIn() {
    router.push('/admin/dashboard')
  }

  const staffByRole = {
    [UserRole.Doctor]: { data: doctors, placeholder: "Select a doctor" },
    [UserRole.Receptionist]: { data: receptionists, placeholder: "Select a receptionist" },
    [UserRole.Pharmacist]: { data: pharmacists, placeholder: "Select a pharmacist" },
    [UserRole.Admin]: { data: [], placeholder: "" }
  }

  const currentStaff = staffByRole[role];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role (for simulation)</FormLabel>
               <Select onValueChange={(value) => { field.onChange(value); form.resetField("staffId"); }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role to log in as" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(UserRole).map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {role !== UserRole.Admin && (
           <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Staff Member</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={currentStaff.placeholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currentStaff.data?.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        )}
        <Button type="submit" className="w-full">
          Log In
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
        Sign in with Google (Admin)
      </Button>
    </Form>
  )
}
