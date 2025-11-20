import React from "react";

export default function ProductCard({ product, onAdd }) {
  return (
    <div className="product-card">
      <img src={product.image || "/assets/react.svg"} alt={product.name} />
      <h4>{product.name}</h4>
      <div className="row">
        <strong>₱{(product.price||0).toFixed(2)}</strong>
        <button onClick={() => onAdd(product)}>Add</button>
      </div>
    </div>
  );
}
