import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Component to protect routes that require authentication
export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

// Component to protect routes that require seller role
export const SellerRoute = () => {
  const { isAuthenticated, isSeller, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to home if not authenticated or not a seller
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return isSeller ? <Outlet /> : <Navigate to="/" />;
};

// Component to protect routes that require customer role
export const CustomerRoute = () => {
  const { isAuthenticated, isCustomer, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to home if not authenticated or not a customer
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return isCustomer ? <Outlet /> : <Navigate to="/" />;
};
