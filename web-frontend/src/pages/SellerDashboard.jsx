import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useShops } from '../contexts/ShopContext';
import { getFoodItemsByShop, createFoodItem, updateFoodItem, deleteFoodItem, updateFoodItemAvailability } from '../utils/foodItemService';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit, FiTrash2, FiX, FiCheck, FiXCircle } from 'react-icons/fi';
import '../styles/SellerDashboard.css';

const SellerDashboard = () => {
    const { currentUser, isSeller } = useAuth();
    const { getMyShops } = useShops();
    const [myShop, setMyShop] = useState(null);
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        itemName: '',
        itemDescr: '',
        itemImageURL: '',
        price: '',
        isAvailable: true
    });

    useEffect(() => {
        if (!isSeller) {
            toast.error('You must be a seller to access this page');
            return;
        }
        loadShopAndItems();
    }, [isSeller]);

    const loadShopAndItems = async () => {
        try {
            setLoading(true);
            const shops = await getMyShops();
            
            if (shops && shops.length > 0) {
                const activeShop = shops.find(s => s.status === 'ACTIVE') || shops[0];
                setMyShop(activeShop);
                
                if (activeShop) {
                    await loadFoodItems(activeShop.shopId);
                }
            } else {
                toast.info('You do not have any shops yet. Please register a shop first.');
            }
        } catch (error) {
            console.error('Error loading shop:', error);
            toast.error('Error loading your shop');
        } finally {
            setLoading(false);
        }
    };

    const loadFoodItems = async (shopId) => {
        try {
            const items = await getFoodItemsByShop(shopId);
            setFoodItems(items || []);
        } catch (error) {
            console.error('Error loading food items:', error);
            toast.error('Error loading food items');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.itemName || !formData.price) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingItem) {
                // Update existing item
                await updateFoodItem(editingItem.itemId || editingItem.id, formData);
                toast.success('Food item updated successfully');
            } else {
                // Create new item
                await createFoodItem(formData, myShop.shopId);
                toast.success('Food item added successfully');
            }
            
            await loadFoodItems(myShop.shopId);
            resetForm();
        } catch (error) {
            console.error('Error saving food item:', error);
            toast.error(error.response?.data?.message || 'Error saving food item');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            itemName: item.itemName || item.name || '',
            itemDescr: item.itemDescr || item.description || '',
            itemImageURL: item.itemImageURL || item.imageURL || '',
            price: item.price || '',
            isAvailable: item.isAvailable !== undefined ? item.isAvailable : (item.available !== undefined ? item.available : true)
        });
        setShowForm(true);
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this food item?')) {
            return;
        }

        try {
            await deleteFoodItem(itemId);
            toast.success('Food item deleted successfully');
            await loadFoodItems(myShop.shopId);
        } catch (error) {
            console.error('Error deleting food item:', error);
            toast.error(error.response?.data?.message || 'Error deleting food item');
        }
    };

    const handleToggleAvailability = async (item) => {
        try {
            const newAvailability = !(item.isAvailable !== undefined ? item.isAvailable : item.available);
            await updateFoodItemAvailability(item.itemId || item.id, newAvailability);
            toast.success(`Food item ${newAvailability ? 'enabled' : 'disabled'}`);
            await loadFoodItems(myShop.shopId);
        } catch (error) {
            console.error('Error updating availability:', error);
            toast.error('Error updating availability');
        }
    };

    const resetForm = () => {
        setFormData({
            itemName: '',
            itemDescr: '',
            itemImageURL: '',
            price: '',
            isAvailable: true
        });
        setEditingItem(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="seller-dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading your shop...</p>
            </div>
        );
    }

    if (!isSeller) {
        return (
            <div className="seller-dashboard-container">
                <div className="error-message">
                    <h2>Access Denied</h2>
                    <p>You must be a seller to access this page.</p>
                </div>
            </div>
        );
    }

    if (!myShop) {
        return (
            <div className="seller-dashboard-container">
                <div className="no-shop-message">
                    <h2>No Shop Found</h2>
                    <p>You don't have any shops yet. Please register a shop first.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="seller-dashboard-container">
            <div className="dashboard-header">
                <h1>Seller Dashboard</h1>
                <div className="shop-info-card">
                    <h2>{myShop.shopName}</h2>
                    <div className="shop-details">
                        <p><strong>Status:</strong> <span className={`status-badge status-${myShop.status?.toLowerCase()}`}>{myShop.status}</span></p>
                        <p><strong>Location:</strong> {myShop.location}</p>
                        <p><strong>Address:</strong> {myShop.shopAddress}</p>
                        <p><strong>Contact:</strong> {myShop.contactNumber}</p>
                    </div>
                </div>
            </div>

            <div className="food-items-section">
                <div className="section-header">
                    <h2>Food Items</h2>
                    <button className="btn-add" onClick={() => setShowForm(true)}>
                        <FiPlus /> Add Food Item
                    </button>
                </div>

                {showForm && (
                    <div className="food-item-form-container">
                        <form className="food-item-form" onSubmit={handleSubmit}>
                            <div className="form-header">
                                <h3>{editingItem ? 'Edit Food Item' : 'Add New Food Item'}</h3>
                                <button type="button" className="btn-close" onClick={resetForm}>
                                    <FiX />
                                </button>
                            </div>

                            <div className="form-group">
                                <label htmlFor="itemName">Item Name *</label>
                                <input
                                    type="text"
                                    id="itemName"
                                    name="itemName"
                                    value={formData.itemName}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Chicken Burger"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="itemDescr">Description</label>
                                <textarea
                                    id="itemDescr"
                                    name="itemDescr"
                                    value={formData.itemDescr}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Describe your food item..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="price">Price *</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="itemImageURL">Image URL</label>
                                    <input
                                        type="url"
                                        id="itemImageURL"
                                        name="itemImageURL"
                                        value={formData.itemImageURL}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isAvailable"
                                        checked={formData.isAvailable}
                                        onChange={handleInputChange}
                                    />
                                    Available
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-submit">
                                    {editingItem ? 'Update Item' : 'Add Item'}
                                </button>
                                <button type="button" className="btn-cancel" onClick={resetForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {foodItems.length === 0 ? (
                    <div className="no-items-message">
                        <p>No food items yet. Click "Add Food Item" to get started!</p>
                    </div>
                ) : (
                    <div className="food-items-grid">
                        {foodItems.map((item) => (
                            <div key={item.itemId || item.id} className="food-item-card">
                                {item.itemImageURL && (
                                    <div className="food-item-image">
                                        <img src={item.itemImageURL} alt={item.itemName || item.name} />
                                    </div>
                                )}
                                <div className="food-item-content">
                                    <h3>{item.itemName || item.name}</h3>
                                    <p className="food-item-description">{item.itemDescr || item.description || 'No description'}</p>
                                    <div className="food-item-footer">
                                        <span className="food-item-price">₱{parseFloat(item.price).toFixed(2)}</span>
                                        <span className={`availability-badge ${(item.isAvailable !== undefined ? item.isAvailable : item.available) ? 'available' : 'unavailable'}`}>
                                            {(item.isAvailable !== undefined ? item.isAvailable : item.available) ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>
                                    <div className="food-item-actions">
                                        <button
                                            className="btn-action btn-toggle"
                                            onClick={() => handleToggleAvailability(item)}
                                            title={(item.isAvailable !== undefined ? item.isAvailable : item.available) ? 'Mark as unavailable' : 'Mark as available'}
                                        >
                                            {(item.isAvailable !== undefined ? item.isAvailable : item.available) ? <FiCheck /> : <FiXCircle />}
                                        </button>
                                        <button
                                            className="btn-action btn-edit"
                                            onClick={() => handleEdit(item)}
                                            title="Edit"
                                        >
                                            <FiEdit />
                                        </button>
                                        <button
                                            className="btn-action btn-delete"
                                            onClick={() => handleDelete(item.itemId || item.id)}
                                            title="Delete"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerDashboard;

