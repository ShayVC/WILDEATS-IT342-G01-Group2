import React from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import StatsCard from "../../components/StatsCard";
import { useAdmin } from "../../context/AdminContext";

export default function Dashboard() {
  const { pendingShops } = useAdmin();

  return (
    <SuperAdminLayout>
      <h1 className="text-2xl font-bold mb-5">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard label="Pending Shops" value={pendingShops.length} />
        <StatsCard label="Active Shops" value="—" />
        <StatsCard label="Total Users" value="—" />
      </div>
    </SuperAdminLayout>
  );
}
