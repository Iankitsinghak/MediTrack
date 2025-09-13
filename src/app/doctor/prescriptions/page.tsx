"use client"

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Mic, FilePlus2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the interface for the SpeechRecognition API
interface CustomWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}
declare const window: CustomWindow;


export default function PrescriptionsPage() {
    const { toast } = useToast();
    const [isListening, setIsListening] = useState(false); 
    const [prescriptionText, setPrescriptionText] = useState("");
    const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsSpeechRecognitionSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                // Update text with the final part of the transcript
                setPrescriptionText(prev => prev + finalTranscript);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                toast({
                    variant: "destructive",
                    title: "Speech Recognition Error",
                    description: `An error occurred: ${event.error}`,
                });
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
                 toast({
                    title: "Dictation Stopped",
                    description: "Your voice input has been captured.",
                });
            };
            
            recognitionRef.current = recognition;
        } else {
             setIsSpeechRecognitionSupported(false);
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [toast]);

    const handleMicClick = () => {
        if (!isSpeechRecognitionSupported) {
             toast({
                variant: "destructive",
                title: "Browser Not Supported",
                description: "Your browser does not support speech recognition.",
            });
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
            toast({
                title: "Dictation Started",
                description: "Your voice is now being recorded. Click the mic again to stop.",
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
                    {!isSpeechRecognitionSupported && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Speech Recognition Not Supported</AlertTitle>
                            <AlertDescription>
                                Your browser doesn't support the Web Speech API. Please try a different browser like Chrome or type manually.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="grid gap-4">
                        {/* Simplified form for demonstration */}
                        <Textarea 
                            placeholder="e.g., Metoprolol 25mg, 1 tablet twice daily..."
                            className="min-h-[150px]"
                            value={prescriptionText}
                            onChange={(e) => setPrescriptionText(e.target.value)}
                        />
                        <div className="flex justify-between items-center">
                            <Button variant={isListening ? "destructive" : "outline"} size="icon" onClick={handleMicClick} disabled={!isSpeechRecognitionSupported}>
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
