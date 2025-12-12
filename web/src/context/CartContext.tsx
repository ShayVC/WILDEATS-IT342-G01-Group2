// src/context/CartContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface CartVariant {
  id: number;
  name: string;
  additionalPrice: number;
}

export interface CartAddon {
  id: number;
  name: string;
  price: number;
}

export interface CartFlavor {
  id: number;
  name: string;
}

export interface CartItem {
  key: string; // unique line item id
  itemId: number;
  shopId: number;
  shopName: string;
  name: string;
  basePrice: number;

  variant?: CartVariant;
  flavor?: CartFlavor;
  addons: CartAddon[];

  quantity: number;
  notes?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "wildeats_cart_v1";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addItem = (item: Omit<CartItem, "key">) => {
    const keyBase = `${item.shopId}-${item.itemId}-${item.variant?.id || "novar"}`;
    const addonsKey =
      item.addons && item.addons.length
        ? item.addons
            .map((a) => a.id)
            .sort((a, b) => a - b)
            .join("_")
        : "noaddons";

    const key = `${keyBase}-${addonsKey}-${item.flavor?.id || "noflavor"}`;

    setItems((prev) => {
      const existing = prev.find((ci) => ci.key === key);
      if (existing) {
        return prev.map((ci) =>
          ci.key === key
            ? { ...ci, quantity: ci.quantity + item.quantity }
            : ci
        );
      }
      return [...prev, { ...item, key }];
    });
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((ci) => ci.key !== key));
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) return removeItem(key);
    setItems((prev) =>
      prev.map((ci) => (ci.key === key ? { ...ci, quantity } : ci))
    );
  };

  const clearCart = () => setItems([]);

  const { totalItems, totalPrice } = useMemo(() => {
    let count = 0;
    let total = 0;
    for (const item of items) {
      const variantExtra = item.variant?.additionalPrice || 0;
      const addonsTotal = item.addons?.reduce((sum, a) => sum + a.price, 0) || 0;
      const linePrice =
        (item.basePrice + variantExtra + addonsTotal) * item.quantity;
      count += item.quantity;
      total += linePrice;
    }
    return { totalItems: count, totalPrice: total };
  }, [items]);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
};
