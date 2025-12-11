import React from "react";

export default function StatsCard({ label, value }) {
  return (
    <div className="bg-white shadow rounded-xl p-5">
      <p className="text-gray-500 text-sm">{label}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
}
