import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add Authorization header
axiosInstance.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('currentUser');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/**
 * Get authorization header with JWT token
 * @returns {Object} Authorization header object
 */
export const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (user.token) {
        return {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
        };
    }

    return { 'Content-Type': 'application/json' };
};

/**
 * Login user with email and password
 */
export const login = async (email, password) => {
    try {
        const response = await axiosInstance.post('/auth/login', { email, password });
        const { token, user } = response.data;

        return {
            ...user,
            token,
            role: user.role.toLowerCase(),
        };
    } catch (error) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Login failed. Please check your credentials and try again.');
    }
};

/**
 * Register new user
 */
export const register = async (firstName, lastName, email, password, confirmPassword) => {
    if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
    }

    try {
        const response = await axiosInstance.post('/auth/register', {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
        });
        const { token, user } = response.data;

        return {
            ...user,
            token,
            role: user.role.toLowerCase(),
        };
    } catch (error) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }

        const validationErrors = error.response?.data;
        if (validationErrors && typeof validationErrors === 'object' && !validationErrors.message) {
            const errorMessages = Object.values(validationErrors).join(', ');
            throw new Error(errorMessages);
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
        localStorage.removeItem('currentUser');
    }
};

/**
 * Verify JWT token
 */
export const verifyToken = async (token) => {
    try {
        const response = await axiosInstance.post('/auth/verify-token', { token });
        return response.data;
    } catch (error) {
        console.error('Token verification error:', error);
        throw error;
    }
};

/**
 * Refresh JWT token
 */
export const refreshToken = async (token) => {
    try {
        const response = await axiosInstance.post('/auth/refresh-token', { token });
        return response.data.token;
    } catch (error) {
        console.error('Token refresh error:', error);
        throw error;
    }
};

/**
 * Check authentication status
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

const authService = {
    login,
    register,
    logout,
    verifyToken,
    refreshToken,
    checkAuth,
    getAuthHeader,
};

export default authService;