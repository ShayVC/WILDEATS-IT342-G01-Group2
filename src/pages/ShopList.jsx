// src/pages/ShopList.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";

export default function ShopList(){
  const [shops, setShops] = useState([]);
  useEffect(() => { api.get("/shops/").then(r=>setShops(r.data)).catch(()=>setShops([])); }, []);
  return (
    <div className="container">
      <h2>Shops</h2>
      <div className="grid">
        {shops.map(s => (
          <div key={s.id} className="card">
            <h4>{s.name}</h4>
            <p>{s.description}</p>
            <Link to={`/shop/${s.id}`}><button>View Menu</button></Link>
          </div>
        ))}
      </div>
    </div>
  );
}
