import axios from 'axios';
import { getAuthHeader } from './authService';

// Mock data for when the backend is not available
let MOCK_FOOD_ITEMS = localStorage.getItem('mockFoodItems') ? 
  JSON.parse(localStorage.getItem('mockFoodItems')) : [
  {
    id: 1,
    name: 'Chicken Burger',
    description: 'Delicious chicken burger with fresh vegetables',
    price: 5.99,
    quantity: 50,
    available: true,
    shop_id: 1
  },
  {
    id: 2,
    name: 'French Fries',
    description: 'Crispy golden french fries',
    price: 2.99,
    quantity: 100,
    available: true,
    shop_id: 1
  },
  {
    id: 3,
    name: 'Coca Cola',
    description: 'Refreshing cola drink',
    price: 1.99,
    quantity: 200,
    available: true,
    shop_id: 1
  }
];

// Save mock data to localStorage
const saveMockFoodItems = () => {
  localStorage.setItem('mockFoodItems', JSON.stringify(MOCK_FOOD_ITEMS));
};

const API_URL = 'http://localhost:8080/api/food';

// Get all food items
export const getAllFoodItems = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching food items:', error);
    
    // Return mock data if backend is unavailable
    console.log('Using mock food items data');
    return MOCK_FOOD_ITEMS;
  }
};

// Get food items by shop ID
export const getFoodItemsByShop = async (shopId) => {
  try {
    const response = await axios.get(`${API_URL}/shop/${shopId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching food items for shop ${shopId}:`, error);
    
    // Return mock data filtered by shop ID if backend is unavailable
    console.log(`Using mock food items data for shop ${shopId}`);
    return MOCK_FOOD_ITEMS.filter(item => item.shop_id === parseInt(shopId));
  }
};

// Get a food item by ID
export const getFoodItemById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching food item ${id}:`, error);
    
    // Return mock food item by ID if backend is unavailable
    console.log(`Using mock food item data for ID ${id}`);
    const mockItem = MOCK_FOOD_ITEMS.find(item => item.id === parseInt(id));
    if (!mockItem) throw new Error(`Food item with ID ${id} not found`);
    return mockItem;
  }
};

// Create a new food item (for sellers only)
export const createFoodItem = async (foodItemData, shopId, userId) => {
  try {
    const response = await axios.post(API_URL, foodItemData, {
      params: { shopId, userId },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating food item:', error);
    
    // Create mock food item if backend is unavailable
    console.log('Creating mock food item');
    const newId = Math.max(...MOCK_FOOD_ITEMS.map(item => item.id), 0) + 1;
    
    const newFoodItem = {
      id: newId,
      name: foodItemData.name,
      description: foodItemData.description || '',
      price: parseFloat(foodItemData.price) || 0,
      quantity: parseInt(foodItemData.quantity) || 0,
      available: foodItemData.available !== false,
      shop_id: parseInt(shopId)
    };
    
    MOCK_FOOD_ITEMS.push(newFoodItem);
    saveMockFoodItems();
    
    return newFoodItem;
  }
};

// Update a food item (for sellers only)
export const updateFoodItem = async (id, foodItemData, userId) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, foodItemData, {
      params: { userId },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating food item ${id}:`, error);
    
    // Update mock food item if backend is unavailable
    console.log(`Updating mock food item with ID ${id}`);
    const index = MOCK_FOOD_ITEMS.findIndex(item => item.id === parseInt(id));
    
    if (index === -1) throw new Error(`Food item with ID ${id} not found`);
    
    // Update the food item
    MOCK_FOOD_ITEMS[index] = {
      ...MOCK_FOOD_ITEMS[index],
      name: foodItemData.name || MOCK_FOOD_ITEMS[index].name,
      description: foodItemData.description || MOCK_FOOD_ITEMS[index].description,
      price: parseFloat(foodItemData.price) || MOCK_FOOD_ITEMS[index].price,
      quantity: parseInt(foodItemData.quantity) || MOCK_FOOD_ITEMS[index].quantity,
      available: foodItemData.available !== undefined ? foodItemData.available : MOCK_FOOD_ITEMS[index].available
    };
    
    saveMockFoodItems();
    return MOCK_FOOD_ITEMS[index];
  }
};

// Delete a food item (for sellers only)
export const deleteFoodItem = async (id, userId) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      params: { userId },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting food item ${id}:`, error);
    
    // Delete mock food item if backend is unavailable
    console.log(`Deleting mock food item with ID ${id}`);
    const index = MOCK_FOOD_ITEMS.findIndex(item => item.id === parseInt(id));
    
    if (index === -1) throw new Error(`Food item with ID ${id} not found`);
    
    // Remove the food item
    const deletedItem = MOCK_FOOD_ITEMS[index];
    MOCK_FOOD_ITEMS = MOCK_FOOD_ITEMS.filter(item => item.id !== parseInt(id));
    
    saveMockFoodItems();
    return { message: 'Food item deleted successfully', deletedItem };
  }
};

// Update food item availability (for sellers only)
export const updateFoodItemAvailability = async (id, available, userId) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/availability`, 
      { available },
      {
        params: { userId },
        headers: getAuthHeader()
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating food item ${id} availability:`, error);
    
    // Update mock food item availability if backend is unavailable
    console.log(`Updating mock food item availability for ID ${id}`);
    const index = MOCK_FOOD_ITEMS.findIndex(item => item.id === parseInt(id));
    
    if (index === -1) throw new Error(`Food item with ID ${id} not found`);
    
    // Update availability
    MOCK_FOOD_ITEMS[index].available = available;
    
    saveMockFoodItems();
    return MOCK_FOOD_ITEMS[index];
  }
};

// Mock order-related functions

// Get my orders (for customers)
export const getMyOrders = async (userId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/orders/my-orders`, {
      params: { userId },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching my orders:`, error);
    
    // Return mock orders if backend is unavailable
    console.log('Using mock orders data');
    const mockOrders = localStorage.getItem('mockOrders') ? 
      JSON.parse(localStorage.getItem('mockOrders')) : [];
    
    return mockOrders.filter(order => order.customer_id === parseInt(userId));
  }
};

// Place a new order (for customers)
export const placeOrder = async (orderData) => {
  try {
    const response = await axios.post(`http://localhost:8080/api/orders`, orderData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error);
    
    // Create mock order if backend is unavailable
    console.log('Creating mock order');
    
    // Get existing orders or initialize empty array
    const mockOrders = localStorage.getItem('mockOrders') ? 
      JSON.parse(localStorage.getItem('mockOrders')) : [];
    
    const newOrderId = mockOrders.length > 0 ? 
      Math.max(...mockOrders.map(order => order.id)) + 1 : 1;
    
    const newOrder = {
      id: newOrderId,
      customer_id: orderData.customer_id,
      shop_id: orderData.shop_id,
      items: orderData.items,
      total_price: orderData.total_price,
      status: 'PENDING',
      created_at: new Date().toISOString()
    };
    
    mockOrders.push(newOrder);
    localStorage.setItem('mockOrders', JSON.stringify(mockOrders));
    
    // Update food item quantities
    orderData.items.forEach(item => {
      const foodItem = MOCK_FOOD_ITEMS.find(food => food.id === item.food_id);
      if (foodItem) {
        foodItem.quantity = Math.max(0, foodItem.quantity - item.quantity);
      }
    });
    saveMockFoodItems();
    
    return newOrder;
  }
};

// Get shop orders (for sellers)
export const getShopOrders = async (shopId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/orders/shop/${shopId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching shop orders:`, error);
    
    // Return mock orders for shop if backend is unavailable
    console.log(`Using mock orders data for shop ${shopId}`);
    const mockOrders = localStorage.getItem('mockOrders') ? 
      JSON.parse(localStorage.getItem('mockOrders')) : [];
    
    return mockOrders.filter(order => order.shop_id === parseInt(shopId));
  }
};

// Update order status (for sellers)
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/orders/${orderId}/status`, 
      { status },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating order status:`, error);
    
    // Update mock order status if backend is unavailable
    console.log(`Updating mock order status for ID ${orderId}`);
    
    const mockOrders = localStorage.getItem('mockOrders') ? 
      JSON.parse(localStorage.getItem('mockOrders')) : [];
    
    const index = mockOrders.findIndex(order => order.id === parseInt(orderId));
    
    if (index === -1) throw new Error(`Order with ID ${orderId} not found`);
    
    mockOrders[index].status = status;
    localStorage.setItem('mockOrders', JSON.stringify(mockOrders));
    
    return mockOrders[index];
  }
};
