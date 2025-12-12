// src/layouts/AdminLayout.tsx
import { NavLink, Outlet } from "react-router-dom";
import NotificationBell from "@/components/NotificationBell";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="px-6 py-5 border-b">
          <h1 className="text-2xl font-bold text-pink-600">WILDEATS Admin</h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-lg ${
                isActive ? "bg-pink-100 text-pink-600 font-semibold" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/requests"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-lg ${
                isActive ? "bg-pink-100 text-pink-600 font-semibold" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            Shop Requests
          </NavLink>

          <NavLink
            to="/admin/shops"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-lg ${
                isActive ? "bg-pink-100 text-pink-600 font-semibold" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            Manage Shops
          </NavLink>
        </nav>

        <div className="px-4 py-4 border-t">
          <NotificationBell />
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>

    </div>
  );
}
