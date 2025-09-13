
"use server"

import { summarizeConsultationNotes, SummarizeConsultationNotesOutput } from "@/ai/flows/summarize-patient-consultation-notes"

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
