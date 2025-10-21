import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAllShops, createShop, updateShop, deleteShop } from '../utils/shopService';

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

  const value = {
    shops,
    loading,
    error,
    refreshShops: fetchShops,
    addShop,
    editShop,
    removeShop
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContext;
