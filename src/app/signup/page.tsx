import Link from "next/link"
import { AdminSignupForm, GoogleSignInButton } from "@/components/auth/signup-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Link href="/" className="flex items-center gap-2 font-bold text-2xl mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
        <span className="font-headline">MediChain</span>
      </Link>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Create Admin Account</CardTitle>
          <CardDescription>Sign up to become the first administrator.</CardDescription>
        </CardHeader>
        <CardContent>
           <Alert className="mb-6">
              <Shield className="h-4 w-4" />
              <AlertTitle>Admin Registration</AlertTitle>
              <AlertDescription>
                This form is for registering the primary administrator account. All other staff accounts (Doctors, etc.) must be created by an Admin from the dashboard.
              </AlertDescription>
            </Alert>
          <AdminSignupForm />
          <div className="relative my-6">
            <Separator />
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>
           <GoogleSignInButton />
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline text-primary">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
