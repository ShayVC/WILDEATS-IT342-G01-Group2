import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <FormHeader>Login to WildEats</FormHeader>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <StyledForm onSubmit={handleSubmit}>
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
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </FormGroup>
          
          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </SubmitButton>
        </StyledForm>
        
        <FormFooter>
          Don't have an account? <StyledLink to="/register">Register here</StyledLink>
        </FormFooter>
        
        <TestAccountsInfo>
          <h4>Test Accounts:</h4>
          <p>Seller: shop.owner@gmail.com / password</p>
          <p>Customer: customer@gmail.com / password</p>
          <p><strong>Note:</strong> All test accounts use the password: "password"</p>
        </TestAccountsInfo>
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

const TestAccountsInfo = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.9rem;
  color: #666;
  
  h4 {
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  p {
    margin: 0.25rem 0;
  }
`;

export default LoginPage;
