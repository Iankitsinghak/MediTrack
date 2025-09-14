
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function Loading() {
    return (
        <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    )
}

export default function AppointmentsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Suspense fallback={<Loading />}>
            {children}
        </Suspense>
    )
}
