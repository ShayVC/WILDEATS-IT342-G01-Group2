import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";

import { useShops, Shop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";

// Popular items by location / fallback
const popularMenusByLocation: Record<string, string[]> = {
  "Main Canteen": ["Silog Meals", "Pasta Plates", "Iced Coffee"],
  "JHS Canteen": ["Burger & Fries", "Milk Tea", "Rice Bowls"],
  "Preschool Canteen": ["Kid’s Spaghetti", "Mini Sandwiches", "Fruit Juice"],
};

// Image presets / fallbacks
const shopImages: Record<string, string> = {
  "Main Canteen":
    "https://images.unsplash.com/photo-1555992336-cbf1b5c2c33e?w=800&q=80",
  "JHS Canteen":
    "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
  "Preschool Canteen":
    "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?w=800&q=80",
  default:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
};

type SortOption = "FEATURED" | "AZ" | "NEWEST" | "OLDEST";

const ShopsPage: React.FC = () => {
  const { shops, loading, error, refreshShops, removeShop } = useShops();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "ADMIN";
  const isSeller = user?.role === "SELLER";

  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("FEATURED");

  // ========= DERIVED FILTER OPTIONS =========
  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    shops.forEach((s) => {
      if (s.location) set.add(s.location);
    });
    return Array.from(set).sort();
  }, [shops]);

  // ========= SORT + FILTER =========
  const processedShops = useMemo(() => {
    let list: Shop[] = [...shops];

    if (selectedLocation !== "ALL") {
      list = list.filter((s) => s.location === selectedLocation);
    }

    switch (sortBy) {
      case "AZ":
        list.sort((a, b) => a.shopName.localeCompare(b.shopName));
        break;
      case "NEWEST":
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "OLDEST":
        list.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "FEATURED":
      default:
        // Simple “featured”: open + newest first
        list.sort((a, b) => {
          if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        });
        break;
    }

    return list;
  }, [shops, selectedLocation, sortBy]);

  // ========= DELETE HANDLER =========
  const handleDelete = async (id: number) => {
    // NOTE: backend currently restricts delete to SELLER owner;
    // front-end keeps an extra guard just in case.
    if (!isAdmin && !isSeller) {
      toast.error("You do not have permission to delete shops.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this shop?")) return;

    try {
      setIsDeletingId(id);
      await removeShop(id);
      toast.success("Shop deleted successfully");
      // removeShop already updates context; refresh optional
      // await refreshShops();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete shop");
    } finally {
      setIsDeletingId(null);
    }
  };

  // ========= LOADING SKELETON =========
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Simple top bar, consistent with app */}
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
                <button
                  onClick={() => navigate("/cart")}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <ShoppingBag className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded" />
            <div className="h-4 w-80 bg-gray-200 rounded" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                >
                  <div className="h-36 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-40 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                    <div className="h-9 w-full bg-gray-200 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ========= ERROR STATE =========
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 bg-white border border-red-200 rounded-xl text-center max-w-md">
          <h2 className="text-red-600 font-semibold text-lg">
            Something went wrong
          </h2>
          <p className="text-sm text-red-700 my-2">{error}</p>
          <button
            onClick={refreshShops}
            className="px-4 py-2 mt-2 rounded-full border text-red-700 border-red-300 hover:bg-red-50 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ========= MAIN RENDER =========
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER (no language switch) */}
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

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-700">
                Hi, {user.firstName}
              </span>
            )}

            {user && (
              <button
                onClick={() => navigate("/cart")}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

{/* HERO SECTION */}
<div className="bg-gradient-to-r from-fp-pink to-rose-500 text-white py-12 px-4 shadow-md">
  <div className="max-w-7xl mx-auto flex flex-col gap-3">

    <button
      onClick={() => navigate(-1)}
      className="mt-3 inline-flex items-center px-4 py-2 text-xs md:text-sm backdrop-blur transition"
    >
      ← Back
    </button>

    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-sm">
      Browse Canteens & Partner Shops
    </h1>

    <p className="text-white/90 max-w-xl text-sm md:text-base leading-relaxed">
      Discover officially registered WildEats partner canteens on campus.
      View shop profiles, explore their best-sellers, and more.
    </p>


  </div>
</div>


      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Controls row: filters + sort + admin action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
  {/* FILTERS */}
  <div className="flex flex-wrap gap-3 items-center">
    <span className="text-sm text-gray-600 font-medium">Filter:</span>

    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setSelectedLocation("ALL")}
        className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${
          selectedLocation === "ALL"
            ? "bg-fp-pink text-white border-fp-pink shadow-sm"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        All
      </button>

      {availableLocations.map((loc) => (
        <button
          key={loc}
          onClick={() => setSelectedLocation(loc)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${
            selectedLocation === loc
              ? "bg-fp-pink text-white border-fp-pink shadow-sm"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  </div>

  {/* SORTING */}
  <div className="flex items-center gap-3">
    <label className="text-xs text-gray-600 font-medium">Sort by:</label>
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value as SortOption)}
      className="border rounded-full px-4 py-1.5 text-xs bg-white hover:bg-gray-50 transition"
    >
      <option value="FEATURED">Featured</option>
      <option value="AZ">A–Z</option>
      <option value="NEWEST">Newest</option>
      <option value="OLDEST">Oldest</option>
    </select>

    {(isAdmin || isSeller) && (
      <Link
        to="/seller-register"
        className="hidden md:inline-flex items-center gap-1 text-xs text-fp-pink font-semibold underline underline-offset-4"
      >
        Become a partner
      </Link>
    )}
  </div>
</div>




        {/* Admin-only Add Shop (for legacy/manual shop management) */}
        {isAdmin && (
          <div className="flex justify-end mb-2">
            <Link
              to="/shops/create"
              className="bg-fp-pink text-white px-4 py-2 rounded-full text-sm"
            >
              + Add New Shop
            </Link>
          </div>
        )}

        {/* Empty state */}
        {processedShops.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center">
            <h2 className="text-lg font-semibold mb-2">
              No shops match your filters
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Try clearing your filters or check back later when more shops are
              available.
            </p>
            <button
              onClick={() => {
                setSelectedLocation("ALL");
                setSortBy("FEATURED");
                refreshShops();
              }}
              className="px-4 py-2 bg-fp-pink text-white rounded-full text-sm"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedShops.map((shop) => {
              const popular =
                popularMenusByLocation[shop.location] || [
                  "Best-selling meals",
                  "Snacks",
                  "Drinks",
                ];

              const isOwnedByUser =
                !!user && user.id === shop.ownerId && (isSeller || isAdmin);

              const imageSrc =
                shop.shopImageURL ||
                shopImages[shop.location] ||
                shopImages.default;

              return (
<div
  key={shop.shopId}
  className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
>
  {/* SHOP IMAGE */}
  <div className="relative h-40">
    <img
      src={imageSrc}
      alt={shop.shopName}
      className="w-full h-full object-cover"
    />

    {/* BADGES */}
    <div className="absolute top-2 left-2 flex gap-2">
      <span className="bg-white/90 backdrop-blur text-xs font-semibold text-fp-pink px-2 py-1 rounded-full shadow-sm">
        {shop.location}
      </span>

      {shop.isOpen ? (
        <span className="bg-emerald-600 text-white text-[11px] px-2 py-1 rounded-full shadow-sm">
          Open now
        </span>
      ) : (
        <span className="bg-gray-500 text-white text-[11px] px-2 py-1 rounded-full shadow-sm">
          Closed
        </span>
      )}
    </div>

    {isOwnedByUser && (
      <span className="absolute bottom-2 left-2 bg-white/95 text-[11px] text-gray-700 px-2 py-1 rounded-full shadow-sm">
        Owned by you
      </span>
    )}
  </div>

  {/* BODY */}
  <div className="p-5 flex flex-col gap-4">

    {/* SHOP TITLE + DESCRIPTION */}
    <div className="space-y-1">
      <h3 className="text-lg font-bold text-gray-900">{shop.shopName}</h3>

      <p className="text-xs text-gray-500 line-clamp-2">
        {shop.shopDescr || "No description yet."}
      </p>

    </div>

    {/* POPULAR ITEMS */}
    <div>
      <p className="text-[11px] font-semibold text-gray-700 mb-1">
        Popular items
      </p>

      <div className="flex flex-wrap gap-1">
        {popular.map((item) => (
          <span
            key={item}
            className="px-2 py-1 bg-gray-100 border text-gray-700 text-[11px] rounded-full"
          >
            {item}
          </span>
        ))}
      </div>
    </div>

    {/* FOOTER ACTIONS */}
    <div className="flex items-center justify-between pt-2">

      <Link
        to={`/shops/${shop.shopId}`}
        className="flex-1 text-center px-4 py-2 rounded-full bg-slate-50 border border-gray-200 hover:bg-gray-100 text-sm font-medium transition"
      >
        View shop
      </Link>

      {(isAdmin || isOwnedByUser) && (
        <div className="flex gap-2 ml-2">
          <Link
            to={`/shops/edit/${shop.shopId}`}
            className="px-3 py-2 bg-amber-500 text-white rounded-full text-xs hover:bg-amber-600"
          >
            Edit
          </Link>

          <button
            onClick={() => handleDelete(shop.shopId)}
            disabled={isDeletingId === shop.shopId}
            className="px-3 py-2 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 disabled:bg-gray-300"
          >
            {isDeletingId === shop.shopId ? "..." : "Del"}
          </button>
        </div>
      )}
    </div>
  </div>
</div>


              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ShopsPage;
