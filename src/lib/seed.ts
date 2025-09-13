import { db, auth } from './firebase';
import { collection, doc, setDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { UserRole, type Doctor, type Receptionist, type Pharmacist, type Admin } from './types';

// This seed script now creates Firebase Auth users. 
// You will be able to log in with these accounts.
// The password for all seeded users is 'password'.

const dummyDoctors: Omit<Doctor, 'id' | 'createdAt' | 'uid'>[] = [
    { fullName: 'Dr. Evelyn Reed', email: 'evelyn.reed@medichain.com', role: UserRole.Doctor, department: 'Cardiology' },
    { fullName: 'Dr. Samuel Green', email: 'samuel.green@medichain.com', role: UserRole.Doctor, department: 'Pediatrics' },
    { fullName: 'Dr. Isabella White', email: 'isabella.white@medichain.com', role: UserRole.Doctor, department: 'Neurology' },
    { fullName: 'Dr. Mason Black', email: 'mason.black@medichain.com', role: UserRole.Doctor, department: 'Orthopedics' },
];

const dummyReceptionists: Omit<Receptionist, 'id' | 'createdAt' | 'uid'>[] = [
    { fullName: 'Olivia Brown', email: 'olivia.brown@medichain.com', role: UserRole.Receptionist },
    { fullName: 'Liam Jones', email: 'liam.jones@medichain.com', role: UserRole.Receptionist },
    { fullName: 'Sophia Garcia', email: 'sophia.garcia@medichain.com', role: UserRole.Receptionist },
    { fullName: 'Noah Miller', email: 'noah.miller@medichain.com', role: UserRole.Receptionist },
];

const dummyPharmacists: Omit<Pharmacist, 'id' | 'createdAt' | 'uid'>[] = [
    { fullName: 'Ava Davis', email: 'ava.davis@medichain.com', role: UserRole.Pharmacist },
    { fullName: 'William Rodriguez', email: 'william.rodriguez@medichain.com', role: UserRole.Pharmacist },
];


async function seedCollection(collectionName: string, data: any[]) {
    const querySnapshot = await getDocs(collection(db, collectionName));
    if (!querySnapshot.empty) {
        console.log(`Collection ${collectionName} is not empty. Skipping seed.`);
        return;
    }

    const password = "password"; // Use a common password for all seeded users for simplicity

    for (const item of data) {
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, item.email, password);
            const user = userCredential.user;

            // Create user document in Firestore with the UID as the document ID
            const docRef = doc(db, collectionName, user.uid);
            await setDoc(docRef, { 
                ...item, 
                uid: user.uid,
                createdAt: serverTimestamp() 
            });
            console.log(`Successfully created and seeded user: ${item.email}`);
        } catch (error: any) {
            // If the user already exists in Auth, it will throw an error. We can often ignore this for seeding.
            if (error.code === 'auth/email-already-in-use') {
                console.warn(`User with email ${item.email} already exists in Firebase Auth. Skipping Auth creation.`);
                // You might want to still attempt to create the Firestore doc if it's missing
            } else {
                console.error(`Error seeding user ${item.email}:`, error);
            }
        }
    }
}

export async function seedDatabase() {
    console.log("Starting database seed...");
    
    await Promise.all([
        seedCollection('doctors', dummyDoctors),
        seedCollection('receptionists', dummyReceptionists),
        seedCollection('pharmacists', dummyPharmacists),
    ]);
    
    console.log("Database seeding completed!");
}

    