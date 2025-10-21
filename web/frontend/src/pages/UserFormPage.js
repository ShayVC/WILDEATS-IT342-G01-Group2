import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUserById } from '../utils/userService';
import { useUsers } from '../contexts/UserContext';
import styled from 'styled-components';

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { addUser, editUser } = useUsers();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const userData = await getUserById(id);
          setFormData({
            name: userData.name,
            email: userData.email,
            password: '' // Don't populate password for security reasons
          });
        } catch (err) {
          setError('Failed to fetch user details. Please try again.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    if (!isEditMode && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }
    
    try {
      setSubmitting(true);
      if (isEditMode) {
        // If password is empty in edit mode, remove it from the data sent to the server
        const dataToUpdate = formData.password 
          ? formData 
          : { name: formData.name, email: formData.email };
        
        await editUser(id, dataToUpdate);
        toast.success('User updated successfully');
      } else {
        await addUser(formData);
        toast.success('User created successfully');
      }
      navigate('/users');
    } catch (err) {
      toast.error(isEditMode ? 'Failed to update user' : 'Failed to create user');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingMessage>Loading user details...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <Container>
      <FormHeader>{isEditMode ? 'Edit User' : 'Create New User'}</FormHeader>
      
      <StyledForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter name"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">
            {isEditMode ? 'Password (leave blank to keep current)' : 'Password'}
          </Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={isEditMode ? 'Leave blank to keep current password' : 'Enter password'}
            required={!isEditMode}
          />
        </FormGroup>
        
        <ButtonGroup>
          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}
          </SubmitButton>
          <CancelButton type="button" onClick={() => navigate('/users')}>
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

export default UserFormPage;
