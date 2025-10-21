import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUserById, deleteUser } from '../utils/userService';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const data = await getUserById(id);
        setUser(data);
      } catch (err) {
        setError('Failed to fetch user details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setIsDeleting(true);
        await deleteUser(id);
        toast.success('User deleted successfully');
        navigate('/users');
      } catch (err) {
        toast.error('Failed to delete user');
        console.error(err);
        setIsDeleting(false);
      }
    }
  };

  if (loading) return <LoadingMessage>Loading user details...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!user) return <ErrorMessage>User not found</ErrorMessage>;

  return (
    <Container>
      <BackLink to="/users">← Back to Users</BackLink>
      
      <UserCard>
        <UserHeader>
          <UserName>{user.name}</UserName>
          <ButtonGroup>
            <EditButton to={`/users/edit/${user.userId}`}>Edit</EditButton>
            <DeleteButton 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </DeleteButton>
          </ButtonGroup>
        </UserHeader>
        
        <DetailSection>
          <DetailLabel>User ID:</DetailLabel>
          <DetailValue>{user.userId}</DetailValue>
        </DetailSection>
        
        <DetailSection>
          <DetailLabel>Email:</DetailLabel>
          <DetailValue>{user.email}</DetailValue>
        </DetailSection>
      </UserCard>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 2rem;
  color: #2196f3;
  text-decoration: none;
  font-weight: bold;
  
  &:hover {
    text-decoration: underline;
  }
`;

const UserCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const UserHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const UserName = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const EditButton = styled(Link)`
  background-color: #ff9800;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e68a00;
  }
`;

const DeleteButton = styled.button`
  background-color: #f44336;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #d32f2f;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const DetailSection = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
`;

const DetailLabel = styled.span`
  font-weight: bold;
  color: #666;
  margin-bottom: 0.5rem;
`;

const DetailValue = styled.span`
  font-size: 1.2rem;
  color: #333;
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

export default UserDetailsPage;
