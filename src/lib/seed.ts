import { db } from './firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserRole, type Doctor, type Receptionist, type Pharmacist } from './types';

// NOTE: This seed script does NOT create Firebase Auth users. 
// You will not be able to log in with these accounts.
// This is for display purposes in lists.
// For log-in capability, staff must be created via the Admin dashboard.

const dummyDoctors: Omit<Doctor, 'id' | 'createdAt'>[] = [
    { uid: 'doc1', fullName: 'Dr. Evelyn Reed', email: 'evelyn.reed@medichain.com', role: UserRole.Doctor, department: 'Cardiology' },
    { uid: 'doc2', fullName: 'Dr. Samuel Green', email: 'samuel.green@medichain.com', role: UserRole.Doctor, department: 'Pediatrics' },
    { uid: 'doc3', fullName: 'Dr. Isabella White', email: 'isabella.white@medichain.com', role: UserRole.Doctor, department: 'Neurology' },
    { uid: 'doc4', fullName: 'Dr. Mason Black', email: 'mason.black@medichain.com', role: UserRole.Doctor, department: 'Orthopedics' },
];

const dummyReceptionists: Omit<Receptionist, 'id' | 'createdAt'>[] = [
    { uid: 'rec1', fullName: 'Olivia Brown', email: 'olivia.brown@medichain.com', role: UserRole.Receptionist },
    { uid: 'rec2', fullName: 'Liam Jones', email: 'liam.jones@medichain.com', role: UserRole.Receptionist },
    { uid: 'rec3', fullName: 'Sophia Garcia', email: 'sophia.garcia@medichain.com', role: UserRole.Receptionist },
    { uid_rec4: 'rec4', fullName: 'Noah Miller', email: 'noah.miller@medichain.com', role: UserRole.Receptionist },
];

const dummyPharmacists: Omit<Pharmacist, 'id' | 'createdAt'>[] = [
    { uid: 'pha1', fullName: 'Ava Davis', email: 'ava.davis@medichain.com', role: UserRole.Pharmacist },
    { uid: 'pha2', fullName: 'William Rodriguez', email: 'william.rodriguez@medichain.com', role: UserRole.Pharmacist },
];

export async function seedDatabase() {
    const seedPromises: Promise<void>[] = [];

    dummyDoctors.forEach(doctor => {
        const docRef = doc(db, 'doctors', doctor.uid!);
        seedPromises.push(setDoc(docRef, { ...doctor, createdAt: serverTimestamp() }));
    });

    dummyReceptionists.forEach(receptionist => {
        const docRef = doc(db, 'receptionists', receptionist.uid!);
        seedPromises.push(setDoc(docRef, { ...receptionist, createdAt: serverTimestamp() }));
    });
    
    dummyPharmacists.forEach(pharmacist => {
        const docRef = doc(db, 'pharmacists', pharmacist.uid!);
        seedPromises.push(setDoc(docRef, { ...pharmacist, createdAt: serverTimestamp() }));
    });

    await Promise.all(seedPromises);
    console.log("Database seeded successfully!");
}
