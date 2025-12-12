import { useEffect, useState } from "react";
import axios from "axios";

interface ShopApplication {
  shopId: number;
  shopName: string;
  status: string;
}

const SellerShopStatus = () => {
  const [apps, setApps] = useState<ShopApplication[]>([]);
  const API = "http://localhost:8080/api";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get<ShopApplication[]>(
          `${API}/shops/my-applications`
        );
        setApps(res.data);
      } catch (err) {
        console.error("Failed to load applications", err);
      }
    };

    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Your Shop Applications</h1>

      {apps.map((app) => (
        <div
          key={app.shopId}
          className="bg-white shadow-sm p-3 rounded border mb-3"
        >
          <h3 className="font-medium">{app.shopName}</h3>
          <p className="text-sm text-gray-600">Status: {app.status}</p>
        </div>
      ))}
    </div>
  );
};

export default SellerShopStatus;
