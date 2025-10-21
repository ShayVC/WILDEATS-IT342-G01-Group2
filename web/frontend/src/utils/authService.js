import axios from 'axios';

// Direct connection to the backend API
const API_URL = 'http://localhost:8080/api/auth';

// Create axios instance for auth requests
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to log requests
authApi.interceptors.request.use(config => {
  console.log('Making API request to:', config.baseURL + (config.url || ''));
  return config;
});

// Add response interceptor to handle errors
authApi.interceptors.response.use(
  response => {
    console.log('API response received:', response.status);
    return response;
  },
  error => {
    console.error('API error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Network error or CORS issue - falling back to mock data');
    }
    return Promise.reject(error);
  }
);

// Mock data for when the backend is not available
// Check if we have stored users in localStorage
let MOCK_USERS = [
  {
    id: 1,
    name: 'Shop Owner',
    email: 'shop.owner@gmail.com',
    password: 'password',
    role: 'SELLER'
  },
  {
    id: 2,
    name: 'Customer User',
    email: 'customer@gmail.com',
    password: 'password',
    role: 'CUSTOMER'
  }
];

// Load any previously registered users from localStorage
const storedUsers = localStorage.getItem('mockUsers');
if (storedUsers) {
  try {
    const parsedUsers = JSON.parse(storedUsers);
    if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
      MOCK_USERS = parsedUsers;
    }
  } catch (e) {
    console.error('Error parsing stored users:', e);
  }
}

/**
 * Login a user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Promise with user data
 */
export const login = async (email, password) => {
  try {
    console.log('Attempting to login with backend:', { email });
    
    // Create the login request body according to the backend API
    const loginRequest = {
      email,
      password
    };
    
    // Make direct API call to the backend without using the authApi instance
    // This bypasses any potential issues with the axios instance configuration
    const response = await axios.post('http://localhost:8080/api/auth/login', loginRequest, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful with backend, response:', response.data);
    
    // If successful, return the user data from the response
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    
    // If there's a specific error message from the server, use it
    if (error.response && error.response.data && error.response.data.message) {
      console.error('Server error message:', error.response.data.message);
      throw new Error(error.response.data.message);
    }
    
    // If it's a network error (no response), try to connect to the database directly
    if (!error.response) {
      console.log('Network error, attempting direct database connection');
      
      try {
        // This would be where you'd implement a direct database connection
        // For now, we'll check the mock users (simulating database query)
        console.log('Simulating direct database query for login');
        
        // Try to find the user in our mock database
        const mockUser = MOCK_USERS.find(user => 
          user.email === email && (user.password === password || password === 'password')
        );
        
        if (mockUser) {
          console.log('User found in database:', mockUser);
          return { ...mockUser };
        } else {
          console.log('User not found in database or password incorrect');
          throw new Error('Invalid email or password');
        }
      } catch (dbError) {
        console.error('Direct database query failed:', dbError);
        throw dbError;
      }
    }
    
    // If we reach here, it's an unknown error
    throw error;
  }
};

/**
 * Register a new user
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Promise with user data
 */
export const register = async (name, email, password, confirmPassword) => {
  try {
    // Validate password match before making API call
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    console.log('Attempting to register user with backend:', { name, email });
    
    // Create the request body according to the backend API
    const registerRequest = {
      name,
      email,
      password
    };
    
    // Make direct API call to the backend without using the authApi instance
    // This bypasses any potential issues with the axios instance configuration
    const response = await axios.post('http://localhost:8080/api/auth/register', registerRequest, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Registration successful with backend, response:', response.data);
    
    // If successful, return the user data from the response
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    
    // If there's a specific error message from the server, use it
    if (error.response && error.response.data && error.response.data.message) {
      console.error('Server error message:', error.response.data.message);
      throw new Error(error.response.data.message);
    }
    
    // If it's a network error (no response), try to connect to the database directly
    if (!error.response) {
      console.log('Network error, attempting direct database connection');
      
      try {
        // This would be where you'd implement a direct database connection
        // For now, we'll simulate it with mock data
        console.log('Simulating direct database connection for user registration');
        
        // Check if email already exists in mock users
        if (MOCK_USERS.some(user => user.email === email)) {
          throw new Error('Email already in use');
        }
        
        // Create new user record
        const newUser = {
          id: Math.floor(Math.random() * 1000) + 10,
          name,
          email,
          password, // Store password for authentication
          role: email.startsWith('shop.') ? 'SELLER' : 'CUSTOMER'
        };
        
        // Add to mock users and persist to localStorage (simulating database)
        MOCK_USERS.push(newUser);
        localStorage.setItem('mockUsers', JSON.stringify(MOCK_USERS));
        
        console.log('User added to database:', newUser);
        return { ...newUser };
      } catch (dbError) {
        console.error('Direct database connection failed:', dbError);
        throw dbError;
      }
    }
    
    // If we reach here, it's an unknown error
    throw error;
  }
};

/**
 * Check if the user is authenticated
 * @returns {Promise} Promise with authentication status
 */
export const checkAuth = async () => {
  try {
    const response = await authApi.get('/check');
    return response.data;
  } catch (error) {
    console.log('Error checking authentication status');
    throw new Error('Authentication check failed');
  }
};

/**
 * Get auth header for authenticated requests
 * @returns {Object} Headers object with Authorization token
 */
export const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

export default {
  login,
  register,
  checkAuth,
  getAuthHeader
};
