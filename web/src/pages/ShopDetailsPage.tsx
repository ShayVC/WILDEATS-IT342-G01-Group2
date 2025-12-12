import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Store,
  ShieldAlert,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useShops, Shop } from "@/context/ShopContext";
import MenuList from "@/components/MenuList";

const API_BASE = "http://localhost:8080/api";

const ShopDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shops } = useShops();

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Try to hydrate from cached shops first
  useEffect(() => {
    if (!id) {
      setError("Invalid shop ID");
      setLoading(false);
      return;
    }

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      setError("Invalid shop ID");
      setLoading(false);
      return;
    }

    const cached = shops.find((s) => s.shopId === numericId);
    if (cached) {
      setShop(cached);
      setLoading(false);
    }

    const fetchShop = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get<Shop>(`${API_BASE}/shops/${numericId}`);

        setShop(res.data);
      } catch (err: any) {
        console.error(err);
        const msg =
          err?.response?.data?.message ||
          (err?.response?.status === 404
            ? "Shop not found"
            : err?.response?.status === 403
            ? "This shop is not currently active."
            : "Failed to load shop details.");
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    // Always revalidate from backend; cached data is just initial render
    fetchShop();
  }, [id, shops]);

  const isOwner =
    !!user && !!shop && user.id === shop.ownerId && user.role === "SELLER";
  const isAdmin = user?.role === "ADMIN";

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700";
      case "PENDING":
        return "bg-amber-100 text-amber-700";
      case "SUSPENDED":
        return "bg-red-100 text-red-700";
      case "CLOSED":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formattedDate = (value?: string) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleString();
  };

  // ========= LOADING STATE =========
  if (loading && !shop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="max-w-7xl mx-auto py-4 px-4 flex justify-between items-center">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <svg viewBox="0 0 200 50" className="h-8 w-auto">
                <rect
                  x="0"
                  y="10"
                  width="30"
                  height="30"
                  rx="6"
                  fill="hsla(0,80%,25%,1)"
                />
                <text
                  x="38"
                  y="33"
                  fill="hsla(0,80%,25%,1)"
                  fontSize="22"
                  fontWeight="700"
                >
                  WildEats
                </text>
              </svg>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 bg-gray-200 rounded" />
            <div className="h-8 w-72 bg-gray-200 rounded" />
            <div className="h-4 w-60 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded-2xl mt-6" />
          </div>
        </main>
      </div>
    );
  }

  // ========= ERROR STATE =========
  if (error && !shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-xl p-6 max-w-md text-center">
          <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h2 className="font-semibold text-red-600 mb-1">
            Unable to load shop
          </h2>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button
            onClick={() => navigate("/shops")}
            className="px-4 py-2 rounded-full bg-fp-pink text-white text-sm"
          >
            Back to shops
          </button>
        </div>
      </div>
    );
  }

  if (!shop) {
    // Should be unreachable but keeps TS happy
    return null;
  }

  const imageSrc =
    shop.shopImageURL ||
    (shop.location === "Main Canteen"
      ? "https://images.unsplash.com/photo-1555992336-cbf1b5c2c33e?w=800&q=80"
      : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80");

  // ========= MAIN RENDER =========
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto py-4 px-4 flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <svg viewBox="0 0 200 50" className="h-8 w-auto">
              <rect
                x="0"
                y="10"
                width="30"
                height="30"
                rx="6"
                fill="hsla(0,80%,25%,1)"
              />
              <text
                x="38"
                y="33"
                fill="hsla(0,80%,25%,1)"
                fontSize="22"
                fontWeight="700"
              >
                WildEats
              </text>
            </svg>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">
                Hi, {user.firstName}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* HERO + CONTENT */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to shops
        </button>

        {/* HERO CARD */}
        <section className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="h-56 w-full relative">
            <img
              src={imageSrc}
              alt={shop.shopName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow">
                  {shop.shopName}
                </h1>
                <p className="flex items-center gap-1 text-xs text-white/90">
                  <MapPin className="w-4 h-4" />
                  {shop.location} · {shop.shopAddress || "Address not set"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={
                    "px-3 py-1 rounded-full text-xs font-semibold " +
                    statusBadgeClass(shop.status)
                  }
                >
                  {shop.status}
                </span>
                {shop.isOpen && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white">
                    Open now
                  </span>
                )}
                {isOwner && (
                  <span className="px-3 py-1 rounded-full text-xs bg-white/90 text-gray-800">
                    Owned by you
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info section */}
          <div className="p-5 md:p-6 space-y-4">
  <p className="text-sm text-gray-700">
    {shop.shopDescr || "This shop has not added a description yet."}
  </p>

  {/* Menu List */}
  <MenuList shop={shop} />

  {/* Owner/Admin controls */}
  {(isOwner || isAdmin) && (
    <div className="flex flex-wrap gap-3 pt-4">
      {isOwner && (
        <Link
          to={`/seller_dashboard`}
          className="px-4 py-2 rounded-full bg-fp-pink text-white text-xs font-medium hover:bg-fp-pink/90"
        >
          Go to Seller Dashboard
        </Link>
      )}
      <Link
        to={`/shops/edit/${shop.shopId}`}
        className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 text-xs font-medium hover:bg-gray-200"
      >
        Edit shop details
      </Link>
    </div>
  )}
</div>
        </section>
      </main>
    </div>
  );
};

export default ShopDetailsPage;
