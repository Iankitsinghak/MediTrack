"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Mic, FilePlus2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PrescriptionsPage() {
    const { toast } = useToast();
    const [isListening, setIsListening] = useState(false); 
    const [prescriptionText, setPrescriptionText] = useState("");

    const handleMicClick = () => {
        // In a real app, this would integrate with the Web Speech API.
        // For now, we'll just toggle the state and show a toast.
        const nextState = !isListening;
        setIsListening(nextState);
        
        if (nextState) {
            toast({
                title: "Dictation Started",
                description: "Your voice is now being recorded. Click the mic again to stop.",
            });
            // Simulate voice input
            setTimeout(() => {
                if(isListening){
                   setPrescriptionText(prev => prev + "Metoprolol 25mg, 1 tablet twice daily. ");
                }
            }, 2000);
        } else {
             toast({
                title: "Dictation Stopped",
                description: "Your voice input has been captured.",
            });
        }
    }


    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Prescriptions</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Create New Prescription</CardTitle>
                    <CardDescription>Write a new prescription or use voice-to-text to dictate.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {/* Simplified form for demonstration */}
                        <Textarea 
                            placeholder="e.g., Metoprolol 25mg, 1 tablet twice daily..."
                            className="min-h-[150px]"
                            value={prescriptionText}
                            onChange={(e) => setPrescriptionText(e.target.value)}
                        />
                        <div className="flex justify-between items-center">
                            <Button variant={isListening ? "destructive" : "outline"} size="icon" onClick={handleMicClick}>
                                <Mic className="h-4 w-4" />
                                <span className="sr-only">{isListening ? "Stop Listening" : "Start Dictation"}</span>
                            </Button>
                            <Button>
                                <FilePlus2 className="mr-2 h-4 w-4" />
                                Create Prescription
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Prescription History</CardTitle>
                    <CardDescription>Review prescriptions you have written for your patients.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Prescription history interface will be here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
