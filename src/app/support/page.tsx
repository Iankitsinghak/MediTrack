
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LifeBuoy, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <div className="flex flex-col items-center w-full">
                <Link href="/" className="flex items-center gap-2 font-bold text-2xl mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                    <span className="font-headline">MediChain</span>
                </Link>
                <Card className="w-full max-w-2xl shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                            <LifeBuoy className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-headline">Support Center</CardTitle>
                        <CardDescription>We're here to help. Contact us through any of the channels below.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="flex items-start gap-4 p-4 border rounded-lg">
                            <Mail className="h-6 w-6 text-muted-foreground mt-1" />
                            <div>
                                <h3 className="font-semibold">Email Support</h3>
                                <p className="text-muted-foreground text-sm mb-2">Best for non-urgent inquiries. We'll get back to you within 24 hours.</p>
                                <a href="mailto:support@medichain.example.com" className="text-primary font-medium hover:underline">
                                    support@medichain.example.com
                                </a>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 border rounded-lg">
                            <Phone className="h-6 w-6 text-muted-foreground mt-1" />
                            <div>
                                <h3 className="font-semibold">Phone Support</h3>
                                <p className="text-muted-foreground text-sm mb-2">Available for urgent issues from 9 AM to 6 PM on weekdays.</p>
                                <a href="tel:+1-800-555-0199" className="text-primary font-medium hover:underline">
                                    +1-800-555-0199
                                </a>
                            </div>
                        </div>
                         <div className="text-center mt-4">
                            <Link href="/" className="text-sm text-primary hover:underline">
                                Return to Homepage
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
