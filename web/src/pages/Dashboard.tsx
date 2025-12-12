import React from "react";
import { useAuth } from "@/context/AuthContext";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">
          Welcome, {user?.firstName || "Customer"}!
        </h1>
        <p className="text-muted-foreground mb-6">
          This is your WildEats dashboard. In the future you can show orders,
          favorites, and recommended canteen stalls here.
        </p>
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">
            Role: <span className="font-semibold">{user?.role}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Email: <span className="font-semibold">{user?.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
