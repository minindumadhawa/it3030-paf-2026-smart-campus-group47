# Smart Campus Operations Hub

This project is a web-based application designed to manage and monitor smart campus operations. It consists of a React frontend and a Spring Boot backend.

## Project Structure

- `frontend/`: Contains the React application (UI and client-side logic).
- `backend/`: Contains the Spring Boot application (REST API and server-side logic).

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Java**: JDK 21
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MySQL**: v8.x or higher
- **Maven**: (Optional, as the backend includes `mvnw` wrapper)

## Setup Instructions

### 1. Database Configuration

1. Log in to your MySQL server.
2. Create a new database named `paf`:
   ```sql
   CREATE DATABASE paf;
   ```

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a file named `application-secret.properties` inside `src/main/resources/`.
3. Add your MySQL credentials to the `application-secret.properties` file:
   ```properties
   DB_USERNAME=your_mysql_username
   DB_PASSWORD=your_mysql_password
   ```
   *(Note: The default `application.properties` expects these variables to connect to the `paf` database on `localhost:3306`.)*
4. Build the application using the Maven wrapper:
   - On Windows:
     ```bash
     mvnw.cmd clean install
     ```
   - On macOS/Linux:
     ```bash
     ./mvnw clean install
     ```
5. Run the Spring Boot application:
   - On Windows:
     ```bash
     mvnw.cmd spring-boot:run
     ```
   - On macOS/Linux:
     ```bash
     ./mvnw spring-boot:run
     ```
   The backend API will start running on `http://localhost:8080`.

### 3. Frontend Setup

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   The React application will automatically open in your default browser at `http://localhost:3000`.

## Features

- **Admin Dashboard**: View analytics such as top used resources and out-of-service equipment.
- **Resource Management**: Bulk update resource statuses and manage equipment inventory.
- **User Authentication**: Role-based access control (Admin/User) integrated with Google OAuth.
- **Facility Bookings**: Users can seamlessly book campus facilities.

## Technologies Used

- **Frontend**: React 19, React Router DOM, Tailwind CSS / Vanilla CSS, Lucide React (Icons), Google OAuth 2.0.
- **Backend**: Java 21, Spring Boot, Spring Data JPA, Spring Web, MySQL Connector.