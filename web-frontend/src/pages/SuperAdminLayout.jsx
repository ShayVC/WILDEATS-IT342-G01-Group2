import React from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";

export default function SuperAdminLayout({ children }) {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="flex-1 min-h-screen bg-gray-50">
        <AdminHeader />

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
