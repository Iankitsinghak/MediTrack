
"use client"

import { useFormStatus } from "react-dom"
import { useActionState, useEffect } from "react"
import { Bot, Clipboard, FileText, HeartPulse, Sparkles, Stethoscope, Syringe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { handleSummarization, type FormState } from "@/lib/actions"
import { Skeleton } from "../ui/skeleton"
import { useToast } from "@/hooks/use-toast"

const initialState: FormState = {
  summary: null,
  error: null,
  key: 0,
}

const defaultNotes = `Patient: John Appleseed, 45M.
Complains of intermittent chest pain, shortness of breath, especially during exertion. Symptoms started 3 months ago, worsening over the last 2 weeks.
History of hypertension, hyperlipidemia. Father had an MI at 55.
Physical Exam: BP 145/90, HR 88, regular. Mild bilateral pedal edema. Lungs clear.
ECG shows non-specific ST-T wave changes.
Assessment: Stable angina, likely coronary artery disease.
Plan: Start Aspirin 81mg daily, Metoprolol 25mg BID. Schedule for a stress test next week. Refer to cardiology. Patient to monitor BP at home. Follow-up in 2 weeks to review stress test results and BP log. Lifestyle modifications discussed: low-sodium diet, 30 mins of moderate exercise 5x/week.`

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
          Summarizing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Summary
        </>
      )}
    </Button>
  )
}

function SummaryResult({ summary }: { summary: FormState["summary"] }) {
  if (!summary) return null

  const summaryItems = [
    { icon: Stethoscope, title: "Condition", content: summary.condition },
    { icon: Syringe, title: "Treatment", content: summary.treatment },
    { icon: FileText, title: "Next Steps", content: summary.nextSteps },
  ]
  
  return (
    <div className="grid gap-4 md:grid-cols-3 mt-6">
      {summaryItems.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <item.icon className="h-6 w-6 text-primary" />
            <CardTitle className="text-lg font-headline">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{item.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function SummarySkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-3 mt-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                    <Stethoscope className="h-6 w-6 text-muted-foreground" />
                    <CardTitle className="text-lg font-headline">Condition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                    <Syringe className="h-6 w-6 text-muted-foreground" />
                    <CardTitle className="text-lg font-headline">Treatment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <CardTitle className="text-lg font-headline">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

export function PatientSummarizer() {
  const [state, formAction] = useActionState(handleSummarization, initialState)
  const { pending } = useFormStatus()
  const { toast } = useToast()

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Summarization Failed",
        description: state.error,
      })
    }
  }, [state.error, state.key, toast])

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
                <Bot className="h-8 w-8 text-primary" />
            </div>
            <div>
                <CardTitle className="text-2xl font-headline">AI Patient Note Summarizer</CardTitle>
                <CardDescription>
                  Enter raw consultation notes to automatically generate a structured summary.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <Textarea
            name="notes"
            placeholder="Paste or type patient consultation notes here..."
            className="min-h-[200px] text-base"
            defaultValue={defaultNotes}
          />
          <div className="mt-4 flex flex-col sm:flex-row justify-end items-center gap-4">
             <p className="text-xs text-muted-foreground text-center sm:text-left">
              The AI analyzes medical data to extract condition, treatment, and next steps for your review.
            </p>
            <SubmitButton />
          </div>
        </form>
        {pending ? <SummarySkeleton /> : <SummaryResult key={state.key} summary={state.summary} />}
      </CardContent>
    </Card>
  )
}
