// src/components/NotificationBell.tsx
import { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";
import { Bell } from "lucide-react";

interface Notification {
  notificationId: number;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    axios.get("/api/notifications/me").then((res) => {
      setItems(res.data as Notification[]);
    });
  }, []);

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-200"
      >
        <Bell size={24} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full px-1">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-72 bg-white shadow-xl rounded-lg p-4 z-50">
          <h3 className="font-semibold mb-2">Notifications</h3>

          {items.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications</p>
          ) : (
            items.map((n) => (
              <div key={n.notificationId} className="border-b py-2">
                <p className="text-sm">{n.message}</p>
                <span className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
