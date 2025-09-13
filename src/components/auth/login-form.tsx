"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs, setDoc, serverTimestamp } from "firebase/firestore"
import { UserRole } from "@/lib/types"

async function findUserRole(uid: string): Promise<UserRole | null> {
    const roles: UserRole[] = [UserRole.Admin, UserRole.Doctor, UserRole.Receptionist, UserRole.Pharmacist];
    for (const role of roles) {
        const collectionName = `${role.toLowerCase()}s`;
        const userDocRef = doc(db, collectionName, uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            return role;
        }
    }

    // Check by email as a fallback for users added by admin before their first login
    // This is less ideal because a user's google email could differ, but it's a good fallback
    const user = auth.currentUser;
    if (user?.email) {
        for (const role of roles) {
            const collectionName = `${role.toLowerCase()}s`;
            const q = query(collection(db, collectionName), where("email", "==", user.email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                // We found a user, let's update their doc to use UID as the key
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                await setDoc(doc(db, collectionName, user.uid), {...userData, uid: user.uid });
                return role;
            }
        }
    }


    return null;
}


export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      let userRole = await findUserRole(user.uid);
      
      if (!userRole) {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Your account has not been configured by an administrator. Please contact support.",
        });
        await auth.signOut(); // Sign out the user as they don't have a role
        return;
      }
      
      toast({
        title: "Login Successful",
        description: `Welcome back! Redirecting...`,
      });
      
      let dashboardPath = `/${userRole.toLowerCase()}/dashboard`;
      if (userRole === UserRole.Doctor) {
          dashboardPath += `?doctorId=${user.uid}`;
      }
      
      router.push(dashboardPath);

    } catch (error: any) {
      console.error("Login Error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  }

  return (
    <Button onClick={handleGoogleSignIn} className="w-full">
      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.3 64.9C307.2 99.8 280.7 86 248 86c-84.3 0-152.3 67.8-152.3 152s68 152 152.3 152c92.8 0 135.2-63.5 140.8-95.3H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
      Sign in with Google
    </Button>
  )
}
