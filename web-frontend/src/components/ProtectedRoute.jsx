import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import "../styles/ProtectedRoute.css";

/**
 * Generic route protection component.
 * @param {string} role - Optional role to restrict access ("seller" | "customer").
 */
const RoleRoute = ({ role }) => {
    const { isAuthenticated, isSeller, isCustomer, loading } = useAuth();

    if (loading) {
        return (
            <div className="loader-wrapper">
                <div className="loader-spinner"></div>
                <p className="loader-text">Checking authentication...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (role === 'seller' && !isSeller) {
        return <Navigate to="/" />;
    }

    if (role === 'customer' && !isCustomer) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

// Export specific role-based routes
export const ProtectedRoute = () => <RoleRoute />;
export const SellerRoute = () => <RoleRoute role="seller" />;
export const CustomerRoute = () => <RoleRoute role="customer" />;