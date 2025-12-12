import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Clock, ShoppingBag } from "lucide-react";

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/");
    return null;
  }

  // Placeholder list; replace with real data later
  const orders: any[] = [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Your Orders
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-fp-pink/10 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-fp-pink" />
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-2">
              You haven’t ordered yet
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Once you place an order, it will appear here so you can track it easily.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2 rounded-full bg-fp-pink text-white text-sm font-medium hover:bg-fp-pink/90"
            >
              Browse meals
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm p-4 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {order.shopName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.itemsSummary}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{order.createdAt}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">₱{order.total}</p>
                  <p className="text-xs text-fp-pink font-medium">
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;
