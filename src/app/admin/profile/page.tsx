
"use client"

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Admin } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Phone } from "lucide-react";

export default function AdminProfilePage() {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const docRef = doc(db, "admins", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAdmin({ id: docSnap.id, ...docSnap.data() } as Admin);
                }
                setLoading(false);
            } else {
                // Handle case where user is not logged in
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Your Profile</h1>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Administrator Profile</CardTitle>
                    <CardDescription>Your personal and contact information.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        </div>
                    ) : admin ? (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <Avatar className="h-24 w-24 text-3xl">
                                    <AvatarImage src={`https://picsum.photos/seed/${admin.uid}/100/100`} alt="Admin Avatar" />
                                    <AvatarFallback>{admin.fullName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-2xl font-bold font-headline">{admin.fullName}</h2>
                                    <p className="text-muted-foreground">Administrator</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-muted-foreground">{admin.email}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-muted-foreground">{admin.phone}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">Could not load admin profile. Please try logging in again.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
