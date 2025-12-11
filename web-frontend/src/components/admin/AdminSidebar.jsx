
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const loc = useLocation();

  const linkClass = (path) =>
    `block px-5 py-3 rounded-lg mb-2 ${
      loc.pathname === path ? "bg-blue-600 text-white" : "bg-gray-100"
    }`;

  return (
    <div className="h-screen w-64 bg-white border-r p-4">
      <h2 className="text-xl font-bold mb-6">SuperAdmin</h2>

      <Link className={linkClass("/superadmin/dashboard")} to="/superadmin/dashboard">
        Dashboard
      </Link>

      <Link className={linkClass("/superadmin/shop-approvals")} to="/superadmin/shop-approvals">
        Shop Approvals
      </Link>

      <Link className={linkClass("/superadmin/shops")} to="/superadmin/shops">
        All Shops
      </Link>

      <Link className={linkClass("/superadmin/users")} to="/superadmin/users">
        Users
      </Link>

      <Link className={linkClass("/superadmin/settings")} to="/superadmin/settings">
        Settings
      </Link>
    </div>
  );
}