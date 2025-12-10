// web/frontend/src/utils/authService.js
import axios from 'axios';

// Base API URL - adjust according to your backend port
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data with token
 */
export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });

    // Backend returns: { token: "...", user: { id, firstName, lastName, email, role, roles } }
    const { token, user } = response.data;

    // Store token and user data
    const userData = {
      ...user,
      token,
      role: user.role.toLowerCase(), // Normalize role to lowercase
    };

    return userData;
  } catch (error) {
    console.error('Login error:', error);

    // Handle specific error messages from backend
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error('Login failed. Please check your credentials and try again.');
  }
};

/**
 * Register new user
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} confirmPassword - Password confirmation
 * @returns {Promise<Object>} User data with token
 */
export const register = async (firstName, lastName, email, password, confirmPassword) => {
  try {
    // Validate passwords match on frontend
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const response = await axiosInstance.post('/auth/register', {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });

    // Backend returns: { token: "...", user: { id, firstName, lastName, email, role, roles } }
    const { token, user } = response.data;

    // Store token and user data
    const userData = {
      ...user,
      token,
      role: user.role.toLowerCase(), // Normalize role to lowercase
    };

    return userData;
  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific error messages from backend
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    // Handle validation errors
    if (error.response?.data) {
      const validationErrors = error.response.data;
      if (typeof validationErrors === 'object' && !validationErrors.message) {
        // If it's a validation error object, format it
        const errorMessages = Object.values(validationErrors).join(', ');
        throw new Error(errorMessages);
      }
    }

    throw new Error('Registration failed. Please try again.');
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await axiosInstance.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always remove local data even if API call fails
    localStorage.removeItem('currentUser');
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} User data if token is valid
 */
export const verifyToken = async (token) => {
  try {
    const response = await axiosInstance.post('/auth/verify-token', {
      token,
    });

    return response.data;
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
};

/**
 * Refresh JWT token
 * @param {string} token - Current JWT token
 * @returns {Promise<string>} New JWT token
 */
export const refreshToken = async (token) => {
  try {
    const response = await axiosInstance.post('/auth/refresh-token', {
      token,
    });

    return response.data.token;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Check authentication status
 * @returns {Promise<Object>} Authentication status
 */
export const checkAuth = async () => {
  try {
    const response = await axiosInstance.get('/auth/check');
    return response.data;
  } catch (error) {
    console.error('Auth check error:', error);
    throw error;
  }
};

export default {
  login,
  register,
  logout,
  verifyToken,
  refreshToken,
  checkAuth,
};