
"use client"

import { useState, useEffect } from "react"
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
import type { BaseUser, Doctor, Receptionist, Pharmacist, Admin } from "@/lib/types"
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


function StaffSelector({ role, control, loadingPlaceholder }: { role: UserRole, control: any, loadingPlaceholder: string }) {
    const { data: staffList, loading } = useFirestore<BaseUser>(`${role.toLowerCase()}s`);

    return (
        <FormField
            control={control}
            name="staffId"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''} defaultValue="">
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={loading ? loadingPlaceholder : "Select your name"} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {staffList.map(s => (
                                <SelectItem key={s.id} value={s.id!}>{s.fullName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}


export function EmailLoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false);
  
  // We no longer fetch all data upfront.
  // The data will be fetched inside the StaffSelector component when it renders.
  
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
    
    try {
        if (values.role === UserRole.Admin) {
            emailToLogin = values.email;
            // For admin, we don't have the list upfront, so we'll just say "Admin"
            userFullName = "Admin";
        } else if (values.staffId) {
            // This part is tricky without fetching data again. We'll proceed with auth
            // and get the user details from the auth user object if possible, or make another fetch.
            // For now, let's simplify and rely on Firestore for user info post-login.
            // A better way is to fetch the single user doc after getting the ID.
            // But for now, we'll keep it simple.
            const userDocModule = await import("firebase/firestore");
            const userDocRef = userDocModule.doc(auth.currentUser!.firestore, `${values.role.toLowerCase()}s`, values.staffId);
            const userDoc = await userDocModule.getDoc(userDocRef);

            if (!userDoc.exists() || !userDoc.data()?.email) {
                 throw new Error("Could not find selected staff member's email.");
            }
            emailToLogin = userDoc.data()?.email;
            userFullName = userDoc.data()?.fullName;
        }

        // A temporary workaround to get the email for non-admins
        if (values.role !== UserRole.Admin && values.staffId) {
             const userDocModule = await import("firebase/firestore");
             const { db } = await import("@/lib/firebase");
             const docRef = userDocModule.doc(db, `${values.role.toLowerCase()}s`, values.staffId);
             const docSnap = await userDocModule.getDoc(docRef);
             if (docSnap.exists()) {
                 emailToLogin = docSnap.data().email;
                 userFullName = docSnap.data().fullName;
             } else {
                 throw new Error("Selected user not found.");
             }
        } else if (values.role === UserRole.Admin) {
            emailToLogin = values.email;
            userFullName = "Admin";
        }


        if (!emailToLogin) {
            throw new Error("No valid user selected or email provided.");
        }

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
        } else if (error.message) {
            errorMessage = error.message;
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
          <StaffSelector 
            role={selectedRole}
            control={form.control}
            loadingPlaceholder="Loading..."
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
