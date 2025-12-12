// src/components/MenuList.tsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, UtensilsCrossed, Coffee, IceCream2, Sandwich } from "lucide-react";
import AddToCartModal, { MenuItem } from "@/components/AddToCartModal";
import type { Shop } from "@/context/ShopContext";

const API_BASE = "http://localhost:8080/api";

type MenuCategory = "All" | "Meals" | "Drinks" | "Snacks" | "Desserts";

interface MenuListProps {
  shop: Shop; // pass whole shop from ShopDetailsPage
}

interface BackendMenuItemDTO {
  itemId: number;
  shopId: number;
  itemName: string;
  itemDescr?: string | null;
  itemImageURL?: string | null;
  price: number;
  isAvailable: boolean;
}

interface MenuItemWithMeta extends MenuItem {
  category: MenuCategory;
}

const inferCategory = (name: string): MenuCategory => {
  const n = name.toLowerCase();
  if (
    n.includes("silog") ||
    n.includes("rice") ||
    n.includes("meal") ||
    n.includes("chicken") ||
    n.includes("burger")
  ) {
    return "Meals";
  }
  if (
    n.includes("tea") ||
    n.includes("coffee") ||
    n.includes("juice") ||
    n.includes("drink") ||
    n.includes("soda")
  ) {
    return "Drinks";
  }
  if (
    n.includes("fries") ||
    n.includes("snack") ||
    n.includes("corn dog") ||
    n.includes("sandwich")
  ) {
    return "Snacks";
  }
  if (
    n.includes("ice cream") ||
    n.includes("halo-halo") ||
    n.includes("cake") ||
    n.includes("dessert")
  ) {
    return "Desserts";
  }
  return "Meals"; // default
};

const MenuList: React.FC<MenuListProps> = ({ shop }) => {
  const [items, setItems] = useState<MenuItemWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<MenuCategory>("All");
  const [onlyAvailable, setOnlyAvailable] = useState(true);

  const [selectedItem, setSelectedItem] = useState<MenuItemWithMeta | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch menu items
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get<BackendMenuItemDTO[]>(
          `${API_BASE}/menu-items/shop/${shop.shopId}`
        );

        const mapped: MenuItemWithMeta[] = res.data.map((m) => ({
          itemId: m.itemId,
          shopId: m.shopId,
          shopName: shop.shopName,
          itemName: m.itemName,
          itemDescr: m.itemDescr,
          itemImageURL: m.itemImageURL,
          price: m.price,
          isAvailable: m.isAvailable,
          category: inferCategory(m.itemName),
        }));

        setItems(mapped);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            "Failed to load menu items for this shop."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [shop.shopId, shop.shopName]);

  const categories: { key: MenuCategory; label: string; icon: React.ReactNode }[] =
    [
      { key: "All", label: "All", icon: <UtensilsCrossed className="w-3 h-3" /> },
      { key: "Meals", label: "Meals", icon: <UtensilsCrossed className="w-3 h-3" /> },
      { key: "Drinks", label: "Drinks", icon: <Coffee className="w-3 h-3" /> },
      { key: "Snacks", label: "Snacks", icon: <Sandwich className="w-3 h-3" /> },
      { key: "Desserts", label: "Desserts", icon: <IceCream2 className="w-3 h-3" /> },
    ];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (onlyAvailable && !item.isAvailable) return false;
      if (category !== "All" && item.category !== category) return false;
      if (!search.trim()) return true;
      const term = search.trim().toLowerCase();
      return (
        item.itemName.toLowerCase().includes(term) ||
        (item.itemDescr || "").toLowerCase().includes(term)
      );
    });
  }, [items, search, category, onlyAvailable]);

  const handleOpenModal = (item: MenuItemWithMeta) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  // ===== RENDER STATES =====

  if (loading && items.length === 0) {
    return (
      <section className="mt-6">
        <div className="h-4 w-40 bg-gray-200 rounded mb-3 animate-pulse" />
        <div className="h-10 w-full bg-gray-100 rounded-xl mb-4 animate-pulse" />
        <div className="space-y-3">
          <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </section>
    );
  }

  if (error && items.length === 0) {
    return (
      <section className="mt-6">
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 space-y-4">
      {/* HEADER + SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Menu</h2>
          <p className="text-xs text-gray-500">
            Tap an item to customize and add to your cart.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-xs"
              placeholder="Search menu items…"
            />
          </div>
        </div>
      </div>

      {/* CATEGORY CHIPS + AVAILABILITY TOGGLE */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition ${
              category === c.key
                ? "bg-fp-pink text-white border-fp-pink"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {c.icon}
            <span>{c.label}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setOnlyAvailable((v) => !v)}
          className={`ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] border ${
            onlyAvailable
              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
              : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              onlyAvailable ? "bg-emerald-500" : "bg-gray-300"
            }`}
          />
          Available only
        </button>
      </div>

      {/* MENU GRID / LIST */}
      {filteredItems.length === 0 ? (
        <p className="text-xs text-gray-500 mt-2">
          No items match your filters yet.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <button
              key={item.itemId}
              type="button"
              onClick={() => handleOpenModal(item)}
              className="w-full flex gap-3 items-stretch bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden text-left"
            >
              {/* Image */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 flex-shrink-0 overflow-hidden">
                {item.itemImageURL ? (
                  <img
                    src={item.itemImageURL}
                    alt={item.itemName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-400">
                    No image
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 py-3 pr-3 flex flex-col justify-between gap-1">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold line-clamp-2">
                      {item.itemName}
                    </p>
                    {!item.isAvailable && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        Unavailable
                      </span>
                    )}
                  </div>
                  {item.itemDescr && (
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                      {item.itemDescr}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-semibold">
                    ₱{item.price.toFixed(2)}
                  </p>
                  <span className="text-[11px] text-gray-500 capitalize">
                    {item.category.toLowerCase()}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* MODAL */}
      <AddToCartModal
        open={modalOpen}
        onClose={handleCloseModal}
        item={selectedItem}
      />
    </section>
  );
};

export default MenuList;
