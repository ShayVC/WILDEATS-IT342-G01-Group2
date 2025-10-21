import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = 'http://localhost:8080/api/orders';

// Get all orders for the current user (customer or seller)
export const getMyOrders = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/my-orders`, {
      params: { userId },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching my orders:', error);
    throw error;
  }
};

// Get orders for a specific shop (for sellers only)
export const getOrdersByShop = async (shopId, userId) => {
  try {
    const response = await axios.get(`${API_URL}/shop/${shopId}`, {
      params: { userId },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching orders for shop ${shopId}:`, error);
    throw error;
  }
};

// Get orders with a specific status for a shop (for sellers only)
export const getOrdersByShopAndStatus = async (shopId, status, userId) => {
  try {
    const response = await axios.get(`${API_URL}/shop/${shopId}/status/${status}`, {
      params: { userId },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${status} orders for shop ${shopId}:`, error);
    throw error;
  }
};

// Get a specific order by ID
export const getOrderById = async (orderId, userId) => {
  try {
    const response = await axios.get(`${API_URL}/${orderId}`, {
      params: { userId },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

// Create a new order (for customers only)
export const createOrder = async (orderData, userId) => {
  try {
    const response = await axios.post(API_URL, orderData, {
      params: { userId },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Update the status of an order
export const updateOrderStatus = async (orderId, status, userId) => {
  try {
    const response = await axios.put(`${API_URL}/${orderId}/status`, 
      { status },
      {
        params: { userId },
        headers: getAuthHeader()
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error;
  }
};
