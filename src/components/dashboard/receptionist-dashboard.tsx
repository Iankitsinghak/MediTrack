import { BookUser, CalendarCheck, UserPlus, Users } from "lucide-react"
import { StatCard } from "./stat-card"
import type { StatCardData, Appointment } from "@/lib/types"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const receptionistStats: StatCardData[] = [
  {
    title: "Patients Registered Today",
    value: "12",
    icon: UserPlus,
    change: "+2 from yesterday",
    changeType: "increase",
  },
  {
    title: "Total Patients",
    value: "1,254",
    icon: Users,
  },
  {
    title: "Appointments Scheduled",
    value: "45",
    icon: CalendarCheck,
    change: "for today",
  },
  {
    title: "Available Beds",
    value: "18",
    icon: BookUser,
  },
]

const upcomingAppointments: Partial<Appointment>[] = [
    { patientName: "Alice Johnson", doctorName: "Dr. Smith", date: new Date(new Date().setHours(10, 0, 0, 0)), reason: "Annual Checkup" },
    { patientName: "Bob Williams", doctorName: "Dr. Evans", date: new Date(new Date().setHours(10, 30, 0, 0)), reason: "Follow-up" },
    { patientName: "Charlie Brown", doctorName: "Dr. Patel", date: new Date(new Date().setHours(11, 0, 0, 0)), reason: "Consultation" },
    { patientName: "Diana Miller", doctorName: "Dr. Smith", date: new Date(new Date().setHours(12, 15, 0, 0)), reason: "New Patient Visit" },
];

export function ReceptionistDashboard() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {receptionistStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Appointment Scheduler</CardTitle>
            <CardDescription>Select a date to view or book appointments.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Appointments scheduled for today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.map((appt, index) => (
                 <div key={index} className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://picsum.photos/seed/patient${index}/40/40`} alt="Avatar" />
                        <AvatarFallback>{appt.patientName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">{appt.patientName}</p>
                        <p className="text-sm text-muted-foreground">{appt.reason}</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="font-medium">{appt.date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-sm text-muted-foreground">{appt.doctorName}</p>
                    </div>
                 </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
