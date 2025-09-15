
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LifeBuoy, Mail, Phone, Send } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function SupportPage() {
    const { toast } = useToast();

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Message Sent!",
            description: "Thank you for your feedback. Our team will get back to you shortly.",
        });
        // In a real app, you would handle the form submission here.
        // For this prototype, we just show a toast.
        const form = e.target as HTMLFormElement;
        form.reset();
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <div className="flex flex-col items-center w-full max-w-4xl">
                <Link href="/" className="flex items-center gap-2 font-bold text-2xl mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                    <span className="font-headline">MediTrack</span>
                </Link>
                <div className="grid md:grid-cols-2 gap-8 w-full">
                    <Card className="shadow-lg">
                        <CardHeader className="text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                                <LifeBuoy className="h-10 w-10 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-headline">Contact Support</CardTitle>
                            <CardDescription>We're here to help. Contact us through any of the channels below.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="flex items-start gap-4 p-4 border rounded-lg">
                                <Mail className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold">Email Support</h3>
                                    <p className="text-muted-foreground text-sm mb-2">Best for non-urgent inquiries. We'll get back to you within 24 hours.</p>
                                    <a href="mailto:support@meditrack.example.com" className="text-primary font-medium hover:underline text-sm break-all">
                                        support@meditrack.example.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 border rounded-lg">
                                <Phone className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold">Phone Support</h3>
                                    <p className="text-muted-foreground text-sm mb-2">Available for urgent issues from 9 AM to 6 PM on weekdays.</p>
                                    <a href="tel:+1-800-555-0199" className="text-primary font-medium hover:underline text-sm">
                                        +1-800-555-0199
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline">Send a Message</CardTitle>
                            <CardDescription>Have a question or feedback? Drop us a line.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleFormSubmit}>
                                <Input name="email" type="email" placeholder="Your Email Address" required />
                                <Input name="subject" type="text" placeholder="Subject" required />
                                <Textarea name="message" placeholder="Type your query here..." className="min-h-[150px]" required />
                                <Button type="submit" className="w-full">
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Message
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                 <div className="text-center mt-8">
                    <Button variant="link" asChild>
                        <Link href="/login">
                            Return to Login
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
