"use client"

import { collection, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { UserRole } from "./types";

const dummyStaff = [
    // Doctors
    { fullName: "Dr. Evelyn Reed", email: "evelyn.reed@medichain.com", role: UserRole.Doctor, department: "Cardiology", password: "password123" },
    { fullName: "Dr. Samuel Green", email: "samuel.green@medichain.com", role: UserRole.Doctor, department: "Neurology", password: "password123" },
    { fullName: "Dr. Isabella White", email: "isabella.white@medichain.com", role: UserRole.Doctor, department: "Pediatrics", password: "password123" },
    { fullName: "Dr. Mason King", email: "mason.king@medichain.com", role: UserRole.Doctor, department: "Orthopedics", password: "password123" },
    
    // Receptionists
    { fullName: "Olivia Martin", email: "olivia.martin@medichain.com", role: UserRole.Receptionist, password: "password123" },
    { fullName: "Liam Harris", email: "liam.harris@medichain.com", role: UserRole.Receptionist, password: "password123" },
    { fullName: "Sophia Clark", email: "sophia.clark@medichain.com", role: UserRole.Receptionist, password: "password123" },

    // Pharmacists
    { fullName: "Noah Lewis", email: "noah.lewis@medichain.com", role: UserRole.Pharmacist, password: "password123" },
    { fullName: "Ava Walker", email: "ava.walker@medichain.com", role: UserRole.Pharmacist, password: "password123" },
];

export async function seedStaff() {
    try {
        const batch = writeBatch(db);
        
        dummyStaff.forEach(staff => {
            const collectionName = `${staff.role.toLowerCase()}s`;
            const docRef = collection(db, collectionName);
            // In a real app, you would create a user in Firebase Auth and use the UID.
            // For this prototype, we're creating a document with a generated ID.
             const newDocRef = require("firebase/firestore").doc(docRef); // Use a generated ID
             batch.set(newDocRef, { ...staff, createdAt: new Date() });
        });

        await batch.commit();
        alert('Dummy staff has been successfully seeded to Firestore!');
    } catch (error) {
        console.error("Error seeding staff:", error);
        alert(`Failed to seed staff. Check the console for errors. \n\nMake sure your Firestore security rules allow writes to the staff collections, e.g.: \n\nmatch /${'{collection}/{document}'} {\n  allow read, write: if true;\n}`);
    }
}
