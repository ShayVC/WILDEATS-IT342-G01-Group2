import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../utils/authService';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  // Utility: email starts with "shop." means seller
  const isSellerEmail = (email) => email?.startsWith('shop.');

  // Normalizes the backend response into a flat object
  const normalizeUser = (data) => {
    return {
      ...data.user,                     // id, name, email, role
      token: data.token,                // JWT token
      role: data.user.role.toLowerCase(), // CUSTOMER → customer
    };
  };

  // LOGIN
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const userData = await apiLogin(email, password);

      // Flatten the structure
      const normalized = normalizeUser(userData);

      // Save
      localStorage.setItem("currentUser", JSON.stringify(normalized));
      setCurrentUser(normalized);

      return normalized;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const register = async (name, email, password, confirmPassword) => {
    try {
      setLoading(true);
      setError(null);

      if (!name || !email || !password) {
        throw new Error("Name, email, and password are required");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const userData = await apiRegister(name, email, password, confirmPassword);

      // Backend should return the same structure { user, token }
      const normalized = normalizeUser(userData);

      localStorage.setItem("currentUser", JSON.stringify(normalized));
      setCurrentUser(normalized);

      return normalized;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    toast.info("You have been logged out");
  };

  // Values available to the whole app
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,

    // Role helpers
    isAuthenticated: !!currentUser,
    isCustomer: currentUser?.role === "customer",
    isSeller: currentUser?.role === "seller" || isSellerEmail(currentUser?.email),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;