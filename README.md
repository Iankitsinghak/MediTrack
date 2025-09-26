# 🏥 MediTrack – An Intelligent Hospital Management System

MediTrack is a **modern, AI-powered, real-time hospital management system** designed to centralize hospital operations, reduce inefficiencies, and improve patient care.  
It provides distinct, **role-based dashboards** for Admins, Receptionists, Doctors, and Pharmacists, while leveraging **AI (Gemini via Genkit)** for productivity features like medical note summarization and voice-to-text prescriptions.

---

## 🚀 Problem Statement
Traditional hospital management systems are:
- Fragmented and outdated
- Slow to synchronize across departments
- Inefficient for doctors and frustrating for patients

---

## 💡 Our Solution
MediTrack solves this by:
- Centralizing hospital operations into one platform
- Offering **real-time synchronization** with Firebase
- Providing **AI tools** to assist doctors
- Building on a **scalable, secure, and modern tech stack**

---

## 🌟 Features (Role-based Workflows)

### 👨‍💼 Admin
- Manage hospital staff accounts
- Create new doctors/receptionists/pharmacists
- Oversee system activity

### 👩‍💻 Receptionist
- Register new patients
- Schedule appointments in real-time
- Assign patients to doctors

### 👨‍⚕️ Doctor
- View daily appointments instantly
- AI-powered **Patient Note Summarizer** (Gemini via Genkit)
- Create prescriptions using **voice-to-text**

### 💊 Pharmacist
- Access real-time prescription queue
- Process prescriptions and update status
- Ensure smooth handover from doctor to pharmacy

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router) + React + TypeScript  
- **UI & Styling:** [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)  
- **Backend & Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore) + Firebase Authentication  
- **AI Integration:** [Google AI SDK](https://ai.google.dev/) (Gemini) via [Genkit](https://firebase.google.com/products/genkit)  
- **Deployment:** [Vercel](https://vercel.com/) (frontend), Firebase Hosting/Functions (backend AI flows)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/MediTrack.git
cd MediTrack
