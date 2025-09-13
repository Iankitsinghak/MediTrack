import { Users, Banknote, BedDouble, Package, Activity } from "lucide-react"
import { StatCard } from "./stat-card"
import type { StatCardData } from "@/lib/types"

const adminStats: StatCardData[] = [
  {
    title: "Total Staff",
    value: "215",
    icon: Users,
  },
  {
    title: "Revenue This Month",
    value: "$1.2M",
    icon: Banknote,
    change: "+12% from last month",
    changeType: "increase",
  },
  {
    title: "ICU Occupancy",
    value: "85%",
    icon: BedDouble,
    change: "2 beds available",
  },
  {
    title: "Inventory Value",
    value: "$450K",
    icon: Package,
  },
  {
    title: "Hospital Occupancy",
    value: "76%",
    icon: Activity,
    change: "-2% from yesterday",
    changeType: "decrease",
  }
]

export function AdminDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {adminStats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
      {/* Additional admin components for charts and management tables would go here */}
    </div>
  )
}
