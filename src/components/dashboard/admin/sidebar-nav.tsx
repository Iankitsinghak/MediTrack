
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
  Banknote,
  BedDouble,
  Package,
  UserCircle
} from "lucide-react"
import Link from "next/link"
import { usePathname } from 'next/navigation'

const adminNav = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/staff", icon: Users, label: "Staff" },
  { href: "/admin/billing", icon: Banknote, label: "Billing" },
  { href: "/admin/icu-beds", icon: BedDouble, label: "ICU/Beds" },
  { href: "/admin/inventory", icon: Package, label: "Inventory" },
  { href: "/admin/profile", icon: UserCircle, label: "Profile" },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <>
      <SidebarHeader>
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            <span className="font-headline">MediChain</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {adminNav.map((item) => (
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
