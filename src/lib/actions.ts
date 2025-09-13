
"use server"

import { summarizeConsultationNotes, SummarizeConsultationNotesOutput } from "@/ai/flows/summarize-patient-consultation-notes"
import { auth } from "@/lib/firebase-admin";
import { UserRole } from "./types";
import { serverTimestamp } from "firebase/firestore";
import { getFirestore } from "firebase-admin/firestore";

export interface FormState {
  summary: SummarizeConsultationNotesOutput | null;
  error: string | null;
}

export async function handleSummarization(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const notes = formData.get("notes") as string

  if (!notes || notes.trim().length === 0) {
    return {
      summary: null,
      error: "Consultation notes cannot be empty.",
    }
  }

  try {
    const summary = await summarizeConsultationNotes({ notes })
    return {
      summary: summary,
      error: null,
    }
  } catch (error) {
    console.error("Summarization error:", error)
    return {
      summary: null,
      error: "An unexpected error occurred while summarizing the notes. Please try again.",
    }
  }
}

interface AddStaffValues {
    fullName: string;
    email: string;
    password?: string;
    role: UserRole;
    department?: string;
}

export async function handleAddStaff(values: AddStaffValues): Promise<{ error?: string }> {
    const { email, password, fullName, role, department } = values;
    
    if (!password) {
        return { error: "Password is required." };
    }

    try {
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: fullName,
        });

        const userProfile: any = {
            uid: userRecord.uid,
            fullName,
            email,
            role,
            createdAt: serverTimestamp()
        };

        if (role === UserRole.Doctor && department) {
            userProfile.department = department;
        }
        
        const firestore = getFirestore();
        await firestore.collection(`${role.toLowerCase()}s`).doc(userRecord.uid).set(userProfile);

        return {};
    } catch (error: any) {
        console.error("Error adding staff:", error);
        if (error.code === 'auth/email-already-exists') {
            return { error: "This email address is already in use by another account." };
        }
        return { error: error.message || "An unexpected error occurred while creating the user." };
    }
}
