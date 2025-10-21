import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { getFoodItemById, createFoodItem, updateFoodItem } from '../utils/foodItemService';
import { getShopById } from '../utils/shopService';
import Loader from '../components/Loader';

const FoodItemFormPage = () => {
  const { shopId, foodId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEditMode = !!foodId;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    available: true
  });
  
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch shop data
        const shopData = await getShopById(shopId);
        setShop(shopData);
        
        // If editing, fetch food item data
        if (isEditMode) {
          const foodItemData = await getFoodItemById(foodId);
          setFormData({
            name: foodItemData.name || '',
            description: foodItemData.description || '',
            price: foodItemData.price || '',
            quantity: foodItemData.quantity || '',
            available: foodItemData.available !== false // Default to true if not specified
          });
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId, foodId, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (name === 'price' || name === 'quantity') ? 
              (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Food item name is required');
      return;
    }
    
    if (formData.price === '' || isNaN(formData.price) || formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    
    if (formData.quantity === '' || isNaN(formData.quantity) || formData.quantity < 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const foodItemData = {
        ...formData,
        shop: { id: parseInt(shopId) }
      };
      
      if (isEditMode) {
        await updateFoodItem(foodId, foodItemData, currentUser.id);
        toast.success('Food item updated successfully');
      } else {
        await createFoodItem(foodItemData, shopId, currentUser.id);
        toast.success('Food item created successfully');
      }
      
      navigate(`/shops/${shopId}`);
    } catch (err) {
      toast.error(isEditMode ? 'Failed to update food item' : 'Failed to create food item');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <Container>
      <BackButton onClick={() => navigate(`/shops/${shopId}`)}>
        &larr; Back to Shop
      </BackButton>
      
      <FormHeader>
        {isEditMode ? 'Edit Food Item' : 'Add New Food Item'}
      </FormHeader>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {shop && (
        <ShopInfo>
          Shop: <strong>{shop.name}</strong>
        </ShopInfo>
      )}
      
      <StyledForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter food item name"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter food item description"
            rows={3}
          />
        </FormGroup>
        
        <FormRow>
          <FormGroup>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              step="1"
              min="0"
              required
            />
          </FormGroup>
        </FormRow>
        
        <CheckboxGroup>
          <Checkbox
            type="checkbox"
            id="available"
            name="available"
            checked={formData.available}
            onChange={handleChange}
          />
          <CheckboxLabel htmlFor="available">Available for purchase</CheckboxLabel>
        </CheckboxGroup>
        
        <SubmitButton type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : (isEditMode ? 'Update Food Item' : 'Add Food Item')}
        </SubmitButton>
      </StyledForm>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #2196f3;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1rem;
  display: inline-block;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FormHeader = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  background-color: #ffebee;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const ShopInfo = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  cursor: pointer;
`;

const SubmitButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #45a049;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export default FoodItemFormPage;
