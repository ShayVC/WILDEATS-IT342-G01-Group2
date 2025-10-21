import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../utils/authService';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Check if email belongs to a seller (starts with "shop.")
  const checkIsSeller = (email) => {
    return email.startsWith('shop.');
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Call the API login function
      const userData = await apiLogin(email, password);
      
      // Normalize role casing for consistency in the frontend
      const normalizedUser = {
        ...userData,
        role: userData.role.toLowerCase()
      };
      
      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
      setCurrentUser(normalizedUser);
      return normalizedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password, confirmPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate inputs
      if (!name || !email || !password) {
        throw new Error('Name, email, and password are required');
      }
      
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      console.log('Registering user:', { name, email, password: '***', confirmPassword: '***' });
      
      // Call the API register function with all parameters
      const userData = await apiRegister(name, email, password, confirmPassword);
      
      console.log('Registration successful, received user data:', userData);
      
      // Normalize role casing for consistency in the frontend
      const normalizedUser = {
        ...userData,
        role: userData.role ? userData.role.toLowerCase() : 'customer' // Default to customer if role is not provided
      };
      
      console.log('Normalized user data:', normalizedUser);
      
      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
      setCurrentUser(normalizedUser);
      return normalizedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    toast.info('You have been logged out');
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isSeller: checkIsSeller,
    isAuthenticated: !!currentUser,
    isCustomer: currentUser && currentUser.role === 'customer',
    isSeller: currentUser && currentUser.role === 'seller',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
