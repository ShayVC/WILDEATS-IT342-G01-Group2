import React, { useEffect } from "react";
import { useShops } from "../contexts/ShopContext";

const SuperAdminDashboard = () => {
    const { shops, loading, error, approveShop, rejectShop, getPendingShops } = useShops();

    useEffect(() => {
        const loadPendingShops = async () => {
            try {
                await getPendingShops();
            } catch (err) {
                console.error('Error loading pending shops:', err);
            }
        };
        loadPendingShops();
    }, []);

    if (loading) return <p>Loading shop requests...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h2>Pending Shop Registrations</h2>

            <table border="1" width="100%" cellPadding="10">
                <thead>
                    <tr>
                        <th>Shop Name</th>
                        <th>Owner</th>
                        <th>Email</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {shops.length === 0 ? (
                        <tr>
                            <td colSpan="5" align="center">No pending shop requests.</td>
                        </tr>
                    ) : (
                        shops.map((shop) => (
                            <tr key={shop.shopId || shop.id}>
                                <td>{shop.shopName || shop.name}</td>
                                <td>{shop.ownerName || shop.owner}</td>
                                <td>{shop.ownerEmail || shop.email || 'N/A'}</td>
                                <td>{shop.createdAt ? new Date(shop.createdAt).toLocaleString() : 'N/A'}</td>

                                <td>
                                    <button onClick={() => approveShop(shop.shopId || shop.id)}>
                                        Approve
                                    </button>

                                    <button
                                        style={{ marginLeft: "10px", color: "red" }}
                                        onClick={() => rejectShop(shop.shopId || shop.id)}
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default SuperAdminDashboard;
