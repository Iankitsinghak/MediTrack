// In a real application, this would be a database connection.
// For this prototype, we're using in-memory data that persists to simulate a backend.
// All "add" operations now write to Firestore.

import { Doctor, Patient, UserRole, Medicine, Supplier, Prescription, MedicationOrder, Receptionist, Pharmacist, Admin, Appointment } from "./types";
import { add, format, subDays } from "date-fns";
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';


// --- Pre-populated Mock Staff Data for Display ---
const initialAdmins: Admin[] = [
    { id: 'adm1', uid: 'adm1', fullName: 'Ravi Sharma', email: 'ravi.admin@hospital.com', phone: '9876543210', role: UserRole.Admin, createdAt: new Date() },
    { id: 'adm2', uid: 'adm2', fullName: 'Priya Mehta', email: 'priya.admin@hospital.com', phone: '9876543211', role: UserRole.Admin, createdAt: new Date() }
];

const initialReceptionists: Receptionist[] = [
    { id: 'rec1', uid: 'rec1', fullName: 'Ankit Singh', email: 'ankit.reception@hospital.com', phone: '9876543212', role: UserRole.Receptionist, createdAt: new Date() },
    { id: 'rec2', uid: 'rec2', fullName: 'Ankita Verma', email: 'ankita.reception@hospital.com', phone: '9876543213', role: UserRole.Receptionist, createdAt: new Date() },
    { id: 'rec3', uid: 'rec3', fullName: 'Rahul Das', email: 'rahul.reception@hospital.com', phone: '9876543214', role: UserRole.Receptionist, createdAt: new Date() },
    { id: 'rec4', uid: 'rec4', fullName: 'Shweta Rao', email: 'shweta.reception@hospital.com', phone: '9876543215', role: UserRole.Receptionist, createdAt: new Date() },
];

const initialDoctors: Doctor[] = [
    { id: 'doc1', uid: 'doc1', fullName: 'Dr. Arjun Khanna', email: 'arjun.cardiology@hospital.com', phone: '9876543216', role: UserRole.Doctor, department: 'Cardiology', experience: 12, createdAt: new Date() },
    { id: 'doc2', uid: 'doc2', fullName: 'Dr. Sneha Kapoor', email: 'sneha.neuro@hospital.com', phone: '9876543217', role: UserRole.Doctor, department: 'Neurology', experience: 8, createdAt: new Date() },
    { id: 'doc3', uid: 'doc3', fullName: 'Dr. Rohan Sinha', email: 'rohan.gp@hospital.com', phone: '9876543218', role: UserRole.Doctor, department: 'General Physician', experience: 5, createdAt: new Date() },
    { id: 'doc4', uid: 'doc4', fullName: 'Dr. Neha Gupta', email: 'neha.pedia@hospital.com', phone: '9876543219', role: UserRole.Doctor, department: 'Pediatrics', experience: 10, createdAt: new Date() },
    { id: 'doc5', uid: 'doc5', fullName: 'Dr. Kiran Joshi', email: 'kiran.derma@hospital.com', phone: '9876543220', role: UserRole.Doctor, department: 'Dermatology', experience: 7, createdAt: new Date() },
];

const initialPharmacists: Pharmacist[] = [
    { id: 'phar1', uid: 'phar1', fullName: 'Manoj Yadav', email: 'manoj.pharma@hospital.com', phone: '9876543221', role: UserRole.Pharmacist, createdAt: new Date() },
    { id: 'phar2', uid: 'phar2', fullName: 'Sakshi Patel', email: 'sakshi.pharma@hospital.com', phone: '9876543222', role: UserRole.Pharmacist, createdAt: new Date() },
    { id: 'phar3', uid: 'phar3', fullName: 'Deepak Nair', email: 'deepak.pharma@hospital.com', phone: '9876543223', role: UserRole.Pharmacist, createdAt: new Date() },
    { id: 'phar4', uid: 'phar4', fullName: 'Vikram Malhotra', email: 'vikram.pharma@hospital.com', phone: '9876543224', role: UserRole.Pharmacist, createdAt: new Date() },
];

// --- Other Mock Data (unchanged) ---

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
    { id: "APP001", patientId: "PAT001", patientName: "Alice Johnson", doctorId: "doc1", doctorName: "Dr. Arjun Khanna", date: new Date(new Date().setHours(10, 0, 0, 0)), reason: "Annual Checkup", status: "Scheduled" },
    { id: "APP002", patientId: "PAT002", patientName: "Bob Williams", doctorId: "doc2", doctorName: "Dr. Sneha Kapoor", date: new Date(new Date().setHours(10, 30, 0, 0)), reason: "Follow-up", status: "Scheduled" },
    { id: "APP003", patientId: "PAT003", patientName: "Charlie Brown", doctorId: "doc3", doctorName: "Dr. Rohan Sinha", date: new Date(new Date().setHours(11, 0, 0, 0)), reason: "Completed" },
    { id: "APP004", patientId: "PAT004", patientName: "Diana Miller", doctorId: "doc1", doctorName: "Dr. Arjun Khanna", date: new Date(new Date().setHours(12, 15, 0, 0)), reason: "New Patient Visit", status: "Scheduled" },
    { id: "APP005", patientId: "PAT002", patientName: "Bob Williams", doctorId: "doc2", doctorName: "Dr. Sneha Kapoor", date: add(new Date(), {days: 1, hours: 14}), reason: "Test Results", status: "Scheduled" },
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
    { id: "PRE001", patientName: "Alice Johnson", doctorName: "Dr. Arjun Khanna", medication: "Metformin 1000mg", dosage: "1 tablet daily", date: subDays(new Date(), 1), status: "Pending" },
    { id: "PRE002", patientName: "Bob Williams", doctorName: "Dr. Sneha Kapoor", medication: "Amoxicillin 250mg", dosage: "1 capsule every 8 hours", date: new Date(), status: "Pending" },
    { id: "PRE003", patientName: "Diana Miller", doctorName: "Dr. Arjun Khanna", medication: "Ibuprofen 200mg", dosage: "2 tablets as needed for pain", date: subDays(new Date(), 2), status: "Processed" },
];

const initialMedicationOrders: MedicationOrder[] = [
    { id: "ORD001", medicineName: "Paracetamol 500mg", quantity: 1000, supplierName: "Pharma Inc.", orderDate: subDays(new Date(), 7), status: "Received" },
    { id: "ORD002", medicineName: "Amoxicillin 250mg", quantity: 200, supplierName: "MediSource", orderDate: subDays(new Date(), 2), status: "Pending" },
];


// In-memory data stores that are NOT persisted to localStorage
let patients: Patient[] = [...initialPatients];
let suppliers: Supplier[] = [...initialSuppliers];
let medicines: Medicine[] = [...initialMedicines];
let prescriptions: Prescription[] = [...initialPrescriptions];
let medicationOrders: MedicationOrder[] = [...initialMedicationOrders];

export const getAvailableBeds = () => availableBeds.filter(bed => !bed.isOccupied);
export const getPatients = () => patients;
export const getAppointments = () => [];
export const getSuppliers = () => suppliers;
export const getMedicines = () => medicines;
export const getPrescriptions = () => prescriptions;
export const getMedicationOrders = () => medicationOrders;


export const registerPatient = async (patientData: Omit<Patient, 'id' | 'createdAt'> & { bedId?: string }) => {
    const { bedId, ...restOfPatientData } = patientData;
    const newPatientRef = await addDoc(collection(db, "patients"), {
        ...restOfPatientData,
        createdAt: serverTimestamp(),
    });
    
    const newPatient: Patient = {
        ...restOfPatientData,
        id: newPatientRef.id,
    };

    if (bedId) {
        const bed = availableBeds.find(b => b.id === bedId);
        if (bed) bed.isOccupied = true; // This part remains mock for now
    }
    return newPatient;
};


export const scheduleAppointment = async (appointmentData: Omit<Appointment, 'id' | 'patientName' | 'status' | 'createdAt'> & { doctorName: string }) => {
    
    const docRef = doc(db, "patients", appointmentData.patientId);
    const newAppointment = {
        ...appointmentData,
        patientName: "Patient", // In a real app, you might fetch this, but for now it's ok
        status: 'Scheduled',
        createdAt: serverTimestamp(),
    };
    
    await addDoc(collection(db, "appointments"), newAppointment);
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
