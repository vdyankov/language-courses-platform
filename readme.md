<div align="center">
  <img src="./assets/logo.png" alt="Polyglot Space Logo" width="250" />
</div>

# Polyglot Space - Language Courses Platform

**A full-stack web application for managing language courses**  
**Team Project by 3 students**

**Technologies:** React + TypeScript | Express + TypeScript | MySQL

---

## About the Project

**Polyglot Space** is a modern platform for language school management. It includes an **Admin Panel** for managing courses, students, trainings, enrollments and fees, and a **Client Portal** where users can browse courses and enroll.

The project was developed collaboratively by **Plamena Todorova**, **Boyan Atanasov**, and **Ventsislav Dyankov**. 

---

## Team Contributions & Presentation Roles

Throughout the development of Polyglot Space, **all three team members worked together on the main components**. We made architectural, design, and technical decisions collectively through regular discussions to ensure a cohesive full-stack application. 

However, for the purpose of the presentation, each member will focus on presenting the following areas:

**Plamena Todorova (Student 1) – Core Architecture & Data Management**
Plamena will focus on the underlying database schema and the backend foundation. She will present the robust API routes and controller logic for the **Member** and **Course** modules, explaining our routing strategies and how data relationships are structured between the MySQL database and the frontend.

**Boyan Atanasov (Student 2) – Business Logic & Analytics**
Boyan will focus on the complex business logic that makes the platform functional for an administrative user. He will present the modules for **Trainings, Enrollments, and Fees management**, demonstrating how student data accurately syncs with financial records. He will also showcase the data aggregation behind the **Dashboard statistics**.

**Ventsislav Dyankov (Student 3) – UI/UX, Payments & Full-Stack Integration**
Ventsislav will focus on the visual and interactive direction of the platform. He will present the overall **UI/UX** and the **React Frontend** for both the Admin Panel and Client Portal. He will also demonstrate the mock debit/credit card payment system, the GitHub infrastructure, and how the user journey flows through the application.

---

## Features

- Full **CRUD** operations for Members, Courses, Trainings, Enrollments and Fees
- Responsive **Admin Dashboard** with statistics
- **Client Portal** with course catalog and enrollment flow
- Mock debit/credit card payment simulation
- MySQL database with proper relationships and constraints
- TypeScript + OOP layered architecture (Controller → Service → Model)

---

## Tech Stack

- **Backend**: Express.js + TypeScript + MySQL2
- **Frontend**: React + TypeScript + Vite
- **Database**: MariaDB / MySQL
- **Tools**: Git, GitHub, Nodemon, dotenv

---

## How to Run

# Backend
npm install
cp .env.example .env
npm run dev

# Frontend (in separate terminal)
cd frontend
npm install
npm run dev
