
"use server"

import { summarizeConsultationNotes, type SummarizeConsultationNotesOutput } from "@/ai/flows/summarize-patient-consultation-notes"

export interface FormState {
  summary: SummarizeConsultationNotesOutput | null;
  error: string | null;
  key: number; // Add a key to force re-rendering of children
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
      key: prevState.key + 1,
    }
  }

  try {
    const summary = await summarizeConsultationNotes({ notes });
    return {
      summary: summary,
      error: null,
      key: prevState.key + 1,
    }
  } catch (error) {
    console.error("Summarization error:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      summary: null,
      error: `An unexpected error occurred while summarizing the notes. Please try again. Details: ${errorMessage}`,
      key: prevState.key + 1,
    }
  }
}
