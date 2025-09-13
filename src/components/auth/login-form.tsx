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
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs, setDoc, serverTimestamp } from "firebase/firestore"
import { UserRole } from "@/lib/types"
import { useFirestore } from "@/hooks/use-firestore"
import type { BaseUser } from "@/lib/types"

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

      toast({ title: "Login Successful", description: `Welcome back, ${user.displayName}!` });
      
      let dashboardPath = `/${values.role.toLowerCase()}/dashboard`;
      if (values.role === UserRole.Doctor) {
        dashboardPath += `?doctorId=${user.uid}`;
      }
      router.push(dashboardPath);
      router.refresh();

    } catch (error: any) {
      console.error("Login Error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials. Please check your password and try again.",
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
                <Select onValueChange={handleStaffChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={roleToStaffList[selectedRole].loading ? "Loading..." : "Select your name"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roleToStaffList[selectedRole].data.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>
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


async function findUserRole(uid: string): Promise<{role: UserRole, id: string} | null> {
    const roles: UserRole[] = [UserRole.Admin, UserRole.Doctor, UserRole.Receptionist, UserRole.Pharmacist];
    for (const role of roles) {
        const collectionName = `${role.toLowerCase()}s`;
        // In Firestore, the document ID is the UID now.
        const userDocRef = doc(db, collectionName, uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            return {role, id: userDoc.id};
        }
    }
    return null;
}

export function GoogleSignInButton() {
  const router = useRouter()
  const { toast } = useToast()

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      let userRoleInfo = await findUserRole(user.uid);
      
      if (!userRoleInfo) {
        // This is a first-time sign-in with Google, auto-assign role
        const adminsCollection = collection(db, 'admins');
        const adminsSnapshot = await getDocs(adminsCollection);
        const isFirstUser = adminsSnapshot.empty;
        
        const role = isFirstUser ? UserRole.Admin : UserRole.Doctor; // Default to Doctor if not first user
        const collectionName = `${role.toLowerCase()}s`;

        const userProfile: any = {
            uid: user.uid,
            fullName: user.displayName,
            email: user.email,
            role: role,
            createdAt: serverTimestamp()
        };
        
        if (role === UserRole.Doctor) {
            userProfile.department = "General Medicine"; // Default department for auto-assigned doctors
        }

        await setDoc(doc(db, collectionName, user.uid), userProfile);
        userRoleInfo = { role, id: user.uid };
        
        toast({
            title: "Account Created",
            description: `Your new ${role} account is ready. Welcome!`,
        });
      } else {
         toast({
            title: "Login Successful",
            description: `Welcome back, ${user.displayName}!`,
        });
      }
      
      let dashboardPath = `/${userRoleInfo.role.toLowerCase()}/dashboard`;
       if (userRoleInfo.role === UserRole.Doctor) {
          dashboardPath += `?doctorId=${userRoleInfo.id}`;
      }
      
      router.push(dashboardPath);

    } catch (error: any) {
      console.error("Login Error:", error);
      // Handle specific Firebase errors
      if (error.code === 'auth/account-exists-with-different-credential') {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "An account already exists with this email address using a different sign-in method.",
        });
      } else if (error.code === 'auth/auth-domain-config-required' || error.code === 'auth/unauthorized-domain') {
           toast({
            variant: "destructive",
            title: "Configuration Error",
            description: "This domain is not authorized for Google Sign-In. Please contact your administrator.",
        });
      } else {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message || "An unexpected error occurred.",
        });
      }
    }
  }

  return (
    <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.3 64.9C307.2 99.8 280.7 86 248 86c-84.3 0-152.3 67.8-152.3 152s68 152 152.3 152c92.8 0 135.2-63.5 140.8-95.3H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
      Sign in with Google
    </Button>
  )
}
