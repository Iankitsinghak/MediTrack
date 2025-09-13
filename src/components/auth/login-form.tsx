"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

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
import { UserRole, type Doctor, type Pharmacist, type Receptionist } from "@/lib/types"
import { useFirestore } from "@/hooks/use-firestore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


const formSchema = z.object({
  role: z.nativeEnum(UserRole),
  staffId: z.string({ required_error: "Please select your name." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

type StaffMember = (Doctor | Receptionist | Pharmacist) & { email: string };

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  
  const { data: doctors } = useFirestore<Doctor>('doctors');
  const { data: receptionists } = useFirestore<Receptionist>('receptionists');
  const { data: pharmacists } = useFirestore<Pharmacist>('pharmacists');
  const { data: admins } = useFirestore<any>('admins');

  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  })

  const selectedRole = form.watch("role");

  useEffect(() => {
    let currentList: StaffMember[] = [];
    if (selectedRole === UserRole.Doctor) {
      currentList = doctors as StaffMember[];
    } else if (selectedRole === UserRole.Receptionist) {
      currentList = receptionists as StaffMember[];
    } else if (selectedRole === UserRole.Pharmacist) {
      currentList = pharmacists as StaffMember[];
    } else if (selectedRole === UserRole.Admin) {
      currentList = admins as StaffMember[];
    }
    setStaffList(currentList);
    form.setValue("staffId", ""); // Reset staff selection when role changes
  }, [selectedRole, doctors, receptionists, pharmacists, admins, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const selectedStaff = staffList.find(staff => staff.id === values.staffId);
        if (!selectedStaff || !selectedStaff.email) {
            throw new Error("Could not find email for the selected staff member.");
        }
        
        const userCredential = await signInWithEmailAndPassword(auth, selectedStaff.email, values.password);
        const user = userCredential.user;

        toast({
            title: "Login Successful",
            description: `Welcome back, ${selectedStaff.fullName}! Redirecting...`,
        });
        
        let dashboardPath = `/${values.role.toLowerCase()}/dashboard`;
        if (values.role === UserRole.Doctor) {
            dashboardPath += `?doctorId=${user.uid}`;
        }
        
        router.push(dashboardPath);

    } catch (error: any) {
      console.error("Login Error:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/invalid-credential' || error.message.includes("Account not found")) {
        errorMessage = "Incorrect password or account not found. Please contact Admin.";
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
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <FormLabel>Name</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder={`Select your name`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {staffList.length > 0 ? staffList.map(staff => (
                      <SelectItem key={staff.id} value={staff.id!}>{staff.fullName}</SelectItem>
                    )) : <SelectItem value="-" disabled>No staff found for this role</SelectItem>}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
        <Button type="submit" className="w-full" disabled={!form.formState.isValid}>
          Log In
        </Button>
      </form>
    </Form>
  )
}
