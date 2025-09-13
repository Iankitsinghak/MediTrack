"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

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
import { UserRole } from "@/lib/types"
import { seedDatabase } from "@/lib/seed"

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

async function getUserRoleByUid(uid: string): Promise<{ role: UserRole; id: string } | null> {
  const collections: { name: string; role: UserRole }[] = [
    { name: 'admins', role: UserRole.Admin },
    { name: 'doctors', role: UserRole.Doctor },
    { name: 'receptionists', role: UserRole.Receptionist },
    { name: 'pharmacists', role: UserRole.Pharmacist },
  ];

  for (const { name, role } of collections) {
    const docRef = doc(db, name, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { role, id: docSnap.id };
    }
  }

  return null;
}


export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const roleInfo = await getUserRoleByUid(user.uid);

      if (roleInfo) {
        toast({
          title: "Login Successful",
          description: `Welcome back! Redirecting to your dashboard...`,
        });
        
        let dashboardPath = `/${roleInfo.role.toLowerCase()}/dashboard`;
        
        // Append IDs for roles that need it for data filtering
        if (roleInfo.role === UserRole.Doctor) {
            dashboardPath += `?doctorId=${roleInfo.id}`;
        }

        router.push(dashboardPath);

      } else {
        throw new Error("Account not found. Please contact Admin.");
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/invalid-credential' || error.message.includes("Account not found")) {
        errorMessage = "Account not found. Please contact Admin.";
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    }
  }
  
  const handleSeed = async () => {
    try {
      await seedDatabase();
      toast({
        title: "Database Seeded",
        description: "Dummy staff has been added to Firestore.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Seeding Failed",
        description: (error as Error).message,
      });
    }
  };


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
        <Button type="submit" className="w-full">
          Log In
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={handleSeed}>
          Seed Dummy Staff
        </Button>
      </form>
    </Form>
  )
}
