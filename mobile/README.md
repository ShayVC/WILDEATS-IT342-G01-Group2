# 📱 WILDEATS Mobile App (Kotlin Version)

## 📘 Overview
This folder is reserved for the **mobile component** of the WILDEATS: Online Canteen System (IT342-G01-Group2).  

The mobile application will be developed using **Kotlin in Android Studio** and will serve as the **student-facing platform** for the system.

Students will be able to:
- Log in or register using their school credentials  
- Browse available canteen menus  
- Place meal orders and receive digital queue numbers  
- Monitor order status in real-time (Pending → Preparing → Ready)

---

## 🏗️ Planned Tech Stack

| Component | Technology |
|------------|-------------|
| **Language** | Kotlin |
| **Framework** | Android SDK |
| **Minimum SDK** | Android 10 (API Level 29) |
| **Architecture** | MVVM (Model-View-ViewModel) |
| **Networking** | Retrofit + Gson |
| **Database** | Remote (MySQL via Spring Boot backend) |
| **IDE** | Android Studio |
| **Version Control** | GitHub |

---

## 🧩 Planned Integration
The mobile app will communicate with the **Spring Boot backend** through RESTful APIs over HTTPS.

**Example API Endpoints (to be implemented):**
- `POST /api/login` — User authentication  
- `GET /api/menu` — Fetch available menu items  
- `POST /api/order` — Submit a new food order  
- `GET /api/queue/{userId}` — Check order and queue status  

---

## 🚧 Development Roadmap

| Phase | Goal | Target Date |
|-------|------|--------------|
| Phase 1 | Initialize Android Studio Project | November 2025 |
| Phase 2 | Implement Login and Menu Screens | November 2025 |
| Phase 3 | Integrate Backend APIs with Retrofit | December 2025 |
| Phase 4 | UI Polishing and Testing | December 2025 |
| Phase 5 | Final Presentation | December 2025 |

---

## 👥 Assigned Developer
- **Kursten Dane M. Casas** — Mobile Developer (Kotlin Android)

---

## 📝 Notes
This mobile module is currently **not yet implemented** as of October 2025.  
All development plans and integration points are documented to ensure seamless continuation once development begins.

---

📅 **Version 1.0 — Placeholder Documentation (October 2025)**  
✨ *"Efficient meals, one tap away."*
