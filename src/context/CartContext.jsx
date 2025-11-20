// src/context/CartContext.jsx
import React, { createContext, useState, useEffect } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
  });

  useEffect(() => localStorage.setItem("cart", JSON.stringify(items)), [items]);

  const addToCart = (product, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id);
      if (idx === -1) return [...prev, { product, quantity: qty }];
      const copy = [...prev]; copy[idx].quantity += qty; return copy;
    });
  };

  const updateQuantity = (productId, quantity) => setItems(prev => prev.map(it => it.product.id === productId ? {...it, quantity} : it));
  const removeFromCart = (productId) => setItems(prev => prev.filter(it => it.product.id !== productId));
  const clearCart = () => setItems([]);
  const total = items.reduce((s, it) => s + (it.product.price || 0) * it.quantity, 0);

  return <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, total }}>{children}</CartContext.Provider>;
}
