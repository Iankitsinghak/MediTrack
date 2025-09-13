"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query } from "firebase/firestore"
import { UserRole } from "@/lib/types"

async function isFirstUser(): Promise<boolean> {
    const adminsCollection = collection(db, 'admins');
    const adminsSnapshot = await getDocs(adminsCollection);
    return adminsSnapshot.empty;
}

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const { uid, displayName, email } = user;

      // Check if user already has a role
      const roles: UserRole[] = [UserRole.Admin, UserRole.Doctor, UserRole.Receptionist, UserRole.Pharmacist];
      for (const role of roles) {
          const userDoc = await getDoc(doc(db, `${role.toLowerCase()}s`, uid));
          if (userDoc.exists()) {
              toast({
                  variant: "destructive",
                  title: "Account Already Exists",
                  description: "You already have an account. Please log in instead.",
              });
              router.push('/login');
              return;
          }
      }

      const firstUser = await isFirstUser();
      const userRole = firstUser ? UserRole.Admin : UserRole.Doctor; // Default to Doctor for subsequent signups
      const collectionName = `${userRole.toLowerCase()}s`;

      const userProfile: any = {
        uid,
        fullName: displayName,
        email,
        role: userRole,
        createdAt: serverTimestamp()
      };

      if (userRole === UserRole.Doctor) {
        userProfile.department = "General Medicine"; // Default department
      }
      
      await setDoc(doc(db, collectionName, uid), userProfile);

      toast({
        title: "Account Created",
        description: `Your ${userRole} account has been created. Redirecting...`,
      });

      let dashboardPath = `/${userRole.toLowerCase()}/dashboard`;
      if (userRole === UserRole.Doctor) {
          dashboardPath += `?doctorId=${uid}`;
      }
      router.push(dashboardPath);

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
    <Button onClick={handleGoogleSignUp} className="w-full">
      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.3 64.9C307.2 99.8 280.7 86 248 86c-84.3 0-152.3 67.8-152.3 152s68 152 152.3 152c92.8 0 135.2-63.5 140.8-95.3H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
      Sign up with Google
    </Button>
  )
}
