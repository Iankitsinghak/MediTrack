
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
  CalendarDays,
  UserPlus,
  Users,
  UserCircle
} from "lucide-react"
import Link from "next/link"
import { usePathname } from 'next/navigation'

const receptionistNav = [
  { href: "/receptionist/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/receptionist/appointments", icon: CalendarDays, label: "Appointments" },
  { href: "/receptionist/register-patient", icon: UserPlus, label: "Register Patient" },
  { href: "/receptionist/patients", icon: Users, label: "Patients" },
  { href: "/receptionist/profile", icon: UserCircle, label: "Profile" },
]


export function SidebarNav() {
  const pathname = usePathname()

  return (
    <>
      <SidebarHeader>
        <Link href="/receptionist/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            <span className="font-headline">MediChain</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {receptionistNav.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
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
