import React from "react";

export default function ShopApprovalTable({ shops, onApprove, onReject }) {
  return (
    <table className="w-full border mt-4 bg-white shadow">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">Shop Name</th>
          <th className="p-2 border">Owner</th>
          <th className="p-2 border">Submitted At</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>

      <tbody>
        {shops.length === 0 && (
          <tr>
            <td colSpan={4} className="text-center p-4">
              No pending requests
            </td>
          </tr>
        )}

        {shops.map((shop) => (
          <tr key={shop.shopId}>
            <td className="border p-2">{shop.shopName}</td>
            <td className="border p-2">{shop.ownerName}</td>
            <td className="border p-2">
              {new Date(shop.createdAt).toLocaleString()}
            </td>
            <td className="border p-2 flex gap-2">
              <button
                className="bg-green-500 text-white px-3 py-1 rounded"
                onClick={() => onApprove(shop.shopId)}
              >
                Approve
              </button>

              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => onReject(shop.shopId)}
              >
                Reject
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
