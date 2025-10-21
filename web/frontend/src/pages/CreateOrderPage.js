import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPlus, FiMinus, FiTrash2, FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import { OrderContext } from '../contexts/OrderContext';
import AnimatedBackground from '../components/AnimatedBackground';

// Import food images
import hamburgerImg from '../assets/images/Hamburger.jpg';
import cheeseburgerImg from '../assets/images/Cheeseburger.jpg';
import chickenSandwichImg from '../assets/images/Chicken Sandwich.jpg';
import pizzaSliceImg from '../assets/images/Pizza Slice.jpg';
import pastaImg from '../assets/images/Pasta.jpg';
import frenchFriesImg from '../assets/images/French Fries.jpg';
import onionRingsImg from '../assets/images/Onion Rings.jpg';
import caesarSaladImg from '../assets/images/Caesar Salad.jpg';
import softDrinkImg from '../assets/images/Soft Drink.jpg';
import icedTeaImg from '../assets/images/Iced Tea.jpg';
import coffeeImg from '../assets/images/Coffee.jpg';
import milkshakeImg from '../assets/images/Milkshake.jpg';
import chocolateCakeImg from '../assets/images/Chocolate Cake.jpg';
import iceCreamImg from '../assets/images/Ice Cream.jpg';
import applePieImg from '../assets/images/Apple Pie.jpg';

const MENU_ITEMS = [
  { id: 1, name: 'Hamburger', price: 5.99, category: 'Main Course', image: hamburgerImg },
  { id: 2, name: 'Cheeseburger', price: 6.99, category: 'Main Course', image: cheeseburgerImg },
  { id: 3, name: 'Chicken Sandwich', price: 5.49, category: 'Main Course', image: chickenSandwichImg },
  { id: 4, name: 'Pizza Slice', price: 3.99, category: 'Main Course', image: pizzaSliceImg },
  { id: 5, name: 'Pasta', price: 7.99, category: 'Main Course', image: pastaImg },
  { id: 6, name: 'French Fries', price: 2.49, category: 'Sides', image: frenchFriesImg },
  { id: 7, name: 'Onion Rings', price: 2.99, category: 'Sides', image: onionRingsImg },
  { id: 8, name: 'Caesar Salad', price: 4.99, category: 'Sides', image: caesarSaladImg },
  { id: 9, name: 'Soft Drink', price: 1.49, category: 'Beverages', image: softDrinkImg },
  { id: 10, name: 'Iced Tea', price: 1.99, category: 'Beverages', image: icedTeaImg },
  { id: 11, name: 'Coffee', price: 2.29, category: 'Beverages', image: coffeeImg },
  { id: 12, name: 'Milkshake', price: 3.49, category: 'Beverages', image: milkshakeImg },
  { id: 13, name: 'Chocolate Cake', price: 3.99, category: 'Desserts', image: chocolateCakeImg },
  { id: 14, name: 'Ice Cream', price: 2.99, category: 'Desserts', image: iceCreamImg },
  { id: 15, name: 'Apple Pie', price: 3.49, category: 'Desserts', image: applePieImg },
];

const CreateOrderPage = () => {
  const { createOrder } = useContext(OrderContext);
  const navigate = useNavigate();
  
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get unique categories from menu items
  const categories = ['All', ...new Set(MENU_ITEMS.map(item => item.category))];
  
  // Filter menu items by category and search term
  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Calculate total price
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const handleAddToCart = (menuItem) => {
    setCart(prevCart => {
      // Check if item already exists in cart
      const existingItem = prevCart.find(item => item.id === menuItem.id);
      
      if (existingItem) {
        // Update quantity if item exists
        return prevCart.map(item => 
          item.id === menuItem.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item to cart
        return [...prevCart, { ...menuItem, quantity: 1 }];
      }
    });
  };
  
  const handleIncreaseQuantity = (itemId) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      )
    );
  };
  
  const handleDecreaseQuantity = (itemId) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ).filter(item => !(item.id === itemId && item.quantity === 1))
    );
  };
  
  const handleRemoveFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };
  
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (customerName.trim() === '') {
      alert('Please enter a customer name');
      return;
    }
    
    if (cart.length === 0) {
      alert('Please add at least one item to your order');
      return;
    }
    
    setIsSubmitting(true);
    
    // Format items for backend
    const itemsString = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');
    
    // Create order object
    const orderData = {
      customerName,
      totalPrice,
      items: itemsString
    };
    
    try {
      const result = await createOrder(orderData);
      if (result) {
        // Navigate to order details page
        navigate(`/orders/${result.userID}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <PageContainer>
      <AnimatedBackground theme="food" />
      <BackButton onClick={() => navigate(-1)}>
        <FiArrowLeft />
        <span>Back</span>
      </BackButton>
      
      <PageTitle>Create New Order</PageTitle>
      
      <OrderFormLayout>
        <MenuSection>
          <SectionTitle>Menu Items</SectionTitle>
          
          <SearchInput 
            type="text" 
            placeholder="Search menu items..." 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          
          <CategoriesContainer>
            {categories.map(category => (
              <CategoryButton 
                key={category}
                active={activeCategory === category}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </CategoryButton>
            ))}
          </CategoriesContainer>
          
          <MenuGrid>
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuItem onClick={() => handleAddToCart(item)}>
                  <MenuItemImage src={item.image} alt={item.name} />
                  <MenuItemName>{item.name}</MenuItemName>
                  <MenuItemPrice>${item.price.toFixed(2)}</MenuItemPrice>
                  <MenuItemCategory>{item.category}</MenuItemCategory>
                  <AddButton>
                    <FiPlus />
                    <span>Add</span>
                  </AddButton>
                </MenuItem>
              </motion.div>
            ))}
          </MenuGrid>
        </MenuSection>
        
        <OrderSection>
          <SectionTitle>Order Summary</SectionTitle>
          
          <CustomerInfoContainer>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input 
              id="customerName"
              type="text" 
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </CustomerInfoContainer>
          
          <CartContainer>
            <CartHeader>
              <CartTitle>Cart Items</CartTitle>
              {cart.length > 0 && (
                <ClearCartButton onClick={() => setCart([])}>
                  Clear All
                </ClearCartButton>
              )}
            </CartHeader>
            
            {cart.length === 0 ? (
              <EmptyCart>
                <FiShoppingCart />
                <EmptyCartText>Your cart is empty</EmptyCartText>
                <EmptyCartSubtext>Add items from the menu</EmptyCartSubtext>
              </EmptyCart>
            ) : (
              <CartItemsList>
                {cart.map(item => (
                  <CartItem key={item.id}>
                    <CartItemInfo>
                      <CartItemName>{item.name}</CartItemName>
                      <CartItemPrice>${(item.price * item.quantity).toFixed(2)}</CartItemPrice>
                    </CartItemInfo>
                    <CartItemActionsContainer>
                      <QuantityControl>
                        <QuantityButton onClick={() => handleDecreaseQuantity(item.id)}>
                          <FiMinus />
                        </QuantityButton>
                        <QuantityValue>{item.quantity}</QuantityValue>
                        <QuantityButton onClick={() => handleIncreaseQuantity(item.id)}>
                          <FiPlus />
                        </QuantityButton>
                      </QuantityControl>
                      <RemoveButton onClick={() => handleRemoveFromCart(item.id)}>
                        <FiTrash2 />
                      </RemoveButton>
                    </CartItemActionsContainer>
                  </CartItem>
                ))}
              </CartItemsList>
            )}
          </CartContainer>
          
          <TotalContainer>
            <TotalLabel>Total</TotalLabel>
            <TotalValue>${totalPrice.toFixed(2)}</TotalValue>
          </TotalContainer>
          
          <SubmitButton 
            onClick={handleSubmit}
            disabled={isSubmitting || cart.length === 0 || customerName.trim() === ''}
          >
            {isSubmitting ? 'Processing...' : 'Place Order'}
          </SubmitButton>
        </OrderSection>
      </OrderFormLayout>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  padding: 2rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const OrderSection = styled.div`
  width: 350px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 2rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  align-self: flex-start;

  @media (max-width: 768px) {
    width: 100%;
    position: relative;
    top: 0;
    margin-top: 2rem;
    max-height: none;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: var(--border-radius);
  color: var(--primary);
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  span {
    margin-left: 0.5rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--dark);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const OrderFormLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 992px) {
    grid-template-columns: 3fr 2fr;
  }
`;

const MenuItem = styled.div`
  position: relative;
  padding: 1rem;
  border-radius: var(--border-radius);
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const MenuItemImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  margin-bottom: 0.75rem;
`;

const MenuItemName = styled.h3`
  font-size: 1rem;
  color: var(--text-dark);
  margin: 0 1rem 0.5rem;
  font-weight: 600;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-dark);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const MenuSection = styled.div`
  flex: 1;
  margin-right: 2rem;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 2rem;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray);
  border-radius: var(--border-radius);
  font-size: 1rem;
  margin-bottom: 1.5rem;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const CategoriesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const CategoryButton = styled.button`
  background-color: ${props => props.active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.8)'};
  color: ${props => props.active ? 'white' : 'var(--text-dark)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'var(--gray)'};
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(3px);
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.95)'};
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }
`;

const MenuItemCategory = styled.div`
  font-size: 0.8rem;
  color: var(--gray-dark);
  margin: 0 1rem 1rem;
`;

const MenuItemPrice = styled.div`
  font-size: 0.9rem;
  color: var(--primary);
  font-weight: 600;
  margin: 0 1rem 0.5rem;
`;

const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--light-gray);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const CartItemActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;



const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    background-color: var(--gray);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CustomerInfoContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray);
  border-radius: var(--border-radius);
  font-size: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const CartContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const CartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CartTitle = styled.h3`
  font-size: 1.1rem;
  color: var(--text-dark);
  margin: 0;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
`;

const ClearCartButton = styled.button`
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  
  &:hover {
    text-decoration: underline;
    color: var(--primary-dark);
    transform: translateY(-1px);
  }
`;

const EmptyCart = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: rgba(240, 240, 240, 0.7);
  border-radius: var(--border-radius);
  color: var(--gray-dark);
  backdrop-filter: blur(5px);
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.05);
  
  svg {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

const EmptyCartText = styled.p`
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const EmptyCartSubtext = styled.p`
  font-size: 0.9rem;
  color: var(--gray-dark);
`;

const CartItemsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--gray);
  border-radius: var(--border-radius);
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
`;

const CartItemInfo = styled.div`
  flex: 1;
`;

const CartItemName = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const CartItemPrice = styled.div`
  font-weight: 700;
  color: var(--primary);
`;

const CartItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid var(--gray);
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const QuantityButton = styled.button`
  background-color: var(--light-gray);
  border: none;
  color: var(--text-dark);
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--gray);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const QuantityValue = styled.div`
  width: 2rem;
  text-align: center;
  font-weight: 600;
`;

const RemoveButton = styled.button`
  background-color: transparent;
  border: none;
  color: #f44336;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(244, 67, 54, 0.1);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const TotalContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-top: 1px solid var(--gray);
  margin-bottom: 1.5rem;
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(3px);
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  padding: 1rem;
  margin: 0 -1rem 1.5rem;
`;

const TotalLabel = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-dark);
`;

const TotalValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
`;

const AddButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--primary);
  color: white;
  padding: 0.75rem;
  font-size: 0.9rem;
  margin-top: auto;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  ${MenuItem}:hover & {
    background-color: var(--primary-dark);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }
  
  svg {
    font-size: 1rem;
  }
`;

export default CreateOrderPage;
