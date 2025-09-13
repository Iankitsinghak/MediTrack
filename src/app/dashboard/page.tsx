import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DoctorDashboard } from "@/components/dashboard/doctor-dashboard"
import { PharmacistDashboard } from "@/components/dashboard/pharmacist-dashboard"
import { ReceptionistDashboard } from "@/components/dashboard/receptionist-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { UserRole } from "@/lib/types"
import { Stethoscope, Pill, BookUser, Shield } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
      <Tabs defaultValue={UserRole.Doctor} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value={UserRole.Doctor} className="flex gap-2">
            <Stethoscope className="h-4 w-4" /> Doctor
          </TabsTrigger>
          <TabsTrigger value={UserRole.Pharmacist} className="flex gap-2">
            <Pill className="h-4 w-4" /> Pharmacist
          </TabsTrigger>
          <TabsTrigger value={UserRole.Receptionist} className="flex gap-2">
            <BookUser className="h-4 w-4" /> Receptionist
          </TabsTrigger>
          <TabsTrigger value={UserRole.Admin} className="flex gap-2">
            <Shield className="h-4 w-4" /> Admin
          </TabsTrigger>
        </TabsList>
        <TabsContent value={UserRole.Doctor} className="space-y-4">
          <DoctorDashboard />
        </TabsContent>
        <TabsContent value={UserRole.Pharmacist} className="space-y-4">
          <PharmacistDashboard />
        </TabsContent>
        <TabsContent value={UserRole.Receptionist} className="space-y-4">
          <ReceptionistDashboard />
        </TabsContent>
        <TabsContent value={UserRole.Admin} className="space-y-4">
          <AdminDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
