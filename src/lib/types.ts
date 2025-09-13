
export enum UserRole {
  Admin = 'Admin',
  Doctor = 'Doctor',
  Receptionist = 'Receptionist',
  Pharmacist = 'Pharmacist',
}

export interface BaseUser {
  id: string; // This is the Firestore document ID or mock ID
  uid?: string; // This would be the Firebase Auth UID
  fullName?: string; // fullName is used for firestore data
  email: string;
  role: UserRole;
  createdAt: any; // Firestore timestamp
}

export interface Doctor extends BaseUser {
  role: UserRole.Doctor;
  department: string;
}

export interface Admin extends BaseUser {
  role: UserRole.Admin;
}

export interface Receptionist extends BaseUser {
  role: UserRole.Receptionist;
}

export interface Pharmacist extends BaseUser {
  role: UserRole.Pharmacist;
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
  date: any; // Firestore timestamp or Date object
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt?: any; // Firestore timestamp
}

export interface Medicine {
    id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
    supplierId: string;
}

export interface Supplier {
    id: string;
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

export type StatCardData = {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: string;
  changeType?: "increase" | "decrease";
};
