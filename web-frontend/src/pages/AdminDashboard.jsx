import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext.jsx';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { getPendingShops, approveShop } = useAuth();
    const [pendingShops, setPendingShops] = useState([]);

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const shops = await getPendingShops();
                setPendingShops(shops);
            } catch (err) {
                toast.error('Failed to load pending shops.');
            }
        };
        fetchShops();
    }, [getPendingShops]);

    const handleApprove = async (shopId) => {
        try {
            await approveShop(shopId);
            toast.success('Shop approved successfully!');
            setPendingShops(prev => prev.filter(shop => shop.id !== shopId));
        } catch (err) {
            toast.error('Approval failed. Please try again.');
        }
    };

    return (
        <div className="admin-dashboard">
            <h1 className="form-header">Admin Dashboard</h1>
            <p className="dashboard-subtext">Review and approve pending shop applications.</p>

            {pendingShops.length === 0 ? (
                <p className="no-shops">No pending shops at the moment.</p>
            ) : (
                <ul className="shop-list">
                    {pendingShops.map(shop => (
                        <li key={shop.id} className="shop-item">
                            <div>
                                <strong>{shop.name}</strong> — {shop.description}
                            </div>
                            <button
                                className="approve-button"
                                onClick={() => handleApprove(shop.id)}
                            >
                                Approve
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminDashboard;

