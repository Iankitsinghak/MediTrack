// In a real application, this would be a database connection.
// For this prototype, we're using in-memory data to simulate a backend.

import { Doctor, Patient, UserRole, Medicine, Supplier, Prescription, MedicationOrder, Receptionist, Pharmacist, BaseUser } from "./types";
import { add, format, subDays } from "date-fns";

// Expanded dummy data for showcase purposes
let doctors: Omit<Doctor, 'createdAt' | 'email' | 'password' | 'role'>[] = [
  { id: "doc1", name: "Dr. Evelyn Reed", department: "Cardiology" },
  { id: "doc2", name: "Dr. Samuel Green", department: "Neurology" },
  { id: "doc3", name: "Dr. Isabella White", department: "Pediatrics" },
  { id: "doc4", name: "Dr. Mason King", department: "Orthopedics" },
];

let receptionists: Omit<Receptionist, 'createdAt' | 'email' | 'password' | 'role'>[] = [
    { id: "rec1", name: "Olivia Martin" },
    { id: "rec2", name: "Liam Harris" },
    { id: "rec3", name: "Sophia Clark" },
    { id: "rec4", name: "Jacob Lewis" },
];

let pharmacists: Omit<Pharmacist, 'createdAt' | 'email' | 'password' | 'role'>[] = [
    { id: "phar1", name: "Noah Lewis" },
    { id: "phar2", name: "Ava Walker" },
    { id: "phar3", name: "Emma Johnson"},
    { id: "phar4", name: "William Brown"},
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

const initialAppointments: any[] = [
    { id: "APP001", patientId: "PAT001", patientName: "Alice Johnson", doctorId: "doc1", doctorName: "Dr. Evelyn Reed", date: new Date(new Date().setHours(10, 0, 0, 0)), reason: "Annual Checkup", status: "Scheduled" },
    { id: "APP002", patientId: "PAT002", patientName: "Bob Williams", doctorId: "doc2", doctorName: "Dr. Samuel Green", date: new Date(new Date().setHours(10, 30, 0, 0)), reason: "Follow-up", status: "Scheduled" },
    { id: "APP003", patientId: "PAT003", patientName: "Charlie Brown", doctorId: "doc3", doctorName: "Dr. Isabella White", date: new Date(new Date().setHours(11, 0, 0, 0)), reason: "Consultation", status: "Completed" },
    { id: "APP004", patientId: "PAT004", patientName: "Diana Miller", doctorId: "doc1", doctorName: "Dr. Evelyn Reed", date: new Date(new Date().setHours(12, 15, 0, 0)), reason: "New Patient Visit", status: "Scheduled" },
    { id: "APP005", patientId: "PAT002", patientName: "Bob Williams", doctorId: "doc2", doctorName: "Dr. Samuel Green", date: add(new Date(), {days: 1, hours: 14}), reason: "Test Results", status: "Scheduled" },
];

const initialSuppliers: Supplier[] = [
    { id: "SUP001", name: "Pharma Inc.", contactPerson: "John Doe", phone: "123-456-7890" },
    { id: "SUP002", name: "MediSource", contactPerson: "Jane Smith", phone: "098-765-4321" },
    { id: "SUP003", name: "HealthWell", contactPerson: "Peter Jones", phone: "555-555-5555" },
    { id: "SUP004", name: "Global Meds", contactPerson: "Mary Williams", phone: "111-222-3333" },
];

const initialMedicines: Medicine[] = [
  { id: "MED001", name: "Paracetamol 500mg", stock: 1500, lowStockThreshold: 500, supplierId: "SUP001" },
  { id: "MED002", name: "Amoxicillin 250mg", stock: 45, lowStockThreshold: 50, supplierId: "SUP002" },
  { id: "MED003", name: "Ibuprofen 200mg", stock: 800, lowStockThreshold: 200, supplierId: "SUP003" },
  { id: "MED004", name: "Ciprofloxacin 500mg", stock: 15, lowStockThreshold: 20, supplierId: "SUP004" },
  { id: "MED005", name: "Metformin 1000mg", stock: 350, lowStockThreshold: 100, supplierId: "SUP001" },
  { id: "MED006", name: "Aspirin 81mg", stock: 2500, lowStockThreshold: 1000, supplierId: "SUP003" },
];

const initialPrescriptions: Prescription[] = [
    { id: "PRE001", patientName: "Alice Johnson", doctorName: "Dr. Smith", medication: "Metformin 1000mg", dosage: "1 tablet daily", date: subDays(new Date(), 1), status: "Pending" },
    { id: "PRE002", patientName: "Bob Williams", doctorName: "Dr. Evans", medication: "Amoxicillin 250mg", dosage: "1 capsule every 8 hours", date: new Date(), status: "Pending" },
    { id: "PRE003", patientName: "Diana Miller", doctorName: "Dr. Smith", medication: "Ibuprofen 200mg", dosage: "2 tablets as needed for pain", date: subDays(new Date(), 2), status: "Processed" },
];

const initialMedicationOrders: MedicationOrder[] = [
    { id: "ORD001", medicineName: "Paracetamol 500mg", quantity: 1000, supplierName: "Pharma Inc.", orderDate: subDays(new Date(), 7), status: "Received" },
    { id: "ORD002", medicineName: "Amoxicillin 250mg", quantity: 200, supplierName: "MediSource", orderDate: subDays(new Date(), 2), status: "Pending" },
];


// In-memory data stores
let patients: Patient[] = [...initialPatients];
let appointments: any[] = [...initialAppointments];
let suppliers: Supplier[] = [...initialSuppliers];
let medicines: Medicine[] = [...initialMedicines];
let prescriptions: Prescription[] = [...initialPrescriptions];
let medicationOrders: MedicationOrder[] = [...initialMedicationOrders];


// --- Data Access & Mutation Functions ---

export const getDoctors = () => doctors.map(d => ({ ...d, role: UserRole.Doctor, email: `${d.name.split(' ').join('.').toLowerCase()}@medichain.com`}));
export const getReceptionists = () => receptionists.map(r => ({ ...r, role: UserRole.Receptionist, email: `${r.name.split(' ').join('.').toLowerCase()}@medichain.com`}));
export const getPharmacists = () => pharmacists.map(p => ({ ...p, role: UserRole.Pharmacist, email: `${p.name.split(' ').join('.').toLowerCase()}@medichain.com`}));

export const addStaff = (staffData: { fullName: string; email: string; role: UserRole; department?: string; }) => {
    let newStaff: any;
    switch (staffData.role) {
        case UserRole.Doctor:
            newStaff = {
                id: `doc${doctors.length + 1}`,
                name: staffData.fullName,
                department: staffData.department || 'General',
            };
            doctors.push(newStaff);
            return { ...newStaff, ...staffData };
        case UserRole.Receptionist:
            newStaff = {
                id: `rec${receptionists.length + 1}`,
                name: staffData.fullName,
            };
            receptionists.push(newStaff);
            return { ...newStaff, ...staffData };
        case UserRole.Pharmacist:
             newStaff = {
                id: `phar${pharmacists.length + 1}`,
                name: staffData.fullName,
            };
            pharmacists.push(newStaff);
            return { ...newStaff, ...staffData };
        default:
            throw new Error("Invalid role");
    }
};

export const getAvailableBeds = () => availableBeds.filter(bed => !bed.isOccupied);
export const getPatients = () => patients;
export const getAppointments = () => appointments;
export const getSuppliers = () => suppliers;
export const getMedicines = () => medicines;
export const getPrescriptions = () => prescriptions;
export const getMedicationOrders = () => medicationOrders;


export const registerPatient = (patientData: Omit<Patient, 'id'> & { bedId?: string }) => {
    const newPatient: Patient = {
        ...patientData,
        id: `PAT${String(patients.length + 1).padStart(3, '0')}`,
    };
    patients.push(newPatient);

    if (patientData.bedId) {
        const bed = availableBeds.find(b => b.id === patientData.bedId);
        if (bed) bed.isOccupied = true;
    }
    return newPatient;
};

export const scheduleAppointment = (appointmentData: Omit<Appointment, 'id' | 'patientName' | 'doctorName' | 'status' | 'createdAt'>) => {
    const patient = patients.find(p => p.id === appointmentData.patientId);
    const doctor = getDoctors().find(d => d.id === appointmentData.doctorId);

    if (!patient || !doctor) throw new Error("Patient or Doctor not found");

    const newAppointment: any = {
        ...appointmentData,
        id: `APP${String(appointments.length + 1).padStart(3, '0')}`,
        patientName: patient.fullName,
        doctorName: doctor.name,
        status: 'Scheduled',
    };
    appointments.push(newAppointment);
    return newAppointment;
};

export const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
        ...supplierData,
        id: `SUP${String(suppliers.length + 1).padStart(3, '0')}`,
    };
    suppliers.push(newSupplier);
    return newSupplier;
};

export const createMedicationOrder = (orderData: Omit<MedicationOrder, 'id' | 'status' | 'orderDate'>) => {
    const newOrder: MedicationOrder = {
        ...orderData,
        id: `ORD${String(medicationOrders.length + 1).padStart(3, '0')}`,
        orderDate: new Date(),
        status: 'Pending',
    };
    medicationOrders.push(newOrder);
    return newOrder;
};

export const processPrescription = (prescriptionId: string) => {
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (prescription) {
        prescription.status = 'Processed';
    }
    return prescription;
};
