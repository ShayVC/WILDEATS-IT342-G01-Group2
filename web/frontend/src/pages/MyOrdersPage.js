import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { getMyOrders, updateOrderStatus, getShopOrders } from '../utils/foodItemService';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!currentUser) {
      toast.info('Please log in to view your orders');
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        let data;
        
        // Different API calls based on user role
        if (currentUser.role === 'seller') {
          // For sellers, get orders for their shops
          // In a real app, we'd get the seller's shops first
          // For now, we'll just use a mock shop ID for the seller
          const shopId = 1; // Mock shop ID
          data = await getShopOrders(shopId);
        } else {
          // For customers, get their orders
          data = await getMyOrders(currentUser.id);
        }
        
        setOrders(data);
        setError(null);
      } catch (err) {
        setError('Failed to load orders. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, navigate]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, currentUser.id);
      
      // Update the local state to reflect the change
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus.toUpperCase() } : order
      ));
    } catch (err) {
      setError('Failed to update order status. Please try again.');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PREPARING':
        return 'info';
      case 'READY':
        return 'success';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <Loader />;

  return (
    <PageContainer>
      <PageTitle>
        {currentUser?.role === 'seller' ? 'Shop Orders' : 'My Orders'}
      </PageTitle>
      
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
      
      {orders.length === 0 ? (
        <EmptyMessage>
          {currentUser?.role === 'seller' 
            ? 'No orders for your shops yet.' 
            : 'You haven\'t placed any orders yet.'}
        </EmptyMessage>
      ) : (
        <OrdersList>
          {orders.map((order) => (
            <OrderCard key={order.id}>
              <OrderHeader>
                <OrderNumber>
                  Order #{order.id}
                </OrderNumber>
                <StatusBadge status={order.status}>
                  {order.status}
                </StatusBadge>
              </OrderHeader>
              
              <OrderDetails>
                <OrderDate>
                  Placed on: {formatDate(order.created_at || new Date().toISOString())}
                </OrderDate>
                <ShopName>
                  Shop ID: {order.shop_id}
                  {currentUser.role === 'customer' && (
                    <ViewShopLink to={`/shops/${order.shop_id}`}>View Shop</ViewShopLink>
                  )}
                </ShopName>
                <OrderItems>
                  {order.items && order.items.map((item, index) => (
                    <OrderItem key={index}>
                      <ItemQuantity>{item.quantity}x</ItemQuantity>
                      <ItemName>{item.name}</ItemName>
                      <ItemPrice>${(item.price * item.quantity).toFixed(2)}</ItemPrice>
                    </OrderItem>
                  ))}
                </OrderItems>
                
                {order.notes && (
                  <OrderNotes>
                    <NoteLabel>Notes:</NoteLabel>
                    <NoteText>{order.notes}</NoteText>
                  </OrderNotes>
                )}
                
                <OrderTotal>
                  <TotalLabel>Total:</TotalLabel>
                  <TotalAmount>${order.total_price ? order.total_price.toFixed(2) : '0.00'}</TotalAmount>
                </OrderTotal>
              </OrderDetails>
              
              <OrderFooter>
                <StatusBadge color={getStatusColor(order.status)}>
                  {order.status}
                </StatusBadge>
                
                {currentUser.role === 'seller' && order.status === 'PENDING' && (
                  <ActionButtons>
                    <ActionButton 
                      color="info"
                      onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                    >
                      Start Preparing
                    </ActionButton>
                    <ActionButton 
                      color="error"
                      onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                    >
                      Cancel
                    </ActionButton>
                  </ActionButtons>
                )}
                
                {currentUser.role === 'seller' && order.status === 'PREPARING' && (
                  <ActionButton 
                    color="success"
                    onClick={() => handleStatusUpdate(order.id, 'READY')}
                  >
                    Mark as Ready
                  </ActionButton>
                )}
                
                {currentUser.role === 'customer' && order.status === 'READY' && (
                  <ActionButton 
                    color="success"
                    onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                  >
                    Mark as Received
                  </ActionButton>
                )}
              </OrderFooter>
            </OrderCard>
          ))}
        </OrdersList>
      )}
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

const ErrorMessage = styled.div`
  color: #f44336;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #ffebee;
  border-radius: 4px;
`;

const EmptyMessage = styled.p`
  color: #666;
  font-size: 1rem;
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const OrderCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const OrderNumber = styled.h2`
  font-size: 1.25rem;
  margin: 0;
  color: #333;
`;

const OrderDate = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const OrderDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ShopName = styled.h3`
  margin: 0 0 1rem;
  font-size: 1.2rem;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ViewShopLink = styled(Link)`
  font-size: 0.9rem;
  color: #2196f3;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemQuantity = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const ItemName = styled.p`
  font-size: 0.9rem;
  color: #333;
`;

const ItemPrice = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const OrderNotes = styled.div`
  margin-top: 1rem;
`;

const NoteLabel = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const NoteText = styled.p`
  font-size: 0.9rem;
  color: #333;
`;

const OrderTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const TotalLabel = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const TotalAmount = styled.p`
  font-size: 1.1rem;
  color: #333;
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const StatusBadge = styled.span`
  padding: 0.35rem 0.75rem;
  border-radius: 1rem;
  font-weight: bold;
  font-size: 0.875rem;
  color: white;
  background-color: ${props => {
    switch (props.color) {
      case 'PENDING': return '#ff9800';
      case 'PREPARING': return '#2196f3';
      case 'READY': return '#4caf50';
      case 'COMPLETED': return '#4caf50';
      case 'CANCELLED': return '#f44336';
      default: return '#9e9e9e';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
`;

const OrderItemsTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

// Removed duplicate OrderItem declaration

const OrderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
`;

const PrepareButton = styled(ActionButton)`
  background-color: #2196f3;
  color: white;
  
  &:hover {
    background-color: #1976d2;
  }
`;

const ReadyButton = styled(ActionButton)`
  background-color: #4caf50;
  color: white;
  
  &:hover {
    background-color: #388e3c;
  }
`;

const CompleteButton = styled(ActionButton)`
  background-color: #4caf50;
  color: white;
  
  &:hover {
    background-color: #388e3c;
  }
`;

const CancelButton = styled(ActionButton)`
  background-color: #f44336;
  color: white;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

export default MyOrdersPage;
