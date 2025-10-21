import axios from 'axios';

const API_URL = 'http://localhost:8080/api/users';

// Mock data for when the API is unavailable
const MOCK_USERS = [
  { userId: 1, name: 'John Doe', email: 'john.doe@example.com', password: '********' },
  { userId: 2, name: 'Jane Smith', email: 'jane.smith@example.com', password: '********' },
  { userId: 3, name: 'Michael Johnson', email: 'michael.johnson@example.com', password: '********' },
  { userId: 4, name: 'Emily Davis', email: 'emily.davis@example.com', password: '********' },
  { userId: 5, name: 'Robert Wilson', email: 'robert.wilson@example.com', password: '********' }
];

// Add a delay to simulate API response time
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/getAllUsers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return mock data
    await delay(500); // Simulate API delay
    return MOCK_USERS;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    // Return mock data for the requested ID
    const mockUser = MOCK_USERS.find(user => user.userId === parseInt(id));
    if (mockUser) {
      await delay(300); // Simulate API delay
      return mockUser;
    }
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    console.log('Sending user data to API:', userData);
    const response = await axios.post(`${API_URL}/createUser`, userData);
    console.log('API response for user creation:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    // Create a mock user with a new ID and add it to the mock data
    const newId = Math.max(...MOCK_USERS.map(user => user.userId), 0) + 1;
    const newUser = { ...userData, userId: newId };
    MOCK_USERS.push(newUser); // Add to mock data array for future reference
    console.log('Created mock user:', newUser);
    await delay(500); // Simulate API delay
    return newUser;
  }
};

export const updateUser = async (id, userData) => {
  try {
    console.log(`Updating user with id ${id}:`, userData);
    const response = await axios.put(`${API_URL}/${id}`, userData);
    console.log('API response for user update:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    // Update the user in the mock data array
    const userIndex = MOCK_USERS.findIndex(user => user.userId === parseInt(id));
    const updatedUser = { ...userData, userId: parseInt(id) };
    
    if (userIndex !== -1) {
      MOCK_USERS[userIndex] = updatedUser;
      console.log('Updated mock user:', updatedUser);
    }
    
    await delay(500); // Simulate API delay
    return updatedUser;
  }
};

export const deleteUser = async (id) => {
  try {
    console.log(`Deleting user with id ${id}`);
    await axios.delete(`${API_URL}/${id}`);
    console.log(`User with id ${id} deleted successfully`);
    return true;
  } catch (error) {
    console.error(`Error deleting user with id ${id}:`, error);
    // Remove the user from the mock data array
    const userIndex = MOCK_USERS.findIndex(user => user.userId === parseInt(id));
    
    if (userIndex !== -1) {
      MOCK_USERS.splice(userIndex, 1);
      console.log(`Removed user with id ${id} from mock data`);
    }
    
    await delay(500); // Simulate API delay
    return true;
  }
};
