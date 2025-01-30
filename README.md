# Course Management System

A simple application for creating, managing, and enrolling in courses.

## Installation & Setup
1. **Clone** the repository:
   ```bash
   git clone 
   ```
2. **Backend** (Java + Spring Boot)
    - Configure `application.properties` for DB and JWT.
    - Run:
      ```bash
      mvn clean install
      mvn spring-boot:run
      ```
    - Server runs at `http://localhost:8080`.
3. **Frontend** (React)
    - Inside `frontend/`:
      ```bash
      npm install
      npm start
      ```
    - App runs at `http://localhost:3000`.