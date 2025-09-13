// This file will be populated with your Firebase project configuration.
// For now, it contains a placeholder.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore }from "firebase/firestore";
import { getAuth } from "firebase/auth";

// In a real application, you would replace this with your actual Firebase config.
// The config will be automatically injected in a real Firebase environment.
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
