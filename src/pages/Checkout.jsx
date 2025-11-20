import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Checkout(){
  const { items, total, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const placeOrder = async () => {
    setLoading(true);
    try {
      const payload = { items: items.map(i => ({ product: i.product.id, quantity: i.quantity })), total };
      await api.post("/orders/", payload);
      clearCart();
      nav("/");
    } catch (err) { console.error(err); alert("Order failed"); }
    setLoading(false);
  };

  return (
    <div className="container">
      <h2>Checkout</h2>
      {items.map(i=> <div key={i.product.id}>{i.product.name} x {i.quantity}</div>)}
      <h3>Total: ₱{total.toFixed(2)}</h3>
      <button disabled={loading} onClick={placeOrder}>{loading ? "Placing..." : "Place Order"}</button>
    </div>
  );
}
