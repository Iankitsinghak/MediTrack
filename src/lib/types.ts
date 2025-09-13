export enum UserRole {
  Admin = 'Admin',
  Doctor = 'Doctor',
  Receptionist = 'Receptionist',
  Pharmacist = 'Pharmacist',
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string; // Only for Doctors
}

export interface Doctor {
  id: string; // This is the Firestore document ID
  fullName: string;
  email: string;
  role: UserRole.Doctor;
  department: string;
  createdAt: any; // Firestore timestamp
  uid?: string; // This would be the Firebase Auth UID if you were linking them
}


export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  doctorId: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface Medicine {
  id: string;
  name: string;
  stock: number;
  lowStockThreshold: number;
  supplierId: string;
}

export interface Supplier {
  id:string;
  name: string;
  contactPerson: string;
  phone: string;
}

export interface Prescription {
    id: string;
    patientName: string;
    doctorName: string;
    medication: string;
    dosage: string;
    date: Date;
    status: 'Pending' | 'Processed';
}

export interface MedicationOrder {
    id: string;
    medicineName: string;
    quantity: number;
    supplierName: string;
    orderDate: Date;
    status: 'Pending' | 'Received';
}

export interface StatCardData {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: string;
  changeType?: 'increase' | 'decrease';
}
