"use server"

import type { User } from "firebase/auth";
import { getFirestore } from "firebase-admin/firestore";
import { UserRole } from "./types";

/**
 * Handles the logic after a successful Google Sign-In.
 * Checks if the user exists in any role collection. If not, creates them.
 * The first user ever becomes an Admin. Subsequent users become Doctors.
 */
export async function handleGoogleSignIn(user: User): Promise<{ role: UserRole, error?: string }> {
    const firestore = getFirestore();
    const uid = user.uid;

    const roles: UserRole[] = [UserRole.Admin, UserRole.Doctor, UserRole.Receptionist, UserRole.Pharmacist];
    
    // 1. Check if user already exists in any collection
    for (const role of roles) {
        const collectionName = `${role.toLowerCase()}s`;
        const userDoc = await firestore.collection(collectionName).doc(uid).get();
        if (userDoc.exists) {
            return { role: userDoc.data()?.role };
        }
    }

    // 2. If user is new, determine their role
    const adminsSnapshot = await firestore.collection('admins').limit(1).get();
    let newRole: UserRole;
    let newUserProfile: any = {
        uid: user.uid,
        fullName: user.displayName,
        email: user.email,
        createdAt: new Date(),
    };

    if (adminsSnapshot.empty) {
        // First user becomes an Admin
        newRole = UserRole.Admin;
        newUserProfile.role = newRole;
        await firestore.collection('admins').doc(uid).set(newUserProfile);
    } else {
        // Subsequent new users default to Doctor
        newRole = UserRole.Doctor;
        newUserProfile.role = newRole;
        newUserProfile.department = "General Medicine"; // Default department
        await firestore.collection('doctors').doc(uid).set(newUserProfile);
    }
    
    return { role: newRole };
}
