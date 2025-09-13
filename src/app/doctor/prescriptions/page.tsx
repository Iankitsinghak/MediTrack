"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Mic, FilePlus2 } from "lucide-react";

export default function PrescriptionsPage() {
    // In a real app, this would be a state managed by a speech recognition hook
    const isListening = false; 

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
                        />
                        <div className="flex justify-between items-center">
                            <Button variant={isListening ? "destructive" : "outline"} size="icon">
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
