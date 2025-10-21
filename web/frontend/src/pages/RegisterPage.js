import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error, isSeller } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

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
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('All fields are required');
      return;
    }
    
    // Check if passwords match before submitting
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      toast.info('Creating your account...', { autoClose: 2000 });
      
      console.log('Submitting registration form with data:', {
        name: formData.name,
        email: formData.email,
        password: '***', // Don't log actual password
        confirmPassword: '***' // Don't log actual password
      });
      
      // Pass all form data including confirmPassword
      const user = await register(
        formData.name, 
        formData.email, 
        formData.password, 
        formData.confirmPassword
      );
      
      console.log('Registration successful, user data:', user);
      
      // Show role-specific success message
      const role = user?.role || (isSeller(formData.email) ? 'seller' : 'customer');
      toast.success(`Registration successful! You are registered as a ${role}.`);
      
      // Clear form data
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <FormHeader>Create an Account</FormHeader>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <StyledForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Full Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
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
              placeholder="Enter your email"
              required
            />
            <HelpText>
              Note: If you're registering as a seller, your email must start with "shop." 
              (e.g., shop.yourname@example.com)
            </HelpText>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </FormGroup>
          
          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </SubmitButton>
        </StyledForm>
        
        <FormFooter>
          Already have an account? <StyledLink to="/login">Login here</StyledLink>
        </FormFooter>
      </FormCard>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
`;

const FormCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
`;

const FormHeader = styled.h1`
  font-size: 2rem;
  color: var(--primary, #800020);
  margin-bottom: 1.5rem;
  text-align: center;
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
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: var(--primary, #800020);
    box-shadow: 0 0 0 2px rgba(128, 0, 32, 0.1);
  }
`;

const HelpText = styled.small`
  color: #666;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

const SubmitButton = styled.button`
  background-color: var(--primary, #800020);
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;
  
  &:hover {
    background-color: #600018;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const FormFooter = styled.div`
  margin-top: 2rem;
  text-align: center;
  color: #666;
`;

const StyledLink = styled(Link)`
  color: var(--primary, #800020);
  font-weight: 600;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #d32f2f;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

export default RegisterPage;
