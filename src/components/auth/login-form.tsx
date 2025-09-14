
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
import { auth } from "@/lib/firebase"
import { UserRole } from "@/lib/types"
import { useFirestore } from "@/hooks/use-firestore"
import type { BaseUser } from "@/lib/types"
import { Loader2 } from "lucide-react"

const loginSchema = z.object({
  role: z.nativeEnum(UserRole),
  email: z.string().optional(), // Admin will use email
  staffId: z.string().optional(), // Other roles will use staffId
  password: z.string().min(6, "Password must be at least 6 characters."),
}).refine(data => {
    if (data.role === UserRole.Admin) {
        return !!data.email && z.string().email().safeParse(data.email).success;
    }
    return !!data.staffId;
}, {
    message: "A valid selection or email is required.",
    path: ["email"], // Arbitrarily point to one, the form will handle showing the right message
});

export function EmailLoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: doctors, loading: loadingDoctors } = useFirestore<BaseUser>('doctors');
  const { data: receptionists, loading: loadingReceptionists } = useFirestore<BaseUser>('receptionists');
  const { data: pharmacists, loading: loadingPharmacists } = useFirestore<BaseUser>('pharmacists');
  const { data: admins, loading: loadingAdmins } = useFirestore<BaseUser>('admins');

  const roleToStaffList: Record<string, { data: BaseUser[], loading: boolean }> = {
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
    form.resetField("email");
  };
  
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    let emailToLogin: string | undefined;
    let userFullName: string | undefined;
    let staffId: string | undefined;

    if (values.role === UserRole.Admin) {
        emailToLogin = values.email;
        const adminUser = admins.find(a => a.email === emailToLogin);
        userFullName = adminUser?.fullName ?? "Admin";
        staffId = adminUser?.uid;
    } else if (values.staffId) {
        const staffList = roleToStaffList[values.role].data;
        const selectedStaff = staffList.find(s => s.id === values.staffId);
        if (!selectedStaff || !selectedStaff.email) {
          toast({ variant: "destructive", title: "Login Error", description: "Could not find selected staff member's email." });
          setIsLoading(false);
          return;
        }
        emailToLogin = selectedStaff.email;
        userFullName = selectedStaff.fullName;
        staffId = selectedStaff.uid;
    }

    if (!emailToLogin) {
         toast({ variant: "destructive", title: "Login Error", description: "No valid user selected or email provided." });
         setIsLoading(false);
         return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, values.password);
      const user = userCredential.user;

      toast({ title: "Login Successful", description: `Welcome back, ${userFullName}!` });
      
      let dashboardPath = `/${values.role.toLowerCase()}/dashboard`;
      if (values.role === UserRole.Doctor) {
        dashboardPath += `?doctorId=${user.uid}`;
      }
      router.push(dashboardPath);

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
    } finally {
        setIsLoading(false);
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

        {selectedRole && selectedRole === UserRole.Admin && (
          <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                  <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl><Input type="email" placeholder="admin@medichain.com" {...field} /></FormControl>
                      <FormMessage />
                  </FormItem>
              )}
          />
        )}

        {selectedRole && selectedRole !== UserRole.Admin && (
          <FormField
            control={form.control}
            name="staffId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''} defaultValue="">
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={roleToStaffList[selectedRole!].loading ? "Loading..." : "Select your name"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roleToStaffList[selectedRole!].data.map(s => (
                      <SelectItem key={s.id} value={s.id!}>{s.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {selectedRole && (
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

        <Button type="submit" className="w-full" disabled={!form.formState.isValid || isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </Form>
  )
}
