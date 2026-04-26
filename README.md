# Smart Campus Operations Hub

A centralized platform designed to streamline campus operations, ticket management, and communication between students, technicians, and administrators.

## 🚀 Features

- **Ticket Management**: Create, track, and manage support tickets for campus issues.
- **Role-Based Access**: Specialized dashboards for Students, Technicians, and Admins.
- **Real-Time Updates**: Stay informed with ticket status changes and comments.
- **Attachment Support**: Upload evidence photos or documents to tickets.
- **Staff Assignment**: Efficiently assign technicians based on their specialization.
- **Google OAuth Integration**: Secure login using Google accounts.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19
- **Icons**: Lucide React
- **Authentication**: Google OAuth (@react-oauth/google)
- **Routing**: React Router Dom v7

### Backend
- **Framework**: Spring Boot 4.0.5
- **Language**: Java 21
- **Database**: MySQL
- **ORM**: Spring Data JPA
- **Build Tool**: Maven

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Java 21 JDK](https://www.oracle.com/java/technologies/downloads/#java21)
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Maven](https://maven.apache.org/download.cgi) (or use the provided wrapper)
- [MySQL Server](https://dev.mysql.com/downloads/installer/)

## ⚙️ Setup Instructions

### 1. Database Configuration

1. Create a MySQL database named `paf`:
   ```sql
   CREATE DATABASE paf;
   ```
2. Configure your database credentials in the backend. You can either:
   - Create a file `backend/src/main/resources/application-secret.properties` and add:
     ```properties
     DB_USERNAME=your_username
     DB_PASSWORD=your_password
     ```
   - Or set environment variables `DB_USERNAME` and `DB_PASSWORD`.

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run the Spring Boot application using the Maven wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`.

## 📂 Project Structure

```
.
├── backend                 # Spring Boot application
│   ├── src/main/java       # Java source code
│   └── src/main/resources  # Configuration and static assets
├── frontend                # React application
│   ├── src/components      # Reusable UI components
│   ├── src/services        # API integration services
│   └── src/context         # State management
└── uploads                 # Directory for uploaded attachments
```

## 📝 License

This project is part of the IT3030 PAF 2026 course.
