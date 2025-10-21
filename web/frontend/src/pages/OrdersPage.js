import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEdit2, FiTrash2, FiFilter, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { OrderContext } from '../contexts/OrderContext';
import { toast } from 'react-toastify';

const OrdersPage = () => {
  const { orders, loading, error, fetchOrders, deleteOrder } = useContext(OrderContext);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(null);

  useEffect(() => {
    // Apply filters
    let result = [...orders];
    
    // Filter by status
    if (statusFilter !== 'ALL') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Filter by search term (customer name or items)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(order => 
        order.customerName?.toLowerCase().includes(term) || 
        order.items?.toLowerCase().includes(term)
      );
    }
    
    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    setFilteredOrders(result);
  }, [orders, statusFilter, searchTerm]);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRefresh = () => {
    fetchOrders();
    toast.info('Orders refreshed');
  };

  const handleDeleteClick = (orderId) => {
    setIsConfirmingDelete(orderId);
    // Automatically cancel after 5 seconds
    setTimeout(() => {
      setIsConfirmingDelete(null);
    }, 5000);
  };

  const handleConfirmDelete = async (orderId) => {
    const success = await deleteOrder(orderId);
    if (success) {
      setIsConfirmingDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmingDelete(null);
  };

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <PageContainer>
      <HeaderSection>
        <PageTitle>Orders Management</PageTitle>
        <SubTitle>View and manage all customer orders</SubTitle>
      </HeaderSection>

      <FiltersContainer>
        <SearchContainer>
          <SearchIcon>
            <FiSearch />
          </SearchIcon>
          <SearchInput 
            type="text" 
            placeholder="Search by customer name or items..." 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </SearchContainer>
        
        <FiltersWrapper>
          <FilterLabel>
            <FiFilter />
            <span>Filter by status:</span>
          </FilterLabel>
          <FilterButtons>
            <FilterButton 
              active={statusFilter === 'ALL'} 
              onClick={() => handleStatusFilterChange('ALL')}
            >
              All
            </FilterButton>
            <FilterButton 
              active={statusFilter === 'PREPARING'} 
              onClick={() => handleStatusFilterChange('PREPARING')}
              preparing
            >
              Preparing
            </FilterButton>
            <FilterButton 
              active={statusFilter === 'READY'} 
              onClick={() => handleStatusFilterChange('READY')}
              ready
            >
              Ready
            </FilterButton>
            <FilterButton 
              active={statusFilter === 'COMPLETED'} 
              onClick={() => handleStatusFilterChange('COMPLETED')}
              completed
            >
              Completed
            </FilterButton>
            <FilterButton 
              active={statusFilter === 'CANCELLED'} 
              onClick={() => handleStatusFilterChange('CANCELLED')}
              cancelled
            >
              Cancelled
            </FilterButton>
          </FilterButtons>
        </FiltersWrapper>
        
        <RefreshButton onClick={handleRefresh}>
          <FiRefreshCw />
          <span>Refresh</span>
        </RefreshButton>
      </FiltersContainer>

      <ContentSection>
        {loading ? (
          <LoadingMessage>Loading orders...</LoadingMessage>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : filteredOrders.length === 0 ? (
          <EmptyState>
            <EmptyStateText>No orders found</EmptyStateText>
            <Link to="/create-order">
              <CreateOrderButton>Create New Order</CreateOrderButton>
            </Link>
          </EmptyState>
        ) : (
          <OrdersGrid>
            <AnimatePresence>
              {filteredOrders.map(order => (
                <OrderCard
                  key={order.userID}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <OrderHeader>
                    <OrderId>Order #{order.userID}</OrderId>
                    <OrderStatus status={order.status}>{order.status}</OrderStatus>
                  </OrderHeader>
                  
                  <OrderInfo>
                    <OrderInfoItem>
                      <OrderInfoLabel>Customer:</OrderInfoLabel>
                      <OrderInfoValue>{order.customerName}</OrderInfoValue>
                    </OrderInfoItem>
                    <OrderInfoItem>
                      <OrderInfoLabel>Date:</OrderInfoLabel>
                      <OrderInfoValue>{formatDate(order.orderDate)}</OrderInfoValue>
                    </OrderInfoItem>
                    <OrderInfoItem>
                      <OrderInfoLabel>Total:</OrderInfoLabel>
                      <OrderInfoValue>${order.totalPrice.toFixed(2)}</OrderInfoValue>
                    </OrderInfoItem>
                    <OrderInfoItem>
                      <OrderInfoLabel>Items:</OrderInfoLabel>
                      <OrderInfoValue>{order.items}</OrderInfoValue>
                    </OrderInfoItem>
                  </OrderInfo>
                  
                  <OrderActions>
                    <ActionButton as={Link} to={`/orders/${order.userID}`} view>
                      <FiEye />
                      <span>View</span>
                    </ActionButton>
                    <ActionButton as={Link} to={`/orders/${order.userID}`} edit>
                      <FiEdit2 />
                      <span>Edit</span>
                    </ActionButton>
                    {isConfirmingDelete === order.userID ? (
                      <ConfirmDeleteContainer>
                        <ConfirmText>Delete?</ConfirmText>
                        <ConfirmButtons>
                          <ConfirmButton onClick={() => handleConfirmDelete(order.userID)}>Yes</ConfirmButton>
                          <CancelButton onClick={handleCancelDelete}>No</CancelButton>
                        </ConfirmButtons>
                      </ConfirmDeleteContainer>
                    ) : (
                      <ActionButton onClick={() => handleDeleteClick(order.userID)} delete>
                        <FiTrash2 />
                        <span>Delete</span>
                      </ActionButton>
                    )}
                  </OrderActions>
                </OrderCard>
              ))}
            </AnimatePresence>
          </OrdersGrid>
        )}
      </ContentSection>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  padding: 2rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: var(--primary);
  margin-bottom: 0.5rem;
`;

const SubTitle = styled.p`
  color: var(--text-dark);
  font-size: 1rem;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid var(--gray);
  border-radius: var(--border-radius);
  padding: 0 1rem;
  flex: 1;
  max-width: 400px;
`;

const SearchIcon = styled.div`
  color: var(--gray-dark);
  margin-right: 0.5rem;
`;

const SearchInput = styled.input`
  border: none;
  padding: 0.75rem 0;
  width: 100%;
  
  &:focus {
    outline: none;
    box-shadow: none;
  }
`;

const FiltersWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

const FilterLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-dark);
  font-weight: 500;
  
  svg {
    color: var(--primary);
  }
`;

const FilterButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FilterButton = styled.button`
  background-color: ${props => props.active ? 'var(--primary)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-dark)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'var(--gray)'};
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary)' : 'var(--gray)'};
    transform: none;
  }
  
  ${props => props.preparing && !props.active && `
    border-color: #ff9800;
    color: #ff9800;
  `}
  
  ${props => props.ready && !props.active && `
    border-color: #2196f3;
    color: #2196f3;
  `}
  
  ${props => props.completed && !props.active && `
    border-color: #4caf50;
    color: #4caf50;
  `}
  
  ${props => props.cancelled && !props.active && `
    border-color: #f44336;
    color: #f44336;
  `}
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 0.75rem 1rem;
  
  &:hover {
    background-color: rgba(128, 0, 32, 0.1);
    transform: none;
  }
`;

const ContentSection = styled.div`
  min-height: 400px;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.25rem;
  color: var(--gray-dark);
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: #ffebee;
  color: #f44336;
  border-radius: var(--border-radius);
  border-left: 4px solid #f44336;
  margin-bottom: 1.5rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  height: 400px;
  background-color: var(--gray);
  border-radius: var(--border-radius);
  padding: 2rem;
`;

const EmptyStateText = styled.p`
  font-size: 1.25rem;
  color: var(--gray-dark);
`;

const CreateOrderButton = styled.button`
  font-weight: 600;
`;

const OrdersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const OrderCard = styled(motion.div)`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--primary-dark);
  color: white;
`;

const OrderId = styled.div`
  font-weight: 600;
`;

const OrderStatus = styled.div`
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch(props.status) {
      case 'PREPARING':
        return `
          background-color: #fff3e0;
          color: #ff9800;
        `;
      case 'READY':
        return `
          background-color: #e3f2fd;
          color: #2196f3;
        `;
      case 'COMPLETED':
        return `
          background-color: #e8f5e9;
          color: #4caf50;
        `;
      case 'CANCELLED':
        return `
          background-color: #ffebee;
          color: #f44336;
        `;
      default:
        return `
          background-color: var(--gray);
          color: var(--text-dark);
        `;
    }
  }}
`;

const OrderInfo = styled.div`
  padding: 1rem;
  flex-grow: 1;
`;

const OrderInfoItem = styled.div`
  margin-bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: baseline;
  }
`;

const OrderInfoLabel = styled.span`
  font-weight: 600;
  color: var(--text-dark);
  margin-right: 0.5rem;
  min-width: 80px;
`;

const OrderInfoValue = styled.span`
  color: var(--text-dark);
  word-break: break-word;
`;

const OrderActions = styled.div`
  display: flex;
  border-top: 1px solid var(--gray);
  background-color: #f9f9f9;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  flex: 1;
  padding: 0.75rem;
  font-size: 0.875rem;
  border-radius: 0;
  background-color: transparent;
  color: var(--text-dark);
  transition: all 0.2s ease;
  border-right: 1px solid var(--gray);
  
  &:last-child {
    border-right: none;
  }
  
  &:hover {
    transform: none;
  }
  
  ${props => props.view && `
    &:hover {
      background-color: #e3f2fd;
      color: #2196f3;
    }
  `}
  
  ${props => props.edit && `
    &:hover {
      background-color: #e8f5e9;
      color: #4caf50;
    }
  `}
  
  ${props => props.delete && `
    &:hover {
      background-color: #ffebee;
      color: #f44336;
    }
  `}
`;

const ConfirmDeleteContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background-color: #ffebee;
`;

const ConfirmText = styled.span`
  font-size: 0.75rem;
  color: #f44336;
  font-weight: 600;
  margin-bottom: 0.35rem;
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ConfirmButton = styled.button`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background-color: #f44336;
  color: white;
`;

const CancelButton = styled.button`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--gray);
  color: var(--text-dark);
`;

export default OrdersPage;
