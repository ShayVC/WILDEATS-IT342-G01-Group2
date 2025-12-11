import React from "react";

export default function AdminHeader() {
  return (
    <div className="w-full bg-white shadow px-6 py-4 flex justify-between">
      <h1 className="text-lg font-semibold">SuperAdmin Panel</h1>
      <button className="px-4 py-2 bg-red-500 text-white rounded-lg">
        Logout
      </button>
    </div>
  );
}
