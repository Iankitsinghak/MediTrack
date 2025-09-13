"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { UserRole } from "@/lib/types"
import { useFirestore } from "@/hooks/use-firestore"
import type { BaseUser } from "@/lib/types"
import { getDoc, doc } from "firebase/firestore"

const loginSchema = z.object({
  role: z.nativeEnum(UserRole),
  staffId: z.string().min(1, "Please select your name."),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

export function EmailLoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  
  const { data: doctors, loading: loadingDoctors } = useFirestore<BaseUser>('doctors');
  const { data: receptionists, loading: loadingReceptionists } = useFirestore<BaseUser>('receptionists');
  const { data: pharmacists, loading: loadingPharmacists } = useFirestore<BaseUser>('pharmacists');
  const { data: admins, loading: loadingAdmins } = useFirestore<BaseUser>('admins');

  const roleToStaffList: Record<UserRole, { data: BaseUser[], loading: boolean }> = {
    [UserRole.Admin]: { data: admins, loading: loadingAdmins },
    [UserRole.Doctor]: { data: doctors, loading: loadingDoctors },
    [UserRole.Receptionist]: { data: receptionists, loading: loadingReceptionists },
    [UserRole.Pharmacist]: { data: pharmacists, loading: loadingPharmacists },
  };

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: "",
    },
  });

  const handleRoleChange = (value: string) => {
    const role = value as UserRole;
    setSelectedRole(role);
    form.setValue("role", role);
    form.resetField("staffId");
  };

  const handleStaffChange = (value: string) => {
    form.setValue("staffId", value);
  };
  
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    const staffList = roleToStaffList[values.role].data;
    const selectedStaff = staffList.find(s => s.id === values.staffId);

    if (!selectedStaff || !selectedStaff.email) {
      toast({ variant: "destructive", title: "Login Error", description: "Could not find selected staff member's email." });
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, selectedStaff.email, values.password);
      const user = userCredential.user;

      toast({ title: "Login Successful", description: `Welcome back, ${selectedStaff.fullName}!` });
      
      const userRoleDoc = await getDoc(doc(db, `${values.role.toLowerCase()}s`, user.uid));
      if (!userRoleDoc.exists()) {
        throw new Error("User role not found in database.");
      }
      const userData = userRoleDoc.data() as BaseUser;

      let dashboardPath = `/${userData.role.toLowerCase()}/dashboard`;
      if (userData.role === UserRole.Doctor) {
        dashboardPath += `?doctorId=${user.uid}`;
      }
      router.push(dashboardPath);
      router.refresh();

    } catch (error: any) {
      console.error("Login Error:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid credentials. Please check your selections and password and try again.";
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Role</FormLabel>
              <Select onValueChange={handleRoleChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(UserRole).map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedRole && (
          <FormField
            control={form.control}
            name="staffId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <Select onValueChange={handleStaffChange} value={field.value} defaultValue="">
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={roleToStaffList[selectedRole].loading ? "Loading..." : "Select your name"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roleToStaffList[selectedRole].data.map(s => (
                      <SelectItem key={s.id} value={s.id!}>{s.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {form.watch("staffId") && (
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
        )}

        <Button type="submit" className="w-full" disabled={!form.formState.isValid}>
          Sign In
        </Button>
      </form>
    </Form>
  )
}
