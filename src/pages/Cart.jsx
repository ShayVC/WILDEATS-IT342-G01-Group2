
import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Cart(){
  const { items, updateQuantity, removeFromCart, total } = useContext(CartContext);
  const nav = useNavigate();
  if (!items.length) return <div className="container"><h2>Cart</h2><p>Your cart is empty</p></div>;
  return (
    <div className="container">
      <h2>Your Cart</h2>
      {items.map(it=>(
        <div key={it.product.id} className="cart-row">
          <div>{it.product.name}</div>
          <div><input type="number" min="1" value={it.quantity} onChange={e=>updateQuantity(it.product.id, +e.target.value)} /></div>
          <div><button onClick={()=>removeFromCart(it.product.id)}>Remove</button></div>
        </div>
      ))}
      <h3>Total: ₱{total.toFixed(2)}</h3>
      <button onClick={()=>nav("/checkout")}>Proceed to Checkout</button>
    </div>
  );
}
