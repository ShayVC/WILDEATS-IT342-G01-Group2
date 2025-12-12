import React, { useEffect, useState } from "react";
import api from "@/utils/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Store, ClipboardList, LayoutDashboard } from "lucide-react";

interface Shop {
  shopId: number;
  shopName: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "CLOSED";
}

export default function AdminDashboard() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadShops() {
      try {
        const res = await api.get<Shop[]>("/api/shops/admin/all");
        setShops(res.data);
      } catch (err) {
        console.error("Failed to load shops", err);
      } finally {
        setLoading(false);
      }
    }

    loadShops();
  }, []);

  const pending = shops.filter((s) => s.status === "PENDING").length;
  const active = shops.filter((s) => s.status === "ACTIVE").length;
  const suspended = shops.filter((s) => s.status === "SUSPENDED").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ========================= */}
      {/* ADMIN HEADER */}
      {/* ========================= */}
      <header className="sticky top-0 z-40 bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          
          <h1
            className="font-bold text-xl text-fp-pink cursor-pointer"
            onClick={() => navigate("/admin_homepage")}
          >
            WildEats Admin
          </h1>

          <div className="flex items-center gap-4">

            {/* Admin Navigation */}
            <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
              <button
                onClick={() => navigate("/admin_homepage")}
                className="hover:text-fp-pink flex items-center gap-1"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={() => navigate("/admin/shops")}
                className="hover:text-fp-pink flex items-center gap-1"
              >
                <Store className="w-4 h-4" />
                Shops
              </button>

              <button
                onClick={() => navigate("/admin/requests")}
                className="hover:text-fp-pink flex items-center gap-1"
              >
                <ClipboardList className="w-4 h-4" />
                Requests
              </button>
            </nav>

            {/* Logout */}
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm hover:bg-red-100"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ========================= */}
      {/* MAIN DASHBOARD CONTENT */}
      {/* ========================= */}
      <main className="max-w-7xl mx-auto p-6 space-y-10">

        {/* WELCOME */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.firstName}
          </h2>
          <p className="text-gray-600 text-sm">
            Manage shop applications, monitor partner status, and oversee system activity.
          </p>
        </section>

        {/* STAT CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <p className="text-gray-600 text-sm">Pending Requests</p>
            <p className="text-4xl font-semibold text-yellow-600 mt-2">{pending}</p>
          </div>

          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <p className="text-gray-600 text-sm">Active Shops</p>
            <p className="text-4xl font-semibold text-emerald-600 mt-2">{active}</p>
          </div>

          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <p className="text-gray-600 text-sm">Suspended Shops</p>
            <p className="text-4xl font-semibold text-red-600 mt-2">{suspended}</p>
          </div>

        </section>

        {/* REQUEST SUMMARY */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Shop Requests
          </h3>

          {pending === 0 ? (
            <p className="text-gray-500 text-sm">No pending shop applications.</p>
          ) : (
            <p className="text-gray-700 text-sm">
              {pending} shop{pending !== 1 && "s"} waiting for approval.
            </p>
          )}
        </section>

        {/* MANAGE SHOPS */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Shop Status Overview
          </h3>

          {active === 0 && suspended === 0 ? (
            <p className="text-gray-500 text-sm">No shops to manage.</p>
          ) : (
            <p className="text-gray-700 text-sm">
              {active} active, {suspended} suspended.
            </p>
          )}
        </section>

      </main>
    </div>
  );
}
