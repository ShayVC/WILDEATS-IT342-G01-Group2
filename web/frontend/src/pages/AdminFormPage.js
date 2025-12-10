import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

import AdminFormPage from './pages/AdminFormPage';


const AdminFormPage = () => {
  const { admins, loading, error, refreshAdmins, removeAdmin } = useAdmins();
  const [isDeleting, setIsDeleting] = useState(false);

  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'superadmin'; 
  

  const handleDelete = async (id) => {
    if (!isSuperAdmin) {
      toast.error('Permission denied. Only superadmins can delete admins.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        setIsDeleting(true);
        await removeAdmin(id);
        toast.success('Admin deleted successfully');
      } catch (err) {
        toast.error('Failed to delete admin');
        console.error(err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) return <LoadingMessage>Loading admins...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <Container>
      <Header>
        <h1>Admins</h1>
        {isSuperAdmin && (
          <AddButton to="/admins/create">Add New Admin</AddButton>
        )}
      </Header>

      {admins.length === 0 ? (
        <EmptyMessage>No admins found. Add a new admin to get started.</EmptyMessage>
      ) : (
        <AdminGrid>
          {admins.map((admin) => (
            <AdminCard key={admin.adminId}>
              <AdminName>{admin.name}</AdminName>
              <AdminEmail>{admin.email}</AdminEmail>
              <ButtonGroup isSuperAdmin={isSuperAdmin}>
                <ViewButton to={`/admins/${admin.adminId}`}>View</ViewButton>

                {isSuperAdmin && (
                  <>
                    <EditButton to={`/admins/edit/${admin.adminId}`}>Edit</EditButton>
                    <DeleteButton
                      onClick={() => handleDelete(admin.adminId)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </DeleteButton>
                  </>
                )}
              </ButtonGroup>
            </AdminCard>
          ))}
        </AdminGrid>
      )}
    </Container>
  );
};


const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    color: #333;
  }
`;

const AddButton = styled(Link)`
  background-color: #4caf50;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }
`;

const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const AdminCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const AdminName = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const AdminEmail = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ViewButton = styled(Link)`
  background-color: #2196f3;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  flex: 1;
  text-align: center;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0b7dda;
  }
`;

const EditButton = styled(Link)`
  background-color: #ff9800;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  flex: 1;
  text-align: center;
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
  flex: 1;
  transition: background-color 0.3s;

  &:hover {
    background-color: #d32f2f;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
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

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 8px;
`;

export default AdminFormPage;

