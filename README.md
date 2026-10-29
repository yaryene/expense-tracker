# Expense Tracker (Full-Stack Monorepo)

An end-to-end Expense Tracker application demonstrating modern full-stack development with a **Spring Boot 3 + MySQL** REST API and a clean, minimalist **React 18 + TypeScript + Vite + Tailwind CSS** client.

---

## 🌟 Architecture & Features

- **Monorepo Layout**: Clean isolation between `expense-tracker-api` and `expense-tracker-ui` with unified orchestration scripts.
- **DTO Validation**: Automatic mapping of Spring Boot `@Valid` constraints (`400 Bad Request`) directly beneath input fields on the UI.
- **REST Endpoints**: Real-time CRUD operations mapping HTTP methods to Spring Boot annotations (`@PostMapping`, `@GetMapping`, `@DeleteMapping`).
- **Live HTTP Feedback**: Visual banner displaying live request status, Spring annotations, and response payloads.
- **Zero-CORS Development**: Vite server proxies `/api/*` requests directly to `http://localhost:8084` to eliminate CORS issues in local development.

---

## 📁 Repository Structure

```text
expense-tracker/
├── expense-tracker-api/       # Spring Boot 3 + MySQL Backend (Port 8084)
│   ├── src/
│   │   ├── main/java/com/site/expensetracker/
│   │   │   ├── controller/    # ExpenseController REST endpoints
│   │   │   ├── dto/           # Request/Response contracts & validation
│   │   │   ├── entity/        # JPA Expense entity
│   │   │   ├── repo/          # Spring Data JPA repository
│   │   │   └── service/       # Business logic layer
│   │   └── main/resources/application.properties
│   ├── pom.xml
│   └── mvnw
│
├── expense-tracker-ui/        # React 18 + TypeScript Frontend (Port 5173)
│   ├── src/
│   │   ├── App.tsx            # Single-page demo UI
│   │   ├── main.tsx           # React entry point
│   │   └── index.css          # Tailwind CSS styles
│   ├── vite.config.ts         # Dev server & reverse proxy
│   ├── package.json
│   └── .env
│
├── package.json               # Root monorepo scripts
├── .gitignore                 # Unified ignore rules (Maven, Vite, IDEs)
└── README.md
```

---

## 🛠️ Prerequisites

- **Java**: JDK 21+
- **Node.js**: v18+ & npm
- **Database**: MySQL 8.x running locally on port `3306`

---

## 🗄️ Database Setup (MySQL)

Create the database in MySQL:

```sql
CREATE DATABASE expensedb;
```

Default credentials in `expense-tracker-api/src/main/resources/application.properties`:
- **URL**: `jdbc:mysql://localhost:3306/expensedb`
- **Username**: `root`
- **Password**: `root1234`
- Hibernate auto-ddl is set to `update` (tables and columns are created automatically on application launch).

---

## 🚀 Quickstart

Clone and run the application from the root directory:

### 1. Start the Backend API (Spring Boot)

```bash
npm run dev:api
```

*(Alternatively: `cd expense-tracker-api && ./mvnw spring-boot:run`)*

The API will start and listen on **`http://localhost:8084`**.

### 2. Start the Frontend UI (React + Vite)

In a separate terminal tab from the root:

```bash
npm run dev:ui
```

*(Alternatively: `cd expense-tracker-ui && npm run dev`)*

Open **`http://localhost:5173`** in your browser.

---

## 🔌 API Endpoints Summary

| HTTP Method | Endpoint | Spring Boot Annotation | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/expenses` | `@PostMapping` | Create an expense with `@Valid` DTO validation (`201 Created`) |
| **GET** | `/api/v1/expenses` | `@GetMapping` | Retrieve expenses list (`200 OK`) |
| **GET** | `/api/v1/expenses/{id}` | `@GetMapping("/{id}")` | Fetch single expense details by ID (`200 OK`) |
| **DELETE** | `/api/v1/expenses/{id}` | `@DeleteMapping("/{id}")` | Delete an expense by ID (`204 No Content`) |

---

## 🧪 Testing

```bash
# Run Spring Boot backend test suite
npm run test:api

# Run TypeScript check and production build for frontend
npm run build:ui
```

---

## 📤 Pushing to GitHub

To publish this monorepo to your GitHub account:

```bash
# 1. Create a repository on GitHub (e.g., 'expense-tracker')

# 2. Add your remote
git remote add origin https://github.com/<your-username>/expense-tracker.git

# 3. Push to main
git branch -M main
git push -u origin main
```
