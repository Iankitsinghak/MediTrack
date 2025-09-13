'use server';
/**
 * @fileOverview Summarizes patient consultation notes into structured data.
 *
 * - summarizeConsultationNotes - A function that summarizes patient consultation notes.
 * - SummarizeConsultationNotesInput - The input type for the summarizeConsultationNotes function.
 * - SummarizeConsultationNotesOutput - The return type for the summarizeConsultationNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeConsultationNotesInputSchema = z.object({
  notes: z.string().describe('Raw consultation notes from the doctor.'),
});
export type SummarizeConsultationNotesInput = z.infer<typeof SummarizeConsultationNotesInputSchema>;

const SummarizeConsultationNotesOutputSchema = z.object({
  condition: z.string().describe("The patient's condition as determined during the consultation."),
  treatment: z.string().describe('The treatment plan for the patient.'),
  nextSteps: z.string().describe('The next steps for the patient, including follow-up appointments, prescriptions, and lifestyle changes.'),
});
export type SummarizeConsultationNotesOutput = z.infer<typeof SummarizeConsultationNotesOutputSchema>;

export async function summarizeConsultationNotes(input: SummarizeConsultationNotesInput): Promise<SummarizeConsultationNotesOutput> {
  return summarizeConsultationNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeConsultationNotesPrompt',
  input: {schema: SummarizeConsultationNotesInputSchema},
  output: {schema: SummarizeConsultationNotesOutputSchema},
  prompt: `You are an AI assistant that helps doctors summarize patient consultation notes into a structured format.

  Given the following raw consultation notes, please extract the patient's condition, treatment plan, and next steps.

  Raw Notes: {{{notes}}}

  Please provide the output in the following format:
  {
    "condition": "The patient's condition.",
    "treatment": "The treatment plan for the patient.",
    "nextSteps": "The next steps for the patient, including follow-up appointments, prescriptions, and lifestyle changes."
  }`,
});

const summarizeConsultationNotesFlow = ai.defineFlow(
  {
    name: 'summarizeConsultationNotesFlow',
    inputSchema: SummarizeConsultationNotesInputSchema,
    outputSchema: SummarizeConsultationNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
