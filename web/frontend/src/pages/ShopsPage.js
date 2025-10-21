import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useShops } from '../contexts/ShopContext';
import styled from 'styled-components';

const ShopsPage = () => {
  const { shops, loading, error, refreshShops, removeShop } = useShops();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shop?')) {
      try {
        setIsDeleting(true);
        await removeShop(id);
        toast.success('Shop deleted successfully');
      } catch (err) {
        toast.error('Failed to delete shop');
        console.error(err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) return <LoadingMessage>Loading shops...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <Container>
      <Header>
        <h1>Shops</h1>
        <AddButton to="/shops/create">Add New Shop</AddButton>
      </Header>
      
      {shops.length === 0 ? (
        <EmptyMessage>No shops found. Add a new shop to get started.</EmptyMessage>
      ) : (
        <ShopGrid>
          {shops.map((shop) => (
            <ShopCard key={shop.shop_id}>
              <ShopName>{shop.shop_name}</ShopName>
              <ContactInfo>Contact: {shop.contact_info}</ContactInfo>
              <ButtonGroup>
                <ViewButton to={`/shops/${shop.shop_id}`}>View</ViewButton>
                <EditButton to={`/shops/edit/${shop.shop_id}`}>Edit</EditButton>
                <DeleteButton 
                  onClick={() => handleDelete(shop.shop_id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </DeleteButton>
              </ButtonGroup>
            </ShopCard>
          ))}
        </ShopGrid>
      )}
    </Container>
  );
};

// Styled Components
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

const ShopGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const ShopCard = styled.div`
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

const ShopName = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const ContactInfo = styled.p`
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

export default ShopsPage;
