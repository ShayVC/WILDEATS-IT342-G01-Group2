# 🍽️ WILDEATS: Online Canteen System (IT342-G01-Group2)

## 📘 Project Overview
**WILDEATS: Online Canteen System (WOCS)** is a digital platform designed to modernize and streamline the school canteen experience. 

It enables students to **pre-order meals** and monitor their **queue status** through a mobile app, while canteen staff manage orders and menus using a web dashboard. 

The system is powered by a **Spring Boot + MySQL backend**, ensuring fast, secure, and reliable communication between all components.

---

## ⚙️ Tech Stack Used

| Layer | Technology | Description |
|-------|-------------|-------------|
| **Mobile App** | Kotlin (Android Studio) | Used by students to browse menus, place orders, and view queues. |
| **Web Dashboard** | Node.js / React (frontend) | Used by canteen staff and admins to manage menus and orders.
| **Backend APIs** | Java (Spring Boot REST APIs) | Handles logic, authentication, and database operations. |
| **Database** | MySQL | Stores all user, order, and menu information securely. |
| **Version Control** | Git + GitHub | Collaboration and version tracking for all developers. |
---

## 🏗️ Project Structure
<img width="208" height="453" alt="image" src="https://github.com/user-attachments/assets/5c674e84-1f67-4518-858b-56db939cbde6" />


## 🚀 Setup & Run Instructions

### 🧩 Backend Setup (Spring Boot)
1. Navigate to the backend directory:
   cd backend
2. Open the project in IntelliJ or Eclipse.
3. Configure the database connection inside application.properties.
4. Run the project using Maven.
   ./mvnw spring-boot:run
5. The backend should start at http://localhost:8080.

💻 Web Dashboard Setup (Frontend)

1. Navigate to the web dashboard folder:
cd web_frontend
2. Install dependencies:
npm install
3. Start the development server:
npm start
4. Open your browser and go to:
http://localhost:3000

📱 Mobile App Setup (Android)

1. Open the mobile folder in Android Studio.
2. Sync Gradle and ensure dependencies are installed.
3. Update your API base URL in the ApiClient.kt file.
4. Run the app on an Android device (Android 10+).

👥 Team Members

| Name                          | Role                               | CIT-U Email                                                 | GitHub                                          |
| ----------------------------- | ---------------------------------- | ----------------------------------------------------------- | ----------------------------------------------- |
| **Shayne Marie B. Angus**     | Lead Developer / Project Manager   | [shayne.angus@cit.edu](mailto:shayne.angus@cit.edu)         | [@ShayVC](https://github.com/ShayVC)            |
| **Estelle Felicity T. Carao** | Backend Developer                  | estellefelicity.carao@cit.edu                               | [@teruteriri](https://github.com/teruteriri)    |
| **Johannah Rhey S. Alcarez**  | Frontend Developer (Web Dashboard) | johannahrheys.alcarez@cit.edu                               | [@lovenahnah](https://github.com/lovenahnah)    |
| **Kursten Dane M. Casas**     | Mobile Developer (Android App)     | kurstendane.casas@cit.edu                                   | [@kurstdane](https://github.com/kurstdane)      |
| **Mr. Frederick Revilleza**   | Project Adviser                    | frederick.revillezajr@cit.edu                               | [blissfuljuan](https://github.com/blissfuljuan) |

📦 Database
| File                       | Purpose                                      |
| -------------------------- | -------------------------------------------- |
| `canteendb.sql`            | Main database structure                      |
| `create_tables.sql`        | Script for initial table setup               |
| `recreate_users_table.sql` | Rebuilds user table during resets            |
| `query/`                   | Contains reusable SQL queries for the system |

🧩 Functional Summary
| User Role         | Capabilities                                                    |
| ----------------- | --------------------------------------------------------------- |
| **Student**       | Register, log in, browse menus, place orders, view queue status |
| **Canteen Staff** | View and update orders, manage menus, monitor queues            |
| **Admin**         | Manage users, monitor orders, perform oversight                 |

🧠 Future Enhancements
- Simulated Mock Wallet for cashless payments
- Push notifications for real-time updates
- Analytics dashboard for admins
- Database backups and uptime monitoring
- Cross-platform support for iOS devices

🌐 Deployed Link
Local Deployment Only (undergoing)

🪪 License
This project was developed as part of the 
Systems Integration and Architecture 1 (IT342) 
course at Cebu Institute of Technology – University (CIT-U).

📅 Version
Version 1.0 — October 22, 2025

✨ “Efficient meals, one tap away.”
