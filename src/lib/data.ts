// In a real application, this would be a database connection.
// For this prototype, we're using in-memory data to simulate a backend.

import { Appointment, Patient, UserRole } from "./types";
import { add, format } from "date-fns";

const doctors = [
  { id: "doc1", name: "Dr. Smith", department: "Cardiology" },
  { id: "doc2", name: "Dr. Evans", department: "Neurology" },
  { id: "doc3", name: "Dr. Patel", department: "Pediatrics" },
];

const availableBeds = [
  { id: "bed101", number: "101", isOccupied: false },
  { id: "bed102", number: "102", isOccupied: false },
  { id: "bed205", number: "205", isOccupied: true },
  { id: "bed206", number: "206", isOccupied: false },
];

const initialPatients: Patient[] = [
    { id: "PAT001", fullName: "Alice Johnson", dateOfBirth: "1990-05-10", gender: "Female", doctorId: "doc1" },
    { id: "PAT002", fullName: "Bob Williams", dateOfBirth: "1985-08-15", gender: "Male", doctorId: "doc2" },
    { id: "PAT003", fullName: "Charlie Brown", dateOfBirth: "2003-01-20", gender: "Male", doctorId: "doc3" },
    { id: "PAT004", fullName: "Diana Miller", dateOfBirth: "1995-11-30", gender: "Female", doctorId: "doc1" },
    { id: "PAT005", fullName: "Ethan Davis", dateOfBirth: "1978-07-22", gender: "Male", doctorId: "doc2" },
];

const initialAppointments: Appointment[] = [
    { id: "APP001", patientId: "PAT001", patientName: "Alice Johnson", doctorId: "doc1", doctorName: "Dr. Smith", date: new Date(new Date().setHours(10, 0, 0, 0)), reason: "Annual Checkup", status: "Scheduled" },
    { id: "APP002", patientId: "PAT002", patientName: "Bob Williams", doctorId: "doc2", doctorName: "Dr. Evans", date: new Date(new Date().setHours(10, 30, 0, 0)), reason: "Follow-up", status: "Scheduled" },
    { id: "APP003", patientId: "PAT003", patientName: "Charlie Brown", doctorId: "doc3", doctorName: "Dr. Patel", date: new Date(new Date().setHours(11, 0, 0, 0)), reason: "Consultation", status: "Completed" },
    { id: "APP004", patientId: "PAT004", patientName: "Diana Miller", doctorId: "doc1", doctorName: "Dr. Smith", date: new Date(new Date().setHours(12, 15, 0, 0)), reason: "New Patient Visit", status: "Scheduled" },
    { id: "APP005", patientId: "PAT002", patientName: "Bob Williams", doctorId: "doc2", doctorName: "Dr. Evans", date: add(new Date(), {days: 1, hours: 14}), reason: "Test Results", status: "Scheduled" },
];

let patients: Patient[] = [...initialPatients];
let appointments: Appointment[] = [...initialAppointments];

// --- Data Access Functions ---

export const getDoctors = () => {
    return doctors;
}

export const getAvailableBeds = () => {
    return availableBeds.filter(bed => !bed.isOccupied);
}

export const getPatients = () => {
    return patients;
}

export const getAppointments = () => {
    return appointments;
}

export const registerPatient = (patientData: Omit<Patient, 'id'> & { bedId?: string }) => {
    const newPatient: Patient = {
        ...patientData,
        id: `PAT${String(patients.length + 1).padStart(3, '0')}`,
    };
    patients.push(newPatient);

    if (patientData.bedId) {
        const bed = availableBeds.find(b => b.id === patientData.bedId);
        if (bed) {
            bed.isOccupied = true;
        }
    }
    return newPatient;
}

export const scheduleAppointment = (appointmentData: Omit<Appointment, 'id' | 'patientName' | 'doctorName' | 'status'>) => {
    const patient = patients.find(p => p.id === appointmentData.patientId);
    const doctor = doctors.find(d => d.id === appointmentData.doctorId);

    if (!patient || !doctor) {
        throw new Error("Patient or Doctor not found");
    }

    const newAppointment: Appointment = {
        ...appointmentData,
        id: `APP${String(appointments.length + 1).padStart(3, '0')}`,
        patientName: patient.fullName,
        doctorName: doctor.name,
        status: 'Scheduled',
    };
    appointments.push(newAppointment);
    return newAppointment;
}
