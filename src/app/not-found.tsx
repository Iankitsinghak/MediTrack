import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center">
      <p className="text-base font-semibold text-primary">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">Page not found</h1>
      <p className="mt-6 text-base leading-7 text-muted-foreground">Sorry, we couldn’t find the page you’re looking for.</p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Button asChild>
          <Link href="/">Go back home</Link>
        </Button>
        <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
        </Button>
      </div>
    </div>
  )
}
