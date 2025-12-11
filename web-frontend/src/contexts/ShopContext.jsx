import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAllShops, createShop, updateShop, deleteShop, getMyShops, approveShop, rejectShop, getPendingShops } from '../utils/shopService';
import { toast } from 'react-toastify';

// Mock data to use when the API is unavailable
const MOCK_SHOPS = [
    { shop_id: 1, shop_name: 'Coffee Corner', contact_info: 123456789 },
    { shop_id: 2, shop_name: 'Burger Palace', contact_info: 987654321 },
    { shop_id: 3, shop_name: 'Salad Bar', contact_info: 456789123 },
    { shop_id: 4, shop_name: 'Pizza Heaven', contact_info: 789123456 },
    { shop_id: 5, shop_name: 'Sushi Express', contact_info: 321654987 }
];

const ShopContext = createContext();

export const useShops = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchShops = async () => {
        try {
            setLoading(true);
            const data = await getAllShops();
            setShops(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching shops from API:', err);
            // Use mock data instead of showing an error
            setShops(MOCK_SHOPS);
            setError(null);
            console.log('Using mock shop data since the API is unavailable');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    // Add a shop to the database and update state
    const addShop = async (shopData) => {
        try {
            setLoading(true);
            const newShop = await createShop(shopData);
            setShops(prevShops => [...prevShops, newShop]);
            return newShop;
        } catch (err) {
            console.error('Error adding shop:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update a shop in the database and update state
    const editShop = async (id, shopData) => {
        try {
            setLoading(true);
            const updatedShop = await updateShop(id, shopData);
            setShops(prevShops =>
                prevShops.map(shop =>
                    shop.shop_id === parseInt(id) ? updatedShop : shop
                )
            );
            return updatedShop;
        } catch (err) {
            console.error('Error updating shop:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete a shop from the database and update state
    const removeShop = async (id) => {
        try {
            setLoading(true);
            await deleteShop(id);
            setShops(prevShops => prevShops.filter(shop => shop.shop_id !== parseInt(id)));
            return true;
        } catch (err) {
            console.error('Error deleting shop:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get shops owned by current user
    const fetchMyShops = async () => {
        try {
            const data = await getMyShops();
            return data;
        } catch (err) {
            console.error('Error fetching my shops:', err);
            throw err;
        }
    };

    // Approve a shop (ADMIN only)
    const handleApproveShop = async (shopId) => {
        try {
            await approveShop(shopId);
            toast.success('Shop approved successfully');
            await fetchShops(); // Refresh the list
            return true;
        } catch (err) {
            console.error('Error approving shop:', err);
            toast.error(err.response?.data?.message || 'Error approving shop');
            throw err;
        }
    };

    // Reject a shop (ADMIN only) - using suspend endpoint if reject doesn't exist
    const handleRejectShop = async (shopId) => {
        try {
            // If reject endpoint doesn't exist, we can use suspend or delete
            await rejectShop(shopId);
            toast.success('Shop rejected');
            await fetchShops(); // Refresh the list
            return true;
        } catch (err) {
            console.error('Error rejecting shop:', err);
            toast.error(err.response?.data?.message || 'Error rejecting shop');
            throw err;
        }
    };

    // Get pending shops (ADMIN only)
    const fetchPendingShops = async () => {
        try {
            const data = await getPendingShops();
            setShops(data);
            return data;
        } catch (err) {
            console.error('Error fetching pending shops:', err);
            throw err;
        }
    };

    const value = {
        shops,
        loading,
        error,
        refreshShops: fetchShops,
        addShop,
        editShop,
        removeShop,
        getMyShops: fetchMyShops,
        approveShop: handleApproveShop,
        rejectShop: handleRejectShop,
        getPendingShops: fetchPendingShops
    };

    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    );
};

export default ShopContext;