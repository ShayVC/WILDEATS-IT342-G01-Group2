import { useEffect, useMemo, useState } from "react";
import axios from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import { Filter, RefreshCw } from "lucide-react";

type ShopStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "CLOSED";

interface AdminShop {
  shopId: number;
  shopName: string;
  shopDescr?: string;
  location: string;
  status: ShopStatus;
  isOpen: boolean;
  ownerName?: string;
  createdAt?: string;
}

const STATUS_OPTIONS: (ShopStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "CLOSED",
];


export default function AdminShopManagement() {
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShopStatus | "ALL">("ALL");
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadShops = async () => {
    try {
      setLoading(true);
      const res = await axios.get<AdminShop[]>("/api/shops/admin/all");
      setShops(res.data);
    } catch (err) {
      console.error("Failed to load shops", err);
      toast.error("Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const matchesSearch = shop.shopName
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ? true : shop.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [shops, search, statusFilter]);

  const handleApprove = async (shopId: number) => {
    try {
      setBusyId(shopId);
      await axios.put(`/api/shops/${shopId}/approve`);
      toast.success("Shop approved");
      await loadShops();
    } catch (err) {
      console.error("Approve error", err);
      toast.error("Failed to approve shop");
    } finally {
      setBusyId(null);
    }
  };

  const handleSuspend = async (shopId: number) => {
    try {
      setBusyId(shopId);
      await axios.put(`/api/shops/${shopId}/suspend`);
      toast.info("Shop suspended");
      await loadShops();
    } catch (err) {
      console.error("Suspend error", err);
      toast.error("Failed to suspend shop");
    } finally {
      setBusyId(null);
    }
  };

  const handleClose = async (shopId: number) => {
    const ok = window.confirm(
      "Close this shop permanently? This cannot be undone."
    );
    if (!ok) return;

    try {
      setBusyId(shopId);
      await axios.put(`/api/shops/${shopId}/close`);
      toast.warn("Shop closed");
      await loadShops();
    } catch (err) {
      console.error("Close error", err);
      toast.error("Failed to close shop");
    } finally {
      setBusyId(null);
    }
  };

  const statusBadgeClass = (status: ShopStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700";
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700";
      case "SUSPENDED":
        return "bg-red-100 text-red-700";
      case "CLOSED":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Shops</h1>
          <p className="text-sm text-gray-500">
            Approve, suspend, or close partner shops in the marketplace.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by shop name"
              className="pl-9 pr-3 py-2 rounded-full border text-sm w-56"
            />
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ShopStatus | "ALL")}
            className="px-3 py-2 rounded-full border text-sm bg-white"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "All statuses" : s}
              </option>
            ))}
          </select>

          <button
            onClick={loadShops}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full border text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Shop
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Location
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Owner
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    Loading shops…
                  </td>
                </tr>
              ) : filteredShops.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No shops match your filters.
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => (
                  <tr key={shop.shopId} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {shop.shopName}
                      </div>
                      {shop.shopDescr && (
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {shop.shopDescr}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{shop.location}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {shop.ownerName ?? "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " +
                          statusBadgeClass(shop.status)
                        }
                      >
                        {shop.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {shop.status === "PENDING" && (
                        <button
                          onClick={() => handleApprove(shop.shopId)}
                          disabled={busyId === shop.shopId}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs hover:bg-emerald-600 disabled:opacity-60"
                        >
                          {busyId === shop.shopId ? "..." : "Approve"}
                        </button>
                      )}

                      {shop.status === "ACTIVE" && (
                        <button
                          onClick={() => handleSuspend(shop.shopId)}
                          disabled={busyId === shop.shopId}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs hover:bg-amber-600 disabled:opacity-60"
                        >
                          {busyId === shop.shopId ? "..." : "Suspend"}
                        </button>
                      )}

                      {(shop.status === "PENDING" ||
                        shop.status === "ACTIVE" ||
                        shop.status === "SUSPENDED") && (
                        <button
                          onClick={() => handleClose(shop.shopId)}
                          disabled={busyId === shop.shopId}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 disabled:opacity-60"
                        >
                          {busyId === shop.shopId ? "..." : "Close"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
