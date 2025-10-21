import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getShopById } from '../utils/shopService';
import { useShops } from '../contexts/ShopContext';
import styled from 'styled-components';

const ShopFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { addShop, editShop } = useShops();
  
  const [formData, setFormData] = useState({
    shop_name: '',
    contact_info: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShopData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const shopData = await getShopById(id);
          setFormData({
            shop_name: shopData.shop_name,
            contact_info: shopData.contact_info
          });
        } catch (err) {
          setError('Failed to fetch shop details. Please try again.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchShopData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'contact_info' ? parseInt(value, 10) || '' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.shop_name.trim()) {
      toast.error('Shop name is required');
      return;
    }
    
    if (!formData.contact_info) {
      toast.error('Contact information is required');
      return;
    }
    
    try {
      setSubmitting(true);
      if (isEditMode) {
        await editShop(id, formData);
        toast.success('Shop updated successfully');
      } else {
        await addShop(formData);
        toast.success('Shop created successfully');
      }
      navigate('/shops');
    } catch (err) {
      toast.error(isEditMode ? 'Failed to update shop' : 'Failed to create shop');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingMessage>Loading shop details...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <Container>
      <FormHeader>{isEditMode ? 'Edit Shop' : 'Create New Shop'}</FormHeader>
      
      <StyledForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="shop_name">Shop Name</Label>
          <Input
            type="text"
            id="shop_name"
            name="shop_name"
            value={formData.shop_name}
            onChange={handleChange}
            placeholder="Enter shop name"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="contact_info">Contact Information</Label>
          <Input
            type="number"
            id="contact_info"
            name="contact_info"
            value={formData.contact_info}
            onChange={handleChange}
            placeholder="Enter contact number"
            required
          />
        </FormGroup>
        
        <ButtonGroup>
          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : (isEditMode ? 'Update Shop' : 'Create Shop')}
          </SubmitButton>
          <CancelButton type="button" onClick={() => navigate('/shops')}>
            Cancel
          </CancelButton>
        </ButtonGroup>
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

const FormHeader = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const StyledForm = styled.form`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const SubmitButton = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  flex: 1;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #45a049;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background-color: #f5f5f5;
  color: #333;
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  flex: 1;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #f44336;
  background-color: #ffebee;
  border-radius: 4px;
  margin: 2rem auto;
  max-width: 800px;
`;

export default ShopFormPage;
