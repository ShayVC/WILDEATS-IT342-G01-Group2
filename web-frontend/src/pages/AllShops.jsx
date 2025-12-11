import React, { useEffect, useState } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import axios from "axios";

export default function AllShops() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/shops").then((res) => {
      setShops(res.data);
    });
  }, []);

  return (
    <SuperAdminLayout>
      <h1 className="text-2xl font-bold mb-4">All Shops</h1>

      <table className="w-full bg-white shadow mt-3 text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Owner</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>

        <tbody>
          {shops.map((s) => (
            <tr key={s.shopId}>
              <td className="p-2 border">{s.shopName}</td>
              <td className="p-2 border">{s.ownerName}</td>
              <td className="p-2 border">{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SuperAdminLayout>
  );
}
