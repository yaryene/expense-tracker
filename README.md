# Expense Tracker Monorepo

An end-to-end, full-stack Expense Tracker system integrating a **Spring Boot 3 + MySQL** REST API with a minimalist **React 18 + TypeScript + Vite + Tailwind CSS** client.

---

## 📁 Monorepo Structure

```text
expense-tracker/
├── expense-tracker-api/       # Spring Boot 3 + MySQL Backend (Port 8084)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/site/...
│   │   │   └── resources/application.properties
│   │   └── test/
│   ├── mvnw & pom.xml
│   └── README.md
│
├── expense-tracker-ui/        # React 18 + TypeScript Frontend (Port 5173)
│   ├── src/
│   │   ├── App.tsx            # Single-page demo UI
│   │   ├── main.tsx
│   │   └── index.css
│   ├── vite.config.ts         # Proxies /api/* to http://localhost:8084
│   ├── package.json
│   └── .env
│
├── package.json               # Root monorepo scripts
├── .gitignore                 # Unified git ignore (Java, Node, IDEs)
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
- Hibernate auto-ddl is set to `update` (tables are created automatically on launch).

---

## 🚀 Quickstart Guide

### 1. Start the Backend API (Spring Boot)

From the monorepo root:

```bash
npm run dev:api
```

*(Alternatively: `cd expense-tracker-api && ./mvnw spring-boot:run`)*

The API will start and listen on **`http://localhost:8084`**.

### 2. Start the Frontend UI (React + Vite)

In a separate terminal tab from the monorepo root:

```bash
npm run dev:ui
```

*(Alternatively: `cd expense-tracker-ui && npm run dev`)*

Open **`http://localhost:5173`** in your browser.

---

## 🔌 Core API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/v1/expenses` | Create an expense with `@Valid` DTO validation (`201 Created`) |
| **GET** | `/api/v1/expenses` | Retrieve expenses list (`200 OK`) |
| **GET** | `/api/v1/expenses/{id}` | Fetch single expense details by ID (`200 OK`) |
| **DELETE** | `/api/v1/expenses/{id}` | Delete an expense by ID (`204 No Content`) |

---

## 📤 Pushing to GitHub

To push this entire monorepo to your GitHub repository:

```bash
# 1. Initialize Git in the monorepo root (if not already initialized)
git init

# 2. Stage all files
git add .

# 3. Create initial commit
git commit -m "feat: initial commit of full-stack expense tracker monorepo"

# 4. Set main branch
git branch -M main

# 5. Link your GitHub remote repository
git remote add origin https://github.com/<your-username>/expense-tracker.git

# 6. Push to GitHub
git push -u origin main
```
