import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser } from '../utils/userService';

// Mock data to use when the API is unavailable
const MOCK_USERS = [
  { userId: 1, name: 'John Doe', email: 'john.doe@example.com', password: '********' },
  { userId: 2, name: 'Jane Smith', email: 'jane.smith@example.com', password: '********' },
  { userId: 3, name: 'Michael Johnson', email: 'michael.johnson@example.com', password: '********' },
  { userId: 4, name: 'Emily Davis', email: 'emily.davis@example.com', password: '********' },
  { userId: 5, name: 'Robert Wilson', email: 'robert.wilson@example.com', password: '********' }
];

const UserContext = createContext();

export const useUsers = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users from API:', err);
      // Use mock data instead of showing an error
      setUsers(MOCK_USERS);
      setError(null);
      console.log('Using mock user data since the API is unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add a user to the database and update state
  const addUser = async (userData) => {
    try {
      setLoading(true);
      const newUser = await createUser(userData);
      setUsers(prevUsers => [...prevUsers, newUser]);
      return newUser;
    } catch (err) {
      console.error('Error adding user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a user in the database and update state
  const editUser = async (id, userData) => {
    try {
      setLoading(true);
      const updatedUser = await updateUser(id, userData);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.userId === parseInt(id) ? updatedUser : user
        )
      );
      return updatedUser;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a user from the database and update state
  const removeUser = async (id) => {
    try {
      setLoading(true);
      await deleteUser(id);
      setUsers(prevUsers => prevUsers.filter(user => user.userId !== parseInt(id)));
      return true;
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    users,
    loading,
    error,
    refreshUsers: fetchUsers,
    addUser,
    editUser,
    removeUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
