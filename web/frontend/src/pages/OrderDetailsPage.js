import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit2, FiSave, FiXCircle, FiCheckCircle, FiClock, FiAlertTriangle, FiPackage, FiTruck, FiCheck, FiX } from 'react-icons/fi';
import { OrderContext } from '../contexts/OrderContext';
import { toast } from 'react-toastify';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchOrderById, updateOrder, updateOrderStatus, deleteOrder } = useContext(OrderContext);
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      try {
        const data = await fetchOrderById(id);
        if (data) {
          setOrder(data);
          setEditedOrder(data);
          setError(null);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError('Failed to load order details');
        console.error('Error loading order details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, fetchOrderById]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedOrder(order);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedOrder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = async (newStatus) => {
    if (isUpdatingStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      const updatedOrder = await updateOrderStatus(id, newStatus);
      if (updatedOrder) {
        setOrder(updatedOrder);
        setEditedOrder(updatedOrder);
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (err) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const updatedOrder = await updateOrder(id, editedOrder);
      if (updatedOrder) {
        setOrder(updatedOrder);
        setIsEditing(false);
        toast.success('Order updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update order');
      console.error('Error updating order:', err);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      const success = await deleteOrder(id);
      if (success) {
        toast.success('Order deleted successfully');
        navigate('/orders');
      }
    } catch (err) {
      toast.error('Failed to delete order');
      console.error('Error deleting order:', err);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingText>Loading order details...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error || !order) {
    return (
      <ErrorContainer>
        <ErrorIcon>
          <FiAlertTriangle />
        </ErrorIcon>
        <ErrorTitle>Error Loading Order</ErrorTitle>
        <ErrorMessage>{error || 'Order not found'}</ErrorMessage>
        <BackButton onClick={() => navigate('/orders')}>
          Back to Orders
        </BackButton>
      </ErrorContainer>
    );
  }

  return (
    <PageContainer>
      <BackNavigation onClick={() => navigate('/orders')}>
        <FiArrowLeft />
        <span>Back to Orders</span>
      </BackNavigation>
      
      <OrderDetailHeader>
        <HeaderLeft>
          <OrderDetailTitle>Order #{order.userID}</OrderDetailTitle>
          <OrderDate>
            <FiClock />
            <span>Placed on {formatDate(order.orderDate)}</span>
          </OrderDate>
        </HeaderLeft>
        <HeaderRight>
          <OrderStatusBadge status={order.status}>
            {order.status === 'PREPARING' && <FiPackage />}
            {order.status === 'READY' && <FiTruck />}
            {order.status === 'COMPLETED' && <FiCheck />}
            {order.status === 'CANCELLED' && <FiX />}
            <span>{order.status}</span>
          </OrderStatusBadge>
        </HeaderRight>
      </OrderDetailHeader>
      
      <OrderDetailsContent>
        <StatusManagementCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          
          <StatusProgressContainer>
            <StatusProgressTrack>
              <StatusProgressBar status={order.status} />
            </StatusProgressTrack>
            
            <StatusSteps>
              <StatusStep completed={['PREPARING', 'READY', 'COMPLETED'].includes(order.status)} active={order.status === 'PREPARING'}>
                <StatusStepIcon completed={['PREPARING', 'READY', 'COMPLETED'].includes(order.status)} active={order.status === 'PREPARING'}>
                  <FiPackage />
                </StatusStepIcon>
                <StatusStepLabel>Preparing</StatusStepLabel>
              </StatusStep>
              
              <StatusStep completed={['READY', 'COMPLETED'].includes(order.status)} active={order.status === 'READY'}>
                <StatusStepIcon completed={['READY', 'COMPLETED'].includes(order.status)} active={order.status === 'READY'}>
                  <FiTruck />
                </StatusStepIcon>
                <StatusStepLabel>Ready</StatusStepLabel>
              </StatusStep>
              
              <StatusStep completed={['COMPLETED'].includes(order.status)} active={order.status === 'COMPLETED'}>
                <StatusStepIcon completed={['COMPLETED'].includes(order.status)} active={order.status === 'COMPLETED'}>
                  <FiCheck />
                </StatusStepIcon>
                <StatusStepLabel>Completed</StatusStepLabel>
              </StatusStep>
              
              {order.status === 'CANCELLED' && (
                <StatusStepCancelled>
                  <StatusStepIcon cancelled>
                    <FiX />
                  </StatusStepIcon>
                  <StatusStepLabel>Cancelled</StatusStepLabel>
                </StatusStepCancelled>
              )}
            </StatusSteps>
          </StatusProgressContainer>
          
          <StatusUpdateSection>
            <StatusUpdateTitle>Update Status</StatusUpdateTitle>
            <StatusButtonsContainer>
              <StatusButton 
                preparing
                disabled={order.status === 'PREPARING' || order.status === 'CANCELLED' || isUpdatingStatus}
                onClick={() => handleStatusChange('PREPARING')}
              >
                <FiPackage />
                <span>Preparing</span>
              </StatusButton>
              
              <StatusButton 
                ready
                disabled={order.status === 'READY' || order.status === 'CANCELLED' || isUpdatingStatus}
                onClick={() => handleStatusChange('READY')}
              >
                <FiTruck />
                <span>Ready</span>
              </StatusButton>
              
              <StatusButton 
                completed
                disabled={order.status === 'COMPLETED' || order.status === 'CANCELLED' || isUpdatingStatus}
                onClick={() => handleStatusChange('COMPLETED')}
              >
                <FiCheck />
                <span>Completed</span>
              </StatusButton>
              
              <StatusButton 
                cancelled
                disabled={order.status === 'CANCELLED' || isUpdatingStatus}
                onClick={() => handleStatusChange('CANCELLED')}
              >
                <FiX />
                <span>Cancel Order</span>
              </StatusButton>
            </StatusButtonsContainer>
          </StatusUpdateSection>
        </StatusManagementCard>
        
        <OrderInfoCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
            {!isEditing ? (
              <EditButton onClick={handleEditClick}>
                <FiEdit2 />
                <span>Edit</span>
              </EditButton>
            ) : (
              <EditActions>
                <SaveButton onClick={handleSaveChanges}>
                  <FiSave />
                  <span>Save</span>
                </SaveButton>
                <CancelButton onClick={handleCancelEdit}>
                  <FiXCircle />
                  <span>Cancel</span>
                </CancelButton>
              </EditActions>
            )}
          </CardHeader>
          
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Customer Name</InfoLabel>
              {isEditing ? (
                <Input
                  type="text"
                  name="customerName"
                  value={editedOrder.customerName || ''}
                  onChange={handleInputChange}
                />
              ) : (
                <InfoValue>{order.customerName}</InfoValue>
              )}
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Total Price</InfoLabel>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  name="totalPrice"
                  value={editedOrder.totalPrice || 0}
                  onChange={handleInputChange}
                />
              ) : (
                <InfoValue>${order.totalPrice?.toFixed(2)}</InfoValue>
              )}
            </InfoItem>
            
            <InfoItem fullWidth>
              <InfoLabel>Order Items</InfoLabel>
              {isEditing ? (
                <TextArea
                  name="items"
                  value={editedOrder.items || ''}
                  onChange={handleInputChange}
                  rows={3}
                />
              ) : (
                <InfoValue>{order.items}</InfoValue>
              )}
            </InfoItem>
          </InfoGrid>
        </OrderInfoCard>
        
        <ActionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <CardTitle>Order Actions</CardTitle>
          
          <ActionSection>
            <ActionSectionTitle>Update Status</ActionSectionTitle>
            <StatusButtons>
              <StatusButton 
                isPreparing
                active={order.status === 'PREPARING'}
                onClick={() => handleStatusChange('PREPARING')}
                disabled={isUpdatingStatus}
              >
                Preparing
              </StatusButton>
              <StatusButton 
                isReady
                active={order.status === 'READY'}
                onClick={() => handleStatusChange('READY')}
                disabled={isUpdatingStatus}
              >
                Ready
              </StatusButton>
              <StatusButton 
                isCompleted
                active={order.status === 'COMPLETED'}
                onClick={() => handleStatusChange('COMPLETED')}
                disabled={isUpdatingStatus}
              >
                Completed
              </StatusButton>
              <StatusButton 
                isCancelled
                active={order.status === 'CANCELLED'}
                onClick={() => handleStatusChange('CANCELLED')}
                disabled={isUpdatingStatus}
              >
                Cancelled
              </StatusButton>
            </StatusButtons>
          </ActionSection>
          
          <ActionSection>
            <ActionSectionTitle>Danger Zone</ActionSectionTitle>
            {isConfirmingDelete ? (
              <ConfirmDeleteContainer>
                <ConfirmDeleteMessage>
                  Are you sure you want to delete this order? This action cannot be undone.
                </ConfirmDeleteMessage>
                <ConfirmDeleteButtons>
                  <ConfirmDeleteButton onClick={handleDeleteOrder}>
                    Yes, Delete Order
                  </ConfirmDeleteButton>
                  <CancelDeleteButton onClick={() => setIsConfirmingDelete(false)}>
                    Cancel
                  </CancelDeleteButton>
                </ConfirmDeleteButtons>
              </ConfirmDeleteContainer>
            ) : (
              <DeleteButton onClick={() => setIsConfirmingDelete(true)}>
                Delete Order
              </DeleteButton>
            )}
          </ActionSection>
        </ActionCard>
      </OrderDetailsContent>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  padding: 2rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const BackNavigation = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: var(--primary);
  padding: 0.5rem;
  border: none;
  margin-bottom: 1.5rem;
  font-weight: 500;
  
  &:hover {
    background-color: transparent;
    color: var(--primary-light);
    transform: translateX(-3px);
  }
`;

const OrderDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const HeaderLeft = styled.div``;

const HeaderRight = styled.div``;

const OrderDetailTitle = styled.h1`
  font-size: 2rem;
  color: var(--primary);
  margin-bottom: 0.5rem;
`;

const OrderDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-dark);
  font-size: 0.95rem;
`;

const OrderStatusBadge = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => {
    switch (props.status) {
      case 'PREPARING': return 'rgba(59, 130, 246, 0.1)';
      case 'READY': return 'rgba(245, 158, 11, 0.1)';
      case 'COMPLETED': return 'rgba(16, 185, 129, 0.1)';
      case 'CANCELLED': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'PREPARING': return '#3b82f6';
      case 'READY': return '#f59e0b';
      case 'COMPLETED': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  
  svg {
    margin-right: 0.5rem;
  }
`;

const OrderDetailsContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 992px) {
    grid-template-columns: 3fr 2fr;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
`;

const LoadingText = styled.div`
  font-size: 1.25rem;
  color: var(--gray-dark);
`;

const ErrorContainer = styled.div`
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  text-align: center;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  color: #f44336;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text-dark);
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  color: var(--text-dark);
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background-color: var(--primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--primary-light);
    transform: translateY(-2px);
  }
`;

const OrderInfoCard = styled(motion.div)`
  background-color: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow);
`;

const ActionCard = styled(motion.div)`
  background-color: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow);
  height: fit-content;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  color: var(--primary);
  margin-bottom: 1.5rem;
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: transparent;
  color: var(--primary);
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--primary);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  
  &:hover {
    background-color: rgba(128, 0, 32, 0.1);
    transform: none;
  }
`;

const EditActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background-color: #4caf50;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  
  &:hover {
    background-color: #3d8b40;
    transform: none;
  }
`;

const CancelButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background-color: var(--gray);
  color: var(--text-dark);
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  
  &:hover {
    background-color: var(--gray-dark);
    color: white;
    transform: none;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const InfoItem = styled.div`
  grid-column: ${props => props.fullWidth ? '1 / -1' : 'auto'};
`;

const InfoLabel = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
  font-size: 0.95rem;
`;

const InfoValue = styled.div`
  color: var(--text-dark);
  font-size: 1.1rem;
  word-break: break-word;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray);
  border-radius: var(--border-radius);
  font-size: 1rem;
  
  &:focus {
    border-color: var(--primary);
    outline: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray);
  border-radius: var(--border-radius);
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    border-color: var(--primary);
    outline: none;
  }
`;

const ActionSection = styled.div`
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--gray);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const ActionSectionTitle = styled.h3`
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 1rem;
`;

const StatusButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const DeleteButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: white;
  color: #f44336;
  border: 1px solid #f44336;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #ffebee;
    transform: none;
  }
`;

const ConfirmDeleteContainer = styled.div`
  border: 1px solid #f44336;
  border-radius: var(--border-radius);
  padding: 1rem;
  background-color: #ffebee;
`;

const ConfirmDeleteMessage = styled.p`
  color: #f44336;
  margin-bottom: 1rem;
  font-size: 0.95rem;
`;

const ConfirmDeleteButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const ConfirmDeleteButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  
  &:hover {
    background-color: #e53935;
    transform: none;
  }
`;

const CancelDeleteButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background-color: white;
  color: var(--text-dark);
  border: 1px solid var(--gray);
  border-radius: var(--border-radius);
  font-weight: 500;
  
  &:hover {
    background-color: var(--gray);
    transform: none;
  }
`;

// Status Management Styled Components
const StatusManagementCard = styled(motion.div)`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const StatusProgressContainer = styled.div`
  margin: 2rem 0;
`;

const StatusProgressTrack = styled.div`
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  position: relative;
  margin: 0 1rem 1.5rem;
`;

const StatusProgressBar = styled.div`
  height: 100%;
  border-radius: 2px;
  background-color: ${props => {
    if (props.status === 'CANCELLED') return '#ef4444';
    if (props.status === 'COMPLETED') return '#10b981';
    if (props.status === 'READY') return '#f59e0b';
    return '#3b82f6';
  }};
  width: ${props => {
    if (props.status === 'CANCELLED') return '100%';
    if (props.status === 'COMPLETED') return '100%';
    if (props.status === 'READY') return '66%';
    return '33%';
  }};
  transition: width 0.5s ease;
`;

const StatusSteps = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
`;

const StatusStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  opacity: ${props => (props.completed || props.active) ? 1 : 0.5};
`;

const StatusStepCancelled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  right: 0;
  top: 0;
`;

const StatusStepIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  background-color: ${props => {
    if (props.cancelled) return '#ef4444';
    if (props.completed) return '#10b981';
    if (props.active) return '#3b82f6';
    return '#e5e7eb';
  }};
  color: ${props => (props.completed || props.active || props.cancelled) ? 'white' : '#6b7280'};
  transition: all 0.3s ease;
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const StatusStepLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
`;

const StatusUpdateSection = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const StatusUpdateTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
`;

const StatusButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const StatusButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${props => props.preparing && `
    background-color: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    &:hover:not(:disabled) {
      background-color: rgba(59, 130, 246, 0.2);
    }
  `}
  
  ${props => props.ready && `
    background-color: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    &:hover:not(:disabled) {
      background-color: rgba(245, 158, 11, 0.2);
    }
  `}
  
  ${props => props.completed && `
    background-color: rgba(16, 185, 129, 0.1);
    color: #10b981;
    &:hover:not(:disabled) {
      background-color: rgba(16, 185, 129, 0.2);
    }
  `}
  
  ${props => props.cancelled && `
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    &:hover:not(:disabled) {
      background-color: rgba(239, 68, 68, 0.2);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

export default OrderDetailsPage;
