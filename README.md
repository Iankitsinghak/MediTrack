# MediTrack - Intelligent Hospital Management System

MediTrack is a modern, full-featured Hospital Medical Information System (HMIS) designed to streamline operations, enhance patient care, and empower medical professionals. Built with a cutting-edge technology stack, it provides a seamless and responsive user experience across different roles within a healthcare facility.

## Core Features

- **Role-Based Authentication**: Secure access control with distinct dashboards and permissions for four key roles: **Admin**, **Doctor**, **Receptionist**, and **Pharmacist**.
- **Dynamic Dashboards**: Each role has a tailored dashboard displaying essential statistics and quick actions relevant to their responsibilities. For example, doctors see appointment stats, while pharmacists see low-stock alerts.
- **AI-Powered Patient Summarization**: A powerful Genkit-based tool for doctors to automatically summarize raw consultation notes into structured data, identifying the patient's condition, treatment plan, and next steps.
- **Real-Time Appointment Scheduling**: A complete system for receptionists to schedule, view, and manage patient appointments in a real-time calendar interface.
- **Medication Stock Management**: An inventory system for pharmacists to track medication stock levels, receive automated low-stock alerts, and manage suppliers.
- **Staff & Patient Management**: Admins can manage staff accounts, and receptionists can register new patients, assign them to doctors, and book their initial appointments.

## Tech Stack

This project is built with a modern, performant, and scalable technology stack:

- **Framework**: [Next.js](https://nextjs.org/) (with App Router & Server Components)
- **UI Library**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore for database)
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) (for the AI summarization feature)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Iankitsinghak/MediChain.git
   cd MediChain
   ```

2. **Install NPM packages:**
   ```sh
   npm install
   ```

3. **Set up Firebase:**
   - Create a new project on the [Firebase Console](https://console.firebase.google.com/).
   - Enable **Firestore Database** and **Firebase Authentication** (with the Email/Password provider).
   - Go to your Project Settings, and under "Your apps", create a new Web App.
   - Copy the `firebaseConfig` object and paste it into `src/lib/firebase.ts`.

4. **Run the development server:**
   ```sh
   npm run dev
   ```
   Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Available Roles & How to Use

1.  **Admin**: The first account should be created via the "Sign Up" page. This account can then create other staff members from the "Manage Staff" section of the admin dashboard.
2.  **Doctor, Receptionist, Pharmacist**: These accounts must be created by an Admin. Once created, they can log in using the "Login" page by selecting their role, name, and entering their password.
