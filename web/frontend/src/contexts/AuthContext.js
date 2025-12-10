// web/frontend/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../utils/authService';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  // Normalizes the backend response into a flat object
  const normalizeUser = (data) => {
    // Backend returns: { token: "...", user: { id, firstName, lastName, email, role, roles } }
    const user = data.user || data;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`, // Full name for convenience
      email: user.email,
      role: user.role.toLowerCase(), // Primary role (CUSTOMER, SELLER, ADMIN)
      roles: user.roles || [user.role], // All roles array
      token: data.token,
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

      // Save to localStorage
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
  const register = async (firstName, lastName, email, password, confirmPassword) => {
    try {
      setLoading(true);
      setError(null);

      if (!firstName || !lastName || !email || !password) {
        throw new Error("All fields are required");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const userData = await apiRegister(firstName, lastName, email, password, confirmPassword);

      // Backend should return the same structure { user, token }
      const normalized = normalizeUser(userData);

      // Save to localStorage
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
  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      toast.info("You have been logged out");
    }
  };

  // Helper function to check if user has a specific role
  const hasRole = (roleName) => {
    if (!currentUser) return false;

    // Check in roles array (case-insensitive)
    if (currentUser.roles) {
      return currentUser.roles.some(
        role => role.toLowerCase() === roleName.toLowerCase()
      );
    }

    // Fallback to primary role
    return currentUser.role?.toLowerCase() === roleName.toLowerCase();
  };

  // Values available to the whole app
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,

    // Authentication state
    isAuthenticated: !!currentUser,

    // Role helpers
    isCustomer: hasRole('CUSTOMER'),
    isSeller: hasRole('SELLER'),
    isAdmin: hasRole('ADMIN'),

    // Utility function
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;