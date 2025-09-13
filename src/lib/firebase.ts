// This file will be populated with your Firebase project configuration.
// For now, it contains a placeholder.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore }from "firebase/firestore";
import { getAuth } from "firebase/auth";

// In a real application, you would replace this with your actual Firebase config.
// The config will be automatically injected in a real Firebase environment.
const firebaseConfig = {
  "projectId": "studio-177467113-38b48",
  "appId": "1:71788274334:web:a6bd5bfd6f38b0fb32118f",
  "storageBucket": "studio-177467113-38b48.firebasestorage.app",
  "apiKey": "AIzaSyARwsr7lYv0O6Sxq5f60umBH8rSTpIhfJw",
  "authDomain": "studio-177467113-38b48.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "71788274334"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
