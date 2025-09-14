
"use client"

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  Pill,
  CalendarDays,
  FlaskConical,
  FileText,
  UserCircle
} from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from 'next/navigation'

export function SidebarNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const doctorId = searchParams.get('doctorId')

  const doctorNav = [
    { href: `/doctor/dashboard?doctorId=${doctorId}`, icon: LayoutDashboard, label: "Dashboard" },
    { href: `/doctor/patients?doctorId=${doctorId}`, icon: Users, label: "Patients" },
    { href: `/doctor/appointments?doctorId=${doctorId}`, icon: CalendarDays, label: "Appointments" },
    { href: `/doctor/consultations?doctorId=${doctorId}`, icon: FileText, label: "Consultations" },
    { href: `/doctor/lab-requests?doctorId=${doctorId}`, icon: FlaskConical, label: "Lab Requests" },
    { href: `/doctor/prescriptions?doctorId=${doctorId}`, icon: Pill, label: "Prescriptions" },
    { href: `/doctor/profile?doctorId=${doctorId}`, icon: UserCircle, label: "Profile" },
  ]

  return (
    <>
      <SidebarHeader>
        <Link href={`/doctor/dashboard?doctorId=${doctorId}`} className="flex items-center gap-2 font-bold text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            <span className="font-headline">MediChain</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {doctorNav.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href.split('?')[0]}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  )
}
