import axios from 'axios';

const API_URL = 'http://localhost:8080/api/shop';

// Mock data for when the API is unavailable
const MOCK_SHOPS = [
  { shop_id: 1, shop_name: 'Coffee Corner', contact_info: 123456789 },
  { shop_id: 2, shop_name: 'Burger Palace', contact_info: 987654321 },
  { shop_id: 3, shop_name: 'Salad Bar', contact_info: 456789123 },
  { shop_id: 4, shop_name: 'Pizza Heaven', contact_info: 789123456 },
  { shop_id: 5, shop_name: 'Sushi Express', contact_info: 321654987 }
];

// Add a delay to simulate API response time
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAllShops = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shops:', error);
    // Return mock data
    await delay(500); // Simulate API delay
    return MOCK_SHOPS;
  }
};

export const getShopById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching shop with id ${id}:`, error);
    // Return mock data for the requested ID
    const mockShop = MOCK_SHOPS.find(shop => shop.shop_id === parseInt(id));
    if (mockShop) {
      await delay(300); // Simulate API delay
      return mockShop;
    }
    throw error;
  }
};

export const createShop = async (shopData) => {
  try {
    console.log('Sending shop data to API:', shopData);
    const response = await axios.post(`${API_URL}/createShop`, shopData);
    console.log('API response for shop creation:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating shop:', error);
    // Create a mock shop with a new ID and add it to the mock data
    const newId = Math.max(...MOCK_SHOPS.map(shop => shop.shop_id), 0) + 1;
    const newShop = { ...shopData, shop_id: newId };
    MOCK_SHOPS.push(newShop); // Add to mock data array for future reference
    console.log('Created mock shop:', newShop);
    await delay(500); // Simulate API delay
    return newShop;
  }
};

export const updateShop = async (id, shopData) => {
  try {
    console.log(`Updating shop with id ${id}:`, shopData);
    const response = await axios.put(`${API_URL}/updateShop/${id}`, shopData);
    console.log('API response for shop update:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating shop with id ${id}:`, error);
    // Update the shop in the mock data array
    const shopIndex = MOCK_SHOPS.findIndex(shop => shop.shop_id === parseInt(id));
    const updatedShop = { ...shopData, shop_id: parseInt(id) };
    
    if (shopIndex !== -1) {
      MOCK_SHOPS[shopIndex] = updatedShop;
      console.log('Updated mock shop:', updatedShop);
    }
    
    await delay(500); // Simulate API delay
    return updatedShop;
  }
};

export const deleteShop = async (id) => {
  try {
    console.log(`Deleting shop with id ${id}`);
    await axios.delete(`${API_URL}/deleteShop/${id}`);
    console.log(`Shop with id ${id} deleted successfully`);
    return true;
  } catch (error) {
    console.error(`Error deleting shop with id ${id}:`, error);
    // Remove the shop from the mock data array
    const shopIndex = MOCK_SHOPS.findIndex(shop => shop.shop_id === parseInt(id));
    
    if (shopIndex !== -1) {
      MOCK_SHOPS.splice(shopIndex, 1);
      console.log(`Removed shop with id ${id} from mock data`);
    }
    
    await delay(500); // Simulate API delay
    return true;
  }
};
