import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';


const AdminContext = createContext();


export const useAdmins = () => useContext(AdminContext);


export const AdminProvider = ({ children }) => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch admins from backend API
    const fetchAdmins = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/admins'); // adjust endpoint to match your backend
            if (!response.ok) throw new Error('Failed to fetch admins');

            const data = await response.json();
            setAdmins(data);
        } catch (err) {
            setError(err.message);
            toast.error('Error loading admins');
        } finally {
            setLoading(false);
        }
    };

    // Refresh list
    const refreshAdmins = () => {
        fetchAdmins();
    };

    // Add new admin
    const addAdmin = async (adminData) => {
        try {
            const response = await fetch('/api/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(adminData),
            });

            if (!response.ok) throw new Error('Failed to add admin');

            const newAdmin = await response.json();
            setAdmins((prev) => [...prev, newAdmin]);
            toast.success('Admin added successfully');
        } catch (err) {
            toast.error('Error adding admin');
            console.error(err);
        }
    };

    // Remove admin
    const removeAdmin = async (id) => {
        try {
            const response = await fetch(`/api/admins/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete admin');

            setAdmins((prev) => prev.filter((admin) => admin.adminId !== id));
            toast.success('Admin deleted successfully');
        } catch (err) {
            toast.error('Error deleting admin');
            console.error(err);
        }
    };


    useEffect(() => {
        fetchAdmins();
    }, []);

    return (
        <AdminContext.Provider
            value={{
                admins,
                loading,
                error,
                refreshAdmins,
                addAdmin,
                removeAdmin,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
};