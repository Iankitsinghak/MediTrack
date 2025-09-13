"use client"

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { UserRole } from "@/lib/types";

function GoogleIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
        </svg>
    )
}


export function GoogleSignInButton() {
    const { toast } = useToast();
    const router = useRouter();

    const onGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            // Check if the user exists in any of our role collections
            const adminDoc = await getDoc(doc(db, "admins", user.uid));
            if (adminDoc.exists()) {
                router.push('/admin/dashboard');
                toast({ title: "Login Successful", description: `Welcome back, Admin!` });
                return;
            }

            const doctorDoc = await getDoc(doc(db, "doctors", user.uid));
             if (doctorDoc.exists()) {
                router.push(`/doctor/dashboard?doctorId=${user.uid}`);
                toast({ title: "Login Successful", description: `Welcome back, Doctor!` });
                return;
            }

            // This is a new user, create their profile.
            // For simplicity in this prototype, the first user is admin, others are doctors.
            // A real app would use a Cloud Function or an invite system.
            const adminsQuery = await getDoc(doc(db, "admins_count", "count"));
            const isAdminCollectionEmpty = !adminsQuery.exists() || adminsQuery.data().total === 0;
            
            let role = UserRole.Doctor;
            let userProfile: any = {
                uid: user.uid,
                fullName: user.displayName,
                email: user.email,
                createdAt: serverTimestamp(),
            };

            if (isAdminCollectionEmpty) {
                role = UserRole.Admin;
                userProfile.role = UserRole.Admin;
                await setDoc(doc(db, "admins", user.uid), userProfile);
                // Simple counter to track if admin exists.
                await setDoc(doc(db, "admins_count", "count"), { total: 1 });
            } else {
                 userProfile.role = UserRole.Doctor;
                 userProfile.department = "General Medicine"; // Default department
                 await setDoc(doc(db, "doctors", user.uid), userProfile);
            }

            toast({
                title: "Account Created",
                description: `Welcome, ${user.displayName}! Your account has been created.`,
            });
            
            let dashboardPath = `/${role.toLowerCase()}/dashboard`;
            if (role === 'Doctor') {
                dashboardPath += `?doctorId=${user.uid}`;
            }
            router.push(dashboardPath);

        } catch (error: any) {
            console.error("Google Sign-In Error:", error);
            let description = "An unexpected error occurred during Google sign-in.";
            if (error.code === 'auth/popup-closed-by-user') {
                description = "The sign-in window was closed. Please try again.";
            } else if (error.code === 'auth/network-request-failed') {
                description = "Network error. Please ensure you've authorized this domain in your Firebase console's Authentication settings.";
            }
             toast({
                variant: "destructive",
                title: "Sign-In Failed",
                description: description,
            });
        }
    };


    return (
        <Button variant="outline" className="w-full gap-2" onClick={onGoogleSignIn}>
            <GoogleIcon />
            Sign in with Google
        </Button>
    )
}
