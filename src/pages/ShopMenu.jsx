// src/pages/ShopMenu.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { CartContext } from "../context/CartContext";

export default function ShopMenu(){
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    api.get(`/shops/${id}/menu/`).then(r=>setProducts(r.data)).catch(()=>setProducts([]));
  }, [id]);

  return (
    <div className="container">
      <h2>Menu</h2>
      <div className="grid">
        {products.map(p=>(
          <div key={p.id} className="card">
            <h4>{p.name}</h4>
            <p>₱{(p.price||0).toFixed(2)}</p>
            <button onClick={()=>addToCart(p,1)}>Add</button>
          </div>
        ))}
      </div>
    </div>
  );
}
