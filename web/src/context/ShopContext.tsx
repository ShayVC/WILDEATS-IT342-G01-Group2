import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// =======================
// Correct Backend Shop Type
// =======================
export interface Shop {
  shopId: number;
  shopName: string;
  shopDescr: string;
  shopAddress: string;
  location: string;
  contactNumber: string;
  shopImageURL: string | null;
  status: string;
  isOpen: boolean;
  ownerId: number;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

// =======================
// Context Shape
// =======================
interface ShopContextProps {
  shops: Shop[];
  loading: boolean;
  error: string | null;
  refreshShops: () => void;
  removeShop: (id: number) => Promise<void>;
}

const ShopContext = createContext<ShopContextProps | null>(null);

// =======================
// Provider
// =======================
export const ShopProvider = ({ children }: { children: React.ReactNode }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Shop[]>("http://localhost:8080/api/shops");
      setShops(res.data); // Already correctly formatted from backend
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  const removeShop = async (id: number) => {
    await axios.delete(`http://localhost:8080/api/shops/${id}`);
    setShops((prev) => prev.filter((s) => s.shopId !== id)); // FIXED FIELD
  };

  useEffect(() => {
    fetchShops();
  }, []);

  return (
    <ShopContext.Provider
      value={{
        shops,
        loading,
        error,
        refreshShops: fetchShops,
        removeShop,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

// =======================
// Hook
// =======================
export const useShops = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShops must be used inside ShopProvider");
  return ctx;
};
