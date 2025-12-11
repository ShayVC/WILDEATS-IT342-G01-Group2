# 🍽️ WILDEATS: Online Canteen System (IT342-G01-Group2)

## 📘 Project Overview

**WILDEATS: Online Canteen System (WOCS)** is a digital platform designed to modernize and streamline the school canteen experience.

It enables students to **pre-order meals** and monitor their **queue status** through a mobile app, while canteen staff manage orders and menus using a web dashboard.

The system is powered by a **Spring Boot backend + Supabase (PostgreSQL)**, ensuring fast, secure, and reliable communication between all components.

---

## ⚙️ Tech Stack Used

| Layer               | Technology                   | Description                                                      |
| ------------------- | ---------------------------- | ---------------------------------------------------------------- |
| **Mobile App**      | Kotlin (Android Studio)      | Used by students to browse menus, place orders, and view queues. |
| **Web Dashboard**   | Node.js / React (frontend)   | Used by canteen staff and admins to manage menus and orders.     |
| **Backend APIs**    | Java (Spring Boot REST APIs) | Handles logic, authentication, and database operations.          |
| **Database**        | Supabase (PostgreSQL)        | Cloud-hosted database for all user, order, and menu information. |
| **Version Control** | Git + GitHub                 | Collaboration and version tracking for all developers.           |

---

## 🏗️ Project Structure

<img width="208" height="453" alt="image" src="https://github.com/user-attachments/assets/5c674e84-1f67-4518-858b-56db939cbde6" />

---

## 🚀 Setup & Run Instructions

### 🗂️ Clone the Repository

```
git clone https://github.com/ShayVC/WILDEATS-IT342-G01-Group2.git
cd WILDEATS-IT342-G01-Group2
```

### 💾 Database Setup (Supabase)

> **Note:** The Supabase database is already set up and configured. You just need to get the credentials from your teammate to connect to it. Never share these credentials publicly or commit them to Git!

#### Step 1: Configure Environment Variables

1. Navigate to the backend directory:

2. Create a `.env` file in the `backend` directory.

3. Add your Supabase credentials to `.env`:

```
DB_URL=jdbc:postgresql://[YOUR-HOST]:6543/postgres?prepareThreshold=0&sslmode=require
DB_USERNAME=postgres.xxxxxxxxxxxxxxx
DB_PASSWORD=[YOUR-DATABASE-PASSWORD]
```

> **Important:** Replace the placeholder values with the actual credentials provided by your team lead.

#### Step 2: Verify PostgreSQL Driver

The project already includes the PostgreSQL driver in `pom.xml`, but verify it's present:

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

If missing, add it to the `<dependencies>` section in `backend/pom.xml`.

> **Note:** The database is shared among all team members. Be careful when making schema changes or modifying data during development.

### 🧩 Backend Setup (Spring Boot)

#### Step 1: Navigate to Backend Directory

```
cd backend
```

#### Step 2: Build the Project

```
# Using Maven wrapper (recommended)
./mvnw clean install

# Or using system Maven
mvn clean install
```

#### Step 3: Run the Backend Server

```
# Using Maven wrapper
./mvnw spring-boot:run

# Or using system Maven
mvn spring-boot:run
```

#### Step 4: Verify Backend is Running

- The server should start at **http://localhost:8080**
- Check the console for: `Started OnlinecanteenApplication`
- Test API: Open browser and go to `http://localhost:8080/api/test`
  - Should return: `"API is working!"`

### 💻 Web Dashboard Setup (Frontend)

#### Step 1: Navigate to Frontend Directory

```
cd web/frontend
```

#### Step 2: Install Dependencies

```
npm install
```

#### Step 3: Start Development Server

```
npm start
```

#### Step 4: Verify Frontend is Running

- The app should open automatically at **http://localhost:3000**
- If not, manually open: `http://localhost:3000`

### 📱 Mobile App Setup (Android)

#### Step 1: Open Android Studio

1. Launch Android Studio
2. Click **"Open an Existing Project"**
3. Navigate to the `mobile/` directory and open it

#### Step 2: Sync Gradle

- Android Studio will automatically sync Gradle files
- Wait for the process to complete (~2-5 minutes)

#### Step 3: Configure API Base URL

1. Locate `ApiClient.kt` (usually in `app/src/main/java/.../network/`)
2. Update the base URL:
   ```kotlin
   private const val BASE_URL = "http://10.0.2.2:8080/api/"
   // Note: 10.0.2.2 is the Android emulator's alias for localhost
   // For physical device, use your computer's IP address (e.g., "http://192.168.1.100:8080/api/")
   ```

#### Step 4: Run on Device/Emulator

1. Connect an Android device (with USB debugging enabled) or start an emulator
2. Click **Run** (green play button) or press `Shift + F10`
3. Select your device/emulator from the list

---

## 👥 Team Members

| Name                          | Role                               | CIT-U Email                   | GitHub                                           |
| ----------------------------- | ---------------------------------- | ----------------------------- | ------------------------------------------------ |
| **Shayne Marie B. Angus**     | Lead Developer / Project Manager   | shaynemarie.angus@cit.edu     | [@ShayVC](https://github.com/ShayVC)             |
| **Estelle Felicity T. Carao** | Backend Developer                  | estellefelicity.carao@cit.edu | [@teruteriri](https://github.com/teruteriri)     |
| **Johannah Rhey S. Alcarez**  | Frontend Developer (Web Dashboard) | johannahrheys.alcarez@cit.edu | [@lovenahnah](https://github.com/lovenahnah)     |
| **Kursten Dane M. Casas**     | Mobile Developer (Android App)     | kurstendane.casas@cit.edu     | [@kurstdane](https://github.com/kurstdane)       |
| **Mr. Frederick Revilleza**   | Project Adviser                    | frederick.revillezajr@cit.edu | [@blissfuljuan](https://github.com/blissfuljuan) |

---

## 📦 Database

| File                       | Purpose                                      |
| -------------------------- | -------------------------------------------- |
| `canteendb.sql`            | Main database structure                      |
| `create_tables.sql`        | Script for initial table setup               |
| `recreate_users_table.sql` | Rebuilds user table during resets            |
| `query/`                   | Contains reusable SQL queries for the system |

---

## 🧩 Functional Summary

| User Role         | Capabilities                                                    |
| ----------------- | --------------------------------------------------------------- |
| **Student**       | Register, log in, browse menus, place orders, view queue status |
| **Canteen Staff** | View and update orders, manage menus, monitor queues            |
| **Admin**         | Manage users, monitor orders, perform oversight                 |

---

## 🧠 Future Enhancements

- Simulated Mock Wallet for cashless payments
- Push notifications for real-time updates
- Analytics dashboard for admins
- Database backups and uptime monitoring
- Cross-platform support for iOS devices

---

## 🌐 Deployed Link

Local Deployment Only (undergoing)

---

## 🪪 License

This project was developed as part of the
Systems Integration and Architecture 1 (IT342)
course at Cebu Institute of Technology – University (CIT-U).

---

## 📅 Version

Version 1.0 — October 22, 2025

---

✨ “Efficient meals, one tap away.”
