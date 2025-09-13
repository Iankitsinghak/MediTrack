"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Hospital } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getDoctors, getAvailableBeds, registerPatient, scheduleAppointment } from "@/lib/data"

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  dateOfBirth: z.date({ required_error: "A date of birth is required." }),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Please select a gender." }),
  doctorId: z.string({ required_error: "Please select a doctor." }),
  needsBed: z.enum(["Yes", "No"], { required_error: "Please specify if a bed is needed." }),
  bedId: z.string().optional(),
  appointmentDate: z.date({ required_error: "An appointment date is required." }),
  appointmentTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:mm."),
  reason: z.string().min(3, "A reason for the visit is required."),
}).refine(data => {
    if (data.needsBed === "Yes") {
        return !!data.bedId;
    }
    return true;
}, {
    message: "Please select a bed number.",
    path: ["bedId"],
});

export default function RegisterPatientPage() {
    const router = useRouter();
    const { toast } = useToast();
    const doctors = getDoctors();
    const availableBeds = getAvailableBeds();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            gender: undefined,
            doctorId: undefined,
            needsBed: "No",
            bedId: undefined,
            appointmentTime: "09:00",
            reason: "Initial Consultation",
        },
    })

    const needsBed = form.watch("needsBed");

    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // 1. Register the patient
            const newPatient = registerPatient({
                fullName: values.fullName,
                dateOfBirth: format(values.dateOfBirth, "yyyy-MM-dd"),
                gender: values.gender,
                doctorId: values.doctorId,
                bedId: values.bedId,
            });

            // 2. Schedule the initial appointment
            const [hours, minutes] = values.appointmentTime.split(':').map(Number);
            const appointmentDateTime = new Date(values.appointmentDate);
            appointmentDateTime.setHours(hours, minutes);

            scheduleAppointment({
                patientId: newPatient.id,
                doctorId: values.doctorId,
                date: appointmentDateTime,
                reason: values.reason,
            });
            
            toast({
                title: "Patient Registered Successfully",
                description: `${values.fullName} has been registered and an appointment is scheduled.`,
            });

            // Redirect to the new patient's page or the main patient list
            router.push("/receptionist/patients");
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Registration Failed",
                description: "An unexpected error occurred. Please try again.",
            });
            console.error("Registration failed", error);
        }
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
                <Hospital className="h-8 w-8" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Register New Patient</h1>
                    <p className="text-muted-foreground">Fill out the form to add a new patient and schedule their first appointment.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Patient Registration Form</CardTitle>
                    <CardDescription>All fields marked with an asterisk (*) are required.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dateOfBirth"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date of Birth *</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="doctorId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Assign Doctor *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a doctor" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {doctors.map(doc => (
                                                        <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="appointmentDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Appointment Date *</FormLabel>
                                             <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="appointmentTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Appointment Time *</FormLabel>
                                            <FormControl><Input type="time" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                               <FormField
                                    control={form.control}
                                    name="reason"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Reason for Visit *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Initial Consultation, Annual Checkup" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="needsBed"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Needs Bed Admission?</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex items-center space-x-4"
                                                >
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="Yes" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Yes</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="No" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">No</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {needsBed === 'Yes' && (
                                     <FormField
                                        control={form.control}
                                        name="bedId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Assign Bed Number *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select an available bed" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {availableBeds.map(bed => (
                                                            <SelectItem key={bed.id} value={bed.id}>Bed {bed.number}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Only non-occupied beds are shown.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button type="submit">Register Patient & Schedule</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
