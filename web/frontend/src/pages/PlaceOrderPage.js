import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { getShopById } from '../utils/shopService';
import { getFoodItemsByShop, placeOrder } from '../utils/foodItemService';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const PlaceOrderPage = () => {
  const { shopId } = useParams();
  const location = useLocation();
  const [shop, setShop] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.info('Please log in to place an order');
      navigate('/login');
      return;
    }

    // Only customers can place orders
    if (currentUser?.role !== 'customer') {
      toast.info('Only customers can place orders');
      navigate('/shops');
      return;
    }

    const fetchShopAndFoodItems = async () => {
      try {
        setLoading(true);
        const shopData = await getShopById(shopId);
        setShop(shopData);

        const foodItemsData = await getFoodItemsByShop(shopId);
        // Filter only available food items
        const availableItems = foodItemsData.filter(item => item.available && item.quantity > 0);
        setFoodItems(availableItems);
        
        // If a specific food item was selected from the shop details page
        if (location.state?.selectedFoodItem) {
          const selectedItem = location.state.selectedFoodItem;
          if (selectedItem.available && selectedItem.quantity > 0) {
            setCart([{ ...selectedItem, quantity: 1 }]);
            toast.info(`Added ${selectedItem.name} to your cart`);
          }
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load shop data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopAndFoodItems();
  }, [shopId, currentUser, navigate, location.state, isAuthenticated]);

  const handleAddToCart = (foodItem) => {
    const existingItem = cart.find(item => item.id === foodItem.id);
    
    if (existingItem) {
      // Increase quantity if already in cart
      setCart(cart.map(item => 
        item.id === foodItem.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Add new item to cart
      setCart([...cart, { ...foodItem, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (foodItemId) => {
    const existingItem = cart.find(item => item.id === foodItemId);
    
    if (existingItem.quantity === 1) {
      // Remove item if quantity will be 0
      setCart(cart.filter(item => item.id !== foodItemId));
    } else {
      // Decrease quantity
      setCart(cart.map(item => 
        item.id === foodItemId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty. Please add items to place an order.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const orderItems = cart.map(item => ({
        food_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }));

      const orderData = {
        shop_id: parseInt(shopId),
        customer_id: currentUser.id,
        items: orderItems,
        notes: notes,
        total_price: calculateTotal()
      };

      const result = await placeOrder(orderData);
      toast.success('Order placed successfully!');
      navigate('/my-orders');
    } catch (err) {
      setError('Failed to place order. Please try again.');
      console.error(err);
    }
  };



  if (loading) return <Loader />;

  if (!shop) {
    return (
      <PageContainer>
        <ErrorText>Shop not found</ErrorText>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>
        Place Order - {shop.name}
      </PageTitle>
      
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
      
      <ContentGrid>
        <MenuSection>
          <SectionTitle>
            Menu
          </SectionTitle>
          
          {foodItems.length === 0 ? (
            <EmptyMessage>
              No food items available at this time.
            </EmptyMessage>
          ) : (
            <MenuGrid>
              {foodItems.map((foodItem) => (
                <FoodItemCard key={foodItem.id}>
                  <FoodItemName>
                    {foodItem.name}
                  </FoodItemName>
                  <FoodItemDescription>
                    {foodItem.description}
                  </FoodItemDescription>
                  <FoodItemFooter>
                    <FoodItemPrice>
                      ${foodItem.price.toFixed(2)}
                    </FoodItemPrice>
                    <AddButton onClick={() => handleAddToCart(foodItem)}>
                      + Add to Cart
                    </AddButton>
                  </FoodItemFooter>
                </FoodItemCard>
              ))}
            </MenuGrid>
          )}
        </MenuSection>
        
        <OrderSection>
          <OrderCard>
            <SectionTitle>
              Your Order
            </SectionTitle>
            
            {cart.length === 0 ? (
              <EmptyMessage>
                Your cart is empty.
              </EmptyMessage>
            ) : (
              <>
                {cart.map((item) => (
                  <CartItem key={item.id}>
                    <CartItemHeader>
                      <CartItemName>
                        {item.name}
                      </CartItemName>
                      <CartItemTotal>
                        ${(item.price * item.quantity).toFixed(2)}
                      </CartItemTotal>
                    </CartItemHeader>
                    <CartItemControls>
                      <QuantityButton onClick={() => handleRemoveFromCart(item.id)}>
                        -
                      </QuantityButton>
                      <ItemQuantity>
                        {item.quantity}
                      </ItemQuantity>
                      <QuantityButton onClick={() => handleAddToCart(item)}>
                        +
                      </QuantityButton>
                      <ItemPrice>
                        x ${item.price.toFixed(2)}
                      </ItemPrice>
                    </CartItemControls>
                    <ItemDivider />
                  </CartItem>
                ))}
                
                <OrderTotal>
                  Total: ${calculateTotal().toFixed(2)}
                </OrderTotal>
              </>
            )}
            
            <NotesInput
              placeholder="Any special requests or notes for your order?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            
            <PlaceOrderButton
              onClick={handlePlaceOrder}
              disabled={cart.length === 0}
            >
              Place Order
            </PlaceOrderButton>
          </OrderCard>
        </OrderSection>
      </ContentGrid>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const ErrorText = styled.h2`
  color: #f44336;
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #ffebee;
  border-radius: 4px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MenuSection = styled.div`
  width: 100%;
`;

const OrderSection = styled.div`
  width: 100%;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
`;

const EmptyMessage = styled.p`
  color: #666;
  font-size: 1rem;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const FoodItemCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const FoodItemName = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const FoodItemDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  flex-grow: 1;
`;

const FoodItemFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FoodItemPrice = styled.span`
  font-weight: bold;
  font-size: 1.1rem;
  color: #333;
`;

const AddButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #388e3c;
  }
`;

const OrderCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const CartItem = styled.div`
  margin-bottom: 1rem;
`;

const CartItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CartItemName = styled.span`
  font-weight: bold;
  color: #333;
`;

const CartItemTotal = styled.span`
  color: #333;
`;

const CartItemControls = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
`;

const QuantityButton = styled.button`
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ItemQuantity = styled.span`
  margin: 0 0.5rem;
  font-size: 0.9rem;
`;

const ItemPrice = styled.span`
  margin-left: 0.5rem;
  font-size: 0.9rem;
  color: #666;
`;

const ItemDivider = styled.hr`
  border: 0;
  border-top: 1px solid #eee;
  margin: 0.5rem 0;
`;

const OrderTotal = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
  margin: 1rem 0;
  text-align: right;
  color: #333;
`;

const NotesInput = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 1rem 0;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
`;

const PlaceOrderButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem;
  font-weight: bold;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 1rem;
  
  &:hover {
    background-color: #388e3c;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export default PlaceOrderPage;
