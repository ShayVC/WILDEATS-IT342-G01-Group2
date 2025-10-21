import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const OrderContext = createContext();

// Sample data for when the backend is not available
const SAMPLE_ORDERS = [
  {
    userID: 1,
    customerName: "John Doe",
    orderDate: "2025-05-05T08:30:00",
    totalPrice: 15.98,
    status: "COMPLETED",
    items: "Hamburger (x1), French Fries (x1), Soft Drink (x1)"
  },
  {
    userID: 2,
    customerName: "Jane Smith",
    orderDate: "2025-05-05T09:15:00",
    totalPrice: 12.49,
    status: "PREPARING",
    items: "Chicken Sandwich (x1), Onion Rings (x1), Iced Tea (x1)"
  },
  {
    userID: 3,
    customerName: "Michael Johnson",
    orderDate: "2025-05-05T10:00:00",
    totalPrice: 24.97,
    status: "READY",
    items: "Pizza Slice (x2), Caesar Salad (x1), Coffee (x2)"
  }
];

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(SAMPLE_ORDERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
      setError(null);
      setBackendAvailable(true);
    } catch (err) {
      // If backend is not available, use sample data
      if (err.message.includes('Network Error') || err.response?.status === 500) {
        setOrders(SAMPLE_ORDERS);
        setError('Backend server is not available. Using sample data.');
        toast.warning('Backend server is not available. Using sample data for demonstration purposes.');
        setBackendAvailable(false);
      } else {
        setError('Failed to fetch orders');
        toast.error('Failed to fetch orders');
      }
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single order by ID
  const fetchOrderById = useCallback(async (id) => {
    setLoading(true);
    try {
      if (!backendAvailable) {
        // Use sample data if backend is not available
        const order = SAMPLE_ORDERS.find(order => order.userID === parseInt(id));
        if (order) {
          setError(null);
          return order;
        } else {
          // Create a fallback order if ID wasn't found in sample data
          const fallbackOrder = {
            userID: parseInt(id),
            customerName: "Guest Customer",
            orderDate: new Date().toISOString(),
            totalPrice: 0,
            status: "PREPARING",
            items: "Unknown item"
          };
          toast.info('Order not found in sample data. Creating placeholder order.');
          return fallbackOrder;
        }
      }
      
      const response = await axios.get(`/api/orders/${id}`);
      setError(null);
      return response.data;
    } catch (err) {
      // If backend is not available but we haven't detected it yet
      if (err.message.includes('Network Error') || err.response?.status === 500) {
        setBackendAvailable(false);
        // Try to find in sample data
        const order = SAMPLE_ORDERS.find(order => order.userID === parseInt(id));
        if (order) {
          toast.warning('Backend server is not available. Using sample data for demonstration purposes.');
          return order;
        } else {
          // Create a fallback order if ID wasn't found
          const fallbackOrder = {
            userID: parseInt(id),
            customerName: "Guest Customer",
            orderDate: new Date().toISOString(),
            totalPrice: 0,
            status: "PREPARING",
            items: "Unknown item"
          };
          toast.info('Order not found. Creating placeholder order for demonstration.');
          return fallbackOrder;
        }
      }
      
      setError('Failed to fetch order details');
      toast.error('Failed to fetch order details');
      console.error('Error fetching order:', err);
      
      // Return a fallback order even when error occurs
      const fallbackOrder = {
        userID: parseInt(id),
        customerName: "Guest Customer",
        orderDate: new Date().toISOString(),
        totalPrice: 0,
        status: "PREPARING",
        items: "Unknown item"
      };
      return fallbackOrder;
    } finally {
      setLoading(false);
    }
  }, [backendAvailable]);

  // Create a new order
  const createOrder = useCallback(async (orderData) => {
    setLoading(true);
    try {
      if (!backendAvailable) {
        // Create a mock order if backend is not available
        const newOrder = {
          ...orderData,
          userID: SAMPLE_ORDERS.length + 1,
          orderDate: new Date().toISOString(),
          status: 'PREPARING'
        };
        
        setOrders(prevOrders => [...prevOrders, newOrder]);
        toast.success('Order created successfully! (Using sample data)');
        setError(null);
        return newOrder;
      }
      
      const response = await axios.post('/api/orders', orderData);
      setOrders(prevOrders => [...prevOrders, response.data]);
      toast.success('Order created successfully!');
      setError(null);
      return response.data;
    } catch (err) {
      // If backend is not available but we haven't detected it yet
      if (err.message.includes('Network Error') || err.response?.status === 500) {
        setBackendAvailable(false);
        // Create a mock order
        const newOrder = {
          ...orderData,
          userID: SAMPLE_ORDERS.length + 1,
          orderDate: new Date().toISOString(),
          status: 'PREPARING'
        };
        
        setOrders(prevOrders => [...prevOrders, newOrder]);
        toast.warning('Backend server is not available. Created order with sample data.');
        return newOrder;
      }
      
      setError('Failed to create order');
      toast.error('Failed to create order');
      console.error('Error creating order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [backendAvailable]);

  // Update an order
  const updateOrder = useCallback(async (id, orderData) => {
    setLoading(true);
    try {
      if (!backendAvailable) {
        // Update order in sample data if backend is not available
        const updatedOrder = { ...orderData, userID: parseInt(id) };
        
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.userID === parseInt(id) ? updatedOrder : order
          )
        );
        toast.success('Order updated successfully! (Using sample data)');
        setError(null);
        return updatedOrder;
      }
      
      const response = await axios.put(`/api/orders/${id}`, orderData);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.userID === parseInt(id) ? response.data : order
        )
      );
      toast.success('Order updated successfully!');
      setError(null);
      return response.data;
    } catch (err) {
      // If backend is not available but we haven't detected it yet
      if (err.message.includes('Network Error') || err.response?.status === 500) {
        setBackendAvailable(false);
        // Update in sample data
        const updatedOrder = { ...orderData, userID: parseInt(id) };
        
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.userID === parseInt(id) ? updatedOrder : order
          )
        );
        toast.warning('Backend server is not available. Updated order with sample data.');
        return updatedOrder;
      }
      
      setError('Failed to update order');
      toast.error('Failed to update order');
      console.error('Error updating order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [backendAvailable]);

  // Update order status
  const updateOrderStatus = useCallback(async (id, newStatus) => {
    setLoading(true);
    try {
      if (!backendAvailable) {
        // Update status in sample data if backend is not available
        let updatedOrder = null;
        
        setOrders(prevOrders => {
          const newOrders = prevOrders.map(order => {
            if (order.userID === parseInt(id)) {
              updatedOrder = { ...order, status: newStatus };
              return updatedOrder;
            }
            return order;
          });
          return newOrders;
        });
        
        toast.success(`Order status updated to ${newStatus} (Using sample data)`);
        setError(null);
        return updatedOrder;
      }
      
      const response = await axios.patch(`/api/orders/${id}/status`, newStatus);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.userID === parseInt(id) ? response.data : order
        )
      );
      toast.success(`Order status updated to ${newStatus}`);
      setError(null);
      return response.data;
    } catch (err) {
      // If backend is not available but we haven't detected it yet
      if (err.message.includes('Network Error') || err.response?.status === 500) {
        setBackendAvailable(false);
        // Update in sample data
        let updatedOrder = null;
        
        setOrders(prevOrders => {
          const newOrders = prevOrders.map(order => {
            if (order.userID === parseInt(id)) {
              updatedOrder = { ...order, status: newStatus };
              return updatedOrder;
            }
            return order;
          });
          return newOrders;
        });
        
        toast.warning('Backend server is not available. Updated order status with sample data.');
        return updatedOrder;
      }
      
      setError('Failed to update order status');
      toast.error('Failed to update order status');
      console.error('Error updating order status:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [backendAvailable]);

  // Delete an order
  const deleteOrder = useCallback(async (id) => {
    setLoading(true);
    try {
      if (!backendAvailable) {
        // Delete from sample data if backend is not available
        setOrders(prevOrders => prevOrders.filter(order => order.userID !== parseInt(id)));
        toast.success('Order deleted successfully! (Using sample data)');
        setError(null);
        return true;
      }
      
      await axios.delete(`/api/orders/${id}`);
      setOrders(prevOrders => prevOrders.filter(order => order.userID !== parseInt(id)));
      toast.success('Order deleted successfully!');
      setError(null);
      return true;
    } catch (err) {
      // If backend is not available but we haven't detected it yet
      if (err.message.includes('Network Error') || err.response?.status === 500) {
        setBackendAvailable(false);
        // Delete from sample data
        setOrders(prevOrders => prevOrders.filter(order => order.userID !== parseInt(id)));
        toast.warning('Backend server is not available. Deleted order from sample data.');
        return true;
      }
      
      setError('Failed to delete order');
      toast.error('Failed to delete order');
      console.error('Error deleting order:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [backendAvailable]);

  // Load orders on initial mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const contextValue = {
    orders,
    loading,
    error,
    backendAvailable,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder
  };

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
};
