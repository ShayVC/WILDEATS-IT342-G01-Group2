import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getShopById, deleteShop } from '../utils/shopService';
import { getFoodItemsByShop, deleteFoodItem, updateFoodItemAvailability } from '../utils/foodItemService';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const ShopDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        setLoading(true);
        const data = await getShopById(id);
        setShop(data);
        
        // Also fetch food items for this shop
        const foodItemsData = await getFoodItemsByShop(id);
        setFoodItems(foodItemsData);
      } catch (err) {
        setError('Failed to fetch shop details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this shop?')) {
      try {
        setIsDeleting(true);
        await deleteShop(id);
        toast.success('Shop deleted successfully');
        navigate('/shops');
      } catch (err) {
        toast.error('Failed to delete shop');
        console.error(err);
        setIsDeleting(false);
      }
    }
  };
  
  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to place an order');
      navigate('/login');
      return;
    }
    
    navigate(`/shops/${id}/place-order`);
  };

  if (loading) return <LoadingMessage>Loading shop details...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!shop) return <ErrorMessage>Shop not found</ErrorMessage>;

  const handleDeleteFoodItem = async (foodItemId) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      try {
        await deleteFoodItem(foodItemId, currentUser.id);
        toast.success('Food item deleted successfully');
        
        // Refresh food items list
        const updatedFoodItems = await getFoodItemsByShop(id);
        setFoodItems(updatedFoodItems);
      } catch (err) {
        toast.error('Failed to delete food item');
        console.error(err);
      }
    }
  };
  
  const handleToggleAvailability = async (foodItemId, currentAvailability) => {
    try {
      await updateFoodItemAvailability(foodItemId, !currentAvailability, currentUser.id);
      
      // Refresh food items list
      const updatedFoodItems = await getFoodItemsByShop(id);
      setFoodItems(updatedFoodItems);
      
      toast.success(`Food item ${!currentAvailability ? 'available' : 'unavailable'} for purchase`);
    } catch (err) {
      toast.error('Failed to update food item availability');
      console.error(err);
    }
  };

  return (
    <Container>
      <BackLink to="/shops">← Back to Shops</BackLink>
      
      <ShopCard>
        <ShopHeader>
          <ShopName>{shop.shop_name}</ShopName>
          <ButtonGroup>
            {isAuthenticated && currentUser?.role === 'seller' && (
              <>
                <EditButton to={`/shops/edit/${shop.shop_id}`}>Edit Shop</EditButton>
                <DeleteButton 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Shop'}
                </DeleteButton>
              </>
            )}
            
            {isAuthenticated && currentUser?.role === 'customer' && (
              <OrderButton onClick={handlePlaceOrder}>
                Place Order
              </OrderButton>
            )}
          </ButtonGroup>
        </ShopHeader>
        
        <DetailSection>
          <DetailLabel>Contact:</DetailLabel>
          <DetailValue>{shop.contact_info || 'No contact information available'}</DetailValue>
        </DetailSection>
        
        {/* Food Items Section */}
        <SectionDivider />
        <SectionHeader>
          <h2>Food Items</h2>
          {isAuthenticated && currentUser?.role === 'seller' && (
            <AddFoodButton to={`/shops/${id}/add-food`}>
              Add New Food Item
            </AddFoodButton>
          )}
        </SectionHeader>
        
        <DetailSection>
          <DetailLabel>Location:</DetailLabel>
          <DetailValue>{shop.location || 'No location specified'}</DetailValue>
        </DetailSection>
        
        <DetailSection>
          <DetailLabel>Contact Information:</DetailLabel>
          <DetailValue>
            <div>Phone: {shop.phone || 'N/A'}</div>
            <div>Email: {shop.email || 'N/A'}</div>
          </DetailValue>
        </DetailSection>
        
        <DetailSection>
          <DetailLabel>Opening Hours:</DetailLabel>
          <DetailValue>{shop.openingHours || 'Not specified'}</DetailValue>
        </DetailSection>
        
        <DetailSection>
          <DetailLabel>Menu Items:</DetailLabel>
          {foodItems.length === 0 ? (
            <DetailValue>No menu items available</DetailValue>
          ) : (
            <MenuItemsGrid>
              {foodItems.map(item => (
                <MenuItem key={item.id}>
                  <MenuItemName>{item.name}</MenuItemName>
                  <MenuItemDescription>{item.description}</MenuItemDescription>
                  <MenuItemPrice>${item.price.toFixed(2)}</MenuItemPrice>
                </MenuItem>
              ))}
            </MenuItemsGrid>
          )}
        </DetailSection>
        
        {foodItems.length === 0 ? (
          <EmptyMessage>No food items available in this shop yet.</EmptyMessage>
        ) : (
          <FoodItemsGrid>
            {foodItems.map((foodItem) => (
              <FoodItemCard key={foodItem.id}>
                <FoodItemName>{foodItem.name}</FoodItemName>
                <FoodItemDescription>
                  {foodItem.description || 'No description available'}
                </FoodItemDescription>
                
                <FoodItemDetails>
                  <FoodItemPrice>${foodItem.price.toFixed(2)}</FoodItemPrice>
                  <FoodItemQuantity>In stock: {foodItem.quantity}</FoodItemQuantity>
                  <FoodItemAvailability available={foodItem.available}>
                    {foodItem.available ? 'Available' : 'Unavailable'}
                  </FoodItemAvailability>
                </FoodItemDetails>
                
                {isAuthenticated && currentUser?.role === 'seller' && (
                  <FoodItemActions>
                    <ActionButton 
                      as={Link} 
                      to={`/shops/${id}/food/${foodItem.id}/edit`}
                      color="#2196f3"
                    >
                      Edit
                    </ActionButton>
                    
                    <ActionButton 
                      onClick={() => handleToggleAvailability(foodItem.id, foodItem.available)}
                      color={foodItem.available ? "#ff9800" : "#4caf50"}
                    >
                      {foodItem.available ? 'Mark Unavailable' : 'Mark Available'}
                    </ActionButton>
                    
                    <ActionButton 
                      onClick={() => handleDeleteFoodItem(foodItem.id)}
                      color="#f44336"
                    >
                      Delete
                    </ActionButton>
                  </FoodItemActions>
                )}
                
                {isAuthenticated && currentUser?.role === 'customer' && (
                  <AddToOrderButton 
                    onClick={() => navigate(`/shops/${id}/place-order`, { state: { selectedFoodItem: foodItem } })}
                    disabled={!foodItem.available || foodItem.quantity <= 0}
                  >
                    {!foodItem.available ? 'Unavailable' : 
                     foodItem.quantity <= 0 ? 'Out of Stock' : 'Add to Order'}
                  </AddToOrderButton>
                )}
              </FoodItemCard>
            ))}
          </FoodItemsGrid>
        )}
      </ShopCard>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1000px;
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

const ShopCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const ShopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const ShopName = styled.h1`
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

const OrderButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #45a049;
  }
`;

const SectionDivider = styled.hr`
  border: 0;
  height: 1px;
  background-color: #e0e0e0;
  margin: 2rem 0;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    font-size: 1.5rem;
    margin: 0;
    color: #333;
  }
`;

const AddFoodButton = styled(Link)`
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #45a049;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #757575;
  font-style: italic;
`;

const FoodItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const FoodItemCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const FoodItemName = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: #333;
`;

const FoodItemDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const FoodItemDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FoodItemPrice = styled.span`
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
`;

const FoodItemQuantity = styled.span`
  color: #757575;
  font-size: 0.9rem;
`;

const FoodItemAvailability = styled.span`
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: ${props => props.available ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.available ? '#2e7d32' : '#c62828'};
`;

const FoodItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ActionButton = styled.button`
  background-color: ${props => props.color || '#2196f3'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.7rem;
  font-size: 0.8rem;
  cursor: pointer;
  flex: 1;
  transition: opacity 0.3s;
  
  &:hover {
    opacity: 0.9;
  }
`;

const AddToOrderButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.6rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #45a049;
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

const MenuItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const MenuItem = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-3px);
  }
`;

const MenuItemName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const MenuItemDescription = styled.p`
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
`;

const MenuItemPrice = styled.div`
  font-weight: bold;
  color: #4caf50;
  margin-top: 0.5rem;
`;

export default ShopDetailsPage;
