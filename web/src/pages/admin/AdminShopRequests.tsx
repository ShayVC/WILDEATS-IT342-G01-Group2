import { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";

type ShopStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "CLOSED";

interface AdminShop {
  shopId: number;
  shopName: string;
  shopDescr?: string;
  location: string;
  ownerName?: string;
  status: ShopStatus;
  createdAt?: string;
}

export default function AdminShopRequests() {
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get<AdminShop[]>("/api/shops/admin/all");
      const allShops = res.data;
      const pending = allShops.filter((s) => s.status === "PENDING");
      setShops(pending);
    } catch (err) {
      console.error("Failed to load shop requests", err);
      toast.error("Failed to load shop requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (shopId: number) => {
    try {
      setActionId(shopId);
      await axios.put(`/api/shops/${shopId}/approve`);
      toast.success("Shop approved and seller role granted");
      setShops((prev) => prev.filter((s) => s.shopId !== shopId));
    } catch (err) {
      console.error("Error approving shop", err);
      toast.error("Failed to approve shop");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (shopId: number) => {
    const confirmed = window.confirm(
      "Reject this shop application? The owner will be notified."
    );
    if (!confirmed) return;

    try {
      setActionId(shopId);
      await axios.put(`/api/shops/${shopId}/reject`);
      toast.info("Shop application rejected");
      setShops((prev) => prev.filter((s) => s.shopId !== shopId));
    } catch (err) {
      console.error("Error rejecting shop", err);
      toast.error("Failed to reject shop");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Shop Requests</h1>
          <p className="text-sm text-gray-500">
            Review new partner applications submitted by students and staff.
          </p>
        </div>

        <button
          onClick={loadRequests}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-40" />
                <div className="h-3 bg-gray-200 rounded w-64" />
                <div className="h-3 bg-gray-200 rounded w-32" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-20 bg-gray-200 rounded-full" />
                <div className="h-9 w-20 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : shops.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-lg font-semibold text-gray-700">
            No pending shop requests
          </p>
          <p className="text-sm text-gray-500 mt-1">
            New shop applications will appear here for your review.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4 divide-y">
          {shops.map((shop) => (
            <div
              key={shop.shopId}
              className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {shop.shopName}{" "}
                  <span className="text-xs text-gray-500">
                    · {shop.location}
                  </span>
                </p>
                {shop.shopDescr && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {shop.shopDescr}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Owner: {shop.ownerName ?? "Unknown"}
                  {shop.createdAt && (
                    <> · Applied {new Date(shop.createdAt).toLocaleString()}</>
                  )}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(shop.shopId)}
                  disabled={actionId === shop.shopId}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {actionId === shop.shopId ? "Approving..." : "Approve"}
                </button>

                <button
                  onClick={() => handleReject(shop.shopId)}
                  disabled={actionId === shop.shopId}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-red-500 text-white text-xs font-medium hover:bg-red-600 disabled:opacity-60"
                >
                  <XCircle className="w-4 h-4" />
                  {actionId === shop.shopId ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
