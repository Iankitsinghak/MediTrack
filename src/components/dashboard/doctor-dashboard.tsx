
"use client"

import { Users, CalendarDays, Activity, TrendingUp, TrendingDown } from "lucide-react"
import dynamic from 'next/dynamic';
import { StatCard } from "./stat-card"
import type { StatCardData } from "@/lib/types"
import { Skeleton } from "../ui/skeleton";

const PatientSummarizer = dynamic(() => import('./patient-summarizer').then(mod => mod.PatientSummarizer), {
  ssr: false,
  loading: () => <Skeleton className="h-[450px] w-full" />,
});


const doctorStats: StatCardData[] = [
  {
    title: "Total Patients",
    value: "1,254",
    icon: Users,
    change: "+20.1% from last month",
    changeType: "increase",
  },
  {
    title: "Appointments Today",
    value: "28",
    icon: CalendarDays,
    change: "+15 since yesterday",
    changeType: "increase",
  },
  {
    title: "Consultations This Week",
    value: "112",
    icon: Activity,
    change: "-5% from last week",
    changeType: "decrease",
  },
]

export function DoctorDashboard() {
  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 col-span-1 lg:col-span-2 xl:col-span-3">
        {doctorStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      <div className="xl:col-span-3">
        <PatientSummarizer />
      </div>
    </div>
  )
}
