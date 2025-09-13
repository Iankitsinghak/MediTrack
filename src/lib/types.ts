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
  supplier: string;
}

export interface StatCardData {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: string;
  changeType?: 'increase' | 'decrease';
}
