# 📚 School Attendance System (ระบบเช็คชื่อนักเรียน IT)

A modern, responsive, and full-stack web application designed for teachers to manage student attendance, track statistics, and generate reports. The system features a premium UI/UX complete with Dark Mode support, glassmorphism effects, and dynamic charts.

![Attendance System Overview](https://img.shields.io/badge/Status-Active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3+-blue?logo=tailwindcss)
![PHP](https://img.shields.io/badge/PHP-8+-777BB4?logo=php)
![MySQL](https://img.shields.io/badge/MySQL-Aiven_Cloud-4479A1?logo=mysql)

---

## 🌟 Features

*   **Dashboard Analytics:** View daily attendance statistics (Present, Late, Absent) and a 7-day trend chart.
*   **Take Attendance:** Easy-to-use interface to mark students as Present, Late, Leave, or Absent. Includes "Mark All as Present" for quick entry.
*   **Student Management:** Add, edit, and remove students from the system with a searchable and filterable data table.
*   **Comprehensive Reports:**
    *   **Daily Reports:** View attendance records for a specific day and class. Export to CSV.
    *   **Individual Reports:** Search for a specific student to see their attendance history and calculate their total attendance percentage.
*   **Responsive Design:** Fully optimized for mobile devices with a custom card-based layout for smaller screens.
*   **Dark Mode:** Built-in seamless transition between Light and Dark themes.

---

## 🛠️ Technology Stack

### Frontend (`/frontend`)
*   **Framework:** Next.js (App Router)
*   **Styling:** Tailwind CSS (Custom Blue, Gold, Rose, Brown premium theme)
*   **Components/Icons:** Lucide React, Recharts (for Dashboard data visualization)
*   **Deployment:** Optimized for Vercel

### Backend (`/api`)
*   **Framework:** Raw Vanilla PHP
*   **Database:** MySQL (Hosted on Aiven Cloud)
*   **Architecture:** RESTful API endpoints handling JSON payloads
*   **Security:** CORS enabled for Cross-Domain sessions (SameSite=None configured for Vercel -> Render deployments), Password verification.

---

## 🚀 Getting Started (Local Development)

### 1. Database Setup
1. Create a MySQL database named `attendance_system`.
2. Import your database schema (Classes, Students, Teachers, Semesters, Attendance Records).
3. Ensure the `attendance_records` table has performance indexes on `(check_in_date)`, `(semester_id, class_id)`, and `(student_id)`.

### 2. Backend Setup (XAMPP / Local Server)
1. Ensure your PHP server is running.
2. Edit `config/database.php` to point to your local or remote MySQL database credentials.
    ```php
    // config/database.php
    private $host = "your_db_host";
    private $db_name = "attendance_system";
    private $username = "root";
    private $password = "";
    ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables (create a `.env.local` file):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost/attendance_system
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment Guide

### Deploying the Frontend (Vercel)
1. Push your repository to GitHub.
2. Import the project into Vercel.
3. **Critical:** In Vercel's project settings, set the **Root Directory** to `frontend`.
4. Add the `NEXT_PUBLIC_API_URL` environment variable pointing to your deployed PHP backend URL.

### Deploying the Backend (Render / Shared Hosting)
1. Upload the `api/` and `config/` folders to your PHP hosting provider.
2. Update the `$allowed` array in `api/cors.php` to include your new Vercel frontend URL so that cross-origin authentication is permitted.
   ```php
   $allowed = [
       'http://localhost:3000',
       'https://your-frontend-app.vercel.app'
   ];
   ```

---

## 👨‍💻 Author
Developed for modern educational IT departments looking to streamline attendance tracking.
