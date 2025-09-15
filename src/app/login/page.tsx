
import Link from "next/link"
import { Suspense } from "react"
import { EmailLoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
       <Link href="/" className="flex items-center gap-2 font-bold text-2xl mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
        <span className="font-headline">MediTrack</span>
      </Link>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Select your role and name to sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <EmailLoginForm />
          </Suspense>
          
          <div className="mt-4 text-center text-sm">
            Need an admin account?{" "}
            <Link href="/signup" className="underline text-primary">
              Sign up here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
