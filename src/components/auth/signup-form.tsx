"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore"
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



// This component remains for handling Google Sign-In, which can be an alternative way to create the first admin
export function GoogleSignInButton() {
  const router = useRouter()
  const { toast } = useToast()

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Ensure this is the first user
       const adminsCollection = collection(db, 'admins');
       const adminsSnapshot = await getDocs(adminsCollection);
       if (!adminsSnapshot.empty) {
           toast({
               variant: "destructive",
               title: "Signup Forbidden",
               description: "An administrator account already exists. Please use the email/password form or log in.",
           });
           return;
       }

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const { uid, displayName, email } = user;

      // Check if user already exists in ANY role collection to prevent accidental overwrites
      const roles: UserRole[] = [UserRole.Admin, UserRole.Doctor, UserRole.Receptionist, UserRole.Pharmacist];
      for (const role of roles) {
          const userDoc = await getDoc(doc(db, `${role.toLowerCase()}s`, uid));
          if (userDoc.exists()) {
              toast({
                  variant: "destructive",
                  title: "Account Already Exists",
                  description: "This Google account is already registered. Please log in.",
              });
              router.push('/login');
              return;
          }
      }
      
      // Since we checked, we can create the Admin account
      const userProfile = {
        uid,
        fullName: displayName,
        email,
        role: UserRole.Admin,
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, "admins", uid), userProfile);

      toast({
        title: "Admin Account Created",
        description: "Your Admin account has been created via Google. Redirecting...",
      });

      router.push(`/admin/dashboard`);

    } catch (error: any) {
      console.error("Signup Error:", error);
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  }

  return (
    <Button onClick={handleGoogleSignUp} variant="outline" className="w-full">
      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.3 64.9C307.2 99.8 280.7 86 248 86c-84.3 0-152.3 67.8-152.3 152s68 152 152.3 152c92.8 0 135.2-63.5 140.8-95.3H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
      Sign up with Google
    </Button>
  )
}
