import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (firstName, lastName, email, password, confirmPassword) => {
        const response = await api.post('/auth/register', {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
        });
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return response.data;
    },

    verifyToken: async (token) => {
        const response = await api.post('/auth/verify-token', { token });
        return response.data;
    },

    checkAuth: async () => {
        const response = await api.get('/auth/check');
        return response.data;
    },
};

// User API calls
export const userAPI = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (firstName, lastName, email) => {
        const response = await api.put('/users/profile', {
            firstName,
            lastName,
            email,
        });
        return response.data;
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await api.put('/users/profile/password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },
};

export default api;