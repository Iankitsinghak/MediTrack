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
import { useFirestore } from "@/hooks/use-firestore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import React from "react"

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.nativeEnum(UserRole),
  staffId: z.string().optional(),
})

export function LoginForm() {
  const router = useRouter()
  const { data: doctors, loading: loadingDoctors } = useFirestore<Doctor>('doctors');
  const { data: receptionists, loading: loadingReceptionists } = useFirestore<Receptionist>('receptionists');
  const { data: pharmacists, loading: loadingPharmacists } = useFirestore<Pharmacist>('pharmacists');


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: UserRole.Doctor,
    },
  })

  const role = form.watch("role")

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    let dashboardPath = `/${values.role.toLowerCase()}/dashboard`

    // In a real app, you'd perform authentication here against the email and password.
    // For this prototype, we're just checking that a staff member is selected.

    if (values.role === UserRole.Doctor) {
        if (!values.staffId) {
            form.setError("staffId", { type: "manual", message: "Please select a doctor." });
            return;
        }
        dashboardPath += `?doctorId=${values.staffId}`;
    } else if (values.role === UserRole.Receptionist) {
         if (!values.staffId) {
            form.setError("staffId", { type: "manual", message: "Please select a receptionist." });
            return;
        }
        dashboardPath += `?receptionistId=${values.staffId}`;
    } else if (values.role === UserRole.Pharmacist) {
         if (!values.staffId) {
            form.setError("staffId", { type: "manual", message: "Please select a pharmacist." });
            return;
        }
        dashboardPath += `?pharmacistId=${values.staffId}`;
    }

    router.push(dashboardPath)
  }
  
  function onGoogleSignIn() {
    // In a real app, you'd call Firebase Google OAuth provider here
    // For now, we'll default to the doctor dashboard
    if (doctors && doctors.length > 0) {
      router.push(`/doctor/dashboard?doctorId=${doctors[0].id}`)
    }
  }
  
  const staffByRole = {
    [UserRole.Doctor]: { data: doctors, loading: loadingDoctors, placeholder: "Select a doctor" },
    [UserRole.Receptionist]: { data: receptionists, loading: loadingReceptionists, placeholder: "Select a receptionist" },
    [UserRole.Pharmacist]: { data: pharmacists, loading: loadingPharmacists, placeholder: "Select a pharmacist" },
    [UserRole.Admin]: { data: [], loading: false, placeholder: "" }
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
               <Select onValueChange={(value) => {
                   field.onChange(value);
                   form.setValue('staffId', undefined); // Reset staffId when role changes
               }} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={currentStaff.loading ? `Loading ${role.toLowerCase()}s...` : currentStaff.placeholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currentStaff.loading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        currentStaff.data?.map(staff => (
                          <SelectItem key={staff.id} value={staff.id}>{staff.fullName}</SelectItem>
                        ))
                      )}
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
      <Button variant="outline" className="w-full" onClick={onGoogleSignIn} disabled={loadingDoctors}>
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 106.5 280.4 96 248 96c-84.3 0-152.3 67.8-152.3 151.8s68 151.8 152.3 151.8c99.1 0 127.9-81.5 133.7-114.3H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
        Sign in with Google
      </Button>
    </Form>
  )
}
