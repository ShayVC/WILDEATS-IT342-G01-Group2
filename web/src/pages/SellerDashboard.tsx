import React from "react";
import { useAuth } from "@/context/AuthContext";


import NotificationBell from "@/components/NotificationBell";


const SellerDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
    
    <div className="flex items-center gap-4">
  <NotificationBell />
  <span>Hi, {user.firstName}</span>
</div>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Seller Dashboard – {user?.firstName || "Seller"}
        </h1>
        <p className="text-muted-foreground mb-6">
          Manage your canteen shop, menu items, and incoming orders.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="border border-border rounded-xl p-4">
            <h2 className="font-semibold mb-2">My Shop</h2>
            <p className="text-sm text-muted-foreground">
              Configure your shop details, opening time, and status.
            </p>
          </div>
          <div className="border border-border rounded-xl p-4">
            <h2 className="font-semibold mb-2">Menu Items</h2>
            <p className="text-sm text-muted-foreground">
              Add, update, or archive food items and prices.
            </p>
          </div>
          <div className="border border-border rounded-xl p-4">
            <h2 className="font-semibold mb-2">Orders</h2>
            <p className="text-sm text-muted-foreground">
              See real-time orders from students and staff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
