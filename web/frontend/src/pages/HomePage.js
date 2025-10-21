import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShoppingBag, FiClock, FiCheckCircle, FiShoppingCart, FiUsers, FiList, FiPlusCircle, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';

// Import food images for the hero section
import hamburgerImg from '../assets/images/Hamburger.jpg';
import pizzaSliceImg from '../assets/images/Pizza Slice.jpg';
import pastaImg from '../assets/images/Pasta.jpg';
import caesarSaladImg from '../assets/images/Caesar Salad.jpg';
import chocolateCakeImg from '../assets/images/Chocolate Cake.jpg';

const HomePage = () => {
  const { isAuthenticated, currentUser, isSeller, isCustomer } = useAuth();
  
  return (
    <Container>
      <AnimatedBackground theme="food" />
      <HeroSection>
        <HeroContent
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <HeroTitle>
            {isAuthenticated 
              ? `Welcome back, ${currentUser?.name || 'User'}!` 
              : 'Welcome to WildEats Online Canteen'}
          </HeroTitle>
          <HeroSubtitle>
            {isAuthenticated 
              ? isSeller 
                ? 'Manage your shop and fulfill orders' 
                : 'Your one-stop solution for campus dining'
              : 'Your one-stop solution for campus dining'}
          </HeroSubtitle>
          <HeroDescription>
            {isAuthenticated 
              ? isSeller 
                ? 'Manage your shop, add food items, and process customer orders all in one place.'
                : 'Browse shops, place orders, and enjoy delicious meals from your favorite campus eateries.'
              : 'Log in to browse shops, place orders, and enjoy delicious meals from your favorite campus eateries.'}
          </HeroDescription>
          {isAuthenticated ? (
            <HeroCta to={isSeller ? "/my-shop" : "/shops"}>
              {isSeller ? "Manage My Shop" : "Explore Shops"}
            </HeroCta>
          ) : (
            <HeroCta to="/login">Log In</HeroCta>
          )}
        </HeroContent>
        <HeroImageGrid
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <HeroImageItem className="main">
            <img src={hamburgerImg} alt="Hamburger" />
          </HeroImageItem>
          <HeroImageItem>
            <img src={pizzaSliceImg} alt="Pizza Slice" />
          </HeroImageItem>
          <HeroImageItem>
            <img src={pastaImg} alt="Pasta" />
          </HeroImageItem>
          <HeroImageItem>
            <img src={caesarSaladImg} alt="Caesar Salad" />
          </HeroImageItem>
          <HeroImageItem>
            <img src={chocolateCakeImg} alt="Chocolate Cake" />
          </HeroImageItem>
        </HeroImageGrid>
      </HeroSection>

      <FeaturesSection>
        <SectionTitle>{isAuthenticated ? "Quick Actions" : "Get Started"}</SectionTitle>
        <FeaturesGrid>
          {!isAuthenticated ? (
            // Not authenticated - show login/register options
            <>
              <FeatureCard to="/login">
                <FeatureIcon>
                  <FiLogIn />
                </FeatureIcon>
                <FeatureTitle>Log In</FeatureTitle>
                <FeatureDescription>Access your account to place orders and view history</FeatureDescription>
              </FeatureCard>
              
              <FeatureCard to="/register">
                <FeatureIcon>
                  <FiUserPlus />
                </FeatureIcon>
                <FeatureTitle>Register</FeatureTitle>
                <FeatureDescription>Create a new account to start using WildEats</FeatureDescription>
              </FeatureCard>
            </>
          ) : isSeller ? (
            // Seller options
            <>
              <FeatureCard to="/my-shop">
                <FeatureIcon>
                  <FiShoppingBag />
                </FeatureIcon>
                <FeatureTitle>My Shop</FeatureTitle>
                <FeatureDescription>Manage your shop details and food items</FeatureDescription>
              </FeatureCard>
              
              <FeatureCard to="/orders">
                <FeatureIcon>
                  <FiList />
                </FeatureIcon>
                <FeatureTitle>Incoming Orders</FeatureTitle>
                <FeatureDescription>View and process customer orders</FeatureDescription>
              </FeatureCard>
            </>
          ) : (
            // Customer options
            <>
              <FeatureCard to="/shops">
                <FeatureIcon>
                  <FiShoppingCart />
                </FeatureIcon>
                <FeatureTitle>Browse Shops</FeatureTitle>
                <FeatureDescription>Explore all available canteen shops and their offerings</FeatureDescription>
              </FeatureCard>
              
              <FeatureCard to="/orders">
                <FeatureIcon>
                  <FiList />
                </FeatureIcon>
                <FeatureTitle>View Orders</FeatureTitle>
                <FeatureDescription>Check the status of your current and past orders</FeatureDescription>
              </FeatureCard>
              
              <FeatureCard to="/create-order">
                <FeatureIcon>
                  <FiPlusCircle />
                </FeatureIcon>
                <FeatureTitle>Place Order</FeatureTitle>
                <FeatureDescription>Quickly place a new order from your favorite shops</FeatureDescription>
              </FeatureCard>
            </>
          )}
        </FeaturesGrid>
      </FeaturesSection>

      <CallToActionSection>
        <CtaContainer>
          <CtaImageContainer>
            <CtaImage src={chocolateCakeImg} alt="Delicious dessert" />
          </CtaImageContainer>
          <CtaText>
            <CtaTitle>Ready to Order?</CtaTitle>
            <CtaDescription>
              Explore our menu and place your order now for a delightful dining experience.
            </CtaDescription>
            <CtaButton to="/create-order">
              Place an Order
            </CtaButton>
          </CtaText>
        </CtaContainer>
      </CallToActionSection>

      <ManagementSection>
        <SectionTitle>Management Features</SectionTitle>
        
        <ManagementGrid>
          <ManagementCard
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            to="/shops"
          >
            <ManagementIcon className="shop">
              <FiShoppingCart />
            </ManagementIcon>
            <ManagementTitle>Shop Management</ManagementTitle>
            <ManagementDescription>
              Add, edit, and manage shops in the online canteen system.
            </ManagementDescription>
          </ManagementCard>
          
          <ManagementCard
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            to="/users"
          >
            <ManagementIcon className="user">
              <FiUsers />
            </ManagementIcon>
            <ManagementTitle>User Management</ManagementTitle>
            <ManagementDescription>
              Manage user accounts, permissions, and profiles.
            </ManagementDescription>
          </ManagementCard>
        </ManagementGrid>
      </ManagementSection>
    </Container>
  );
};

const Container = styled.div`
  max-width: 100%;
  overflow-x: hidden;
  position: relative;
  z-index: 1;
`;

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.5rem;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 2rem 1rem;
  
  @media (min-width: 992px) {
    flex-direction: row;
    justify-content: space-between;
    gap: 2rem;
    min-height: 70vh;
    max-width: 1200px;
    margin: 2rem auto;
  }
`;

const HeroContent = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;
  
  @media (min-width: 992px) {
    align-items: flex-start;
    text-align: left;
    width: 50%;
    margin-bottom: 0;
  }
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 768px) {
    font-size: 3.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-dark);
  margin-bottom: 2rem;
  max-width: 500px;
`;

const HeroDescription = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.6;
`;

const HeroCta = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--primary);
  color: var(--white);
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  
  &:hover {
    background-color: var(--primary-light);
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: translateX(4px);
  }
`;

const HeroImageGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 15px;
  width: 100%;
  max-width: 500px;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  }
  
  @media (min-width: 992px) {
    width: 50%;
  }
`;

const HeroImageItem = styled.div`
  border-radius: var(--border-radius);
  overflow: hidden;
  height: 150px;
  
  &.main {
    grid-column: span 2;
    grid-row: span 2;
    height: 315px;
  }
  
  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const FeaturesSection = styled.section`
  padding: 4rem 1.5rem;
  background-color: rgba(245, 245, 245, 0.7);
  backdrop-filter: blur(10px);
  margin: 2rem 1rem;
  border-radius: var(--border-radius);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 992px) {
    margin: 2rem auto;
    max-width: 1200px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  text-align: center;
  color: var(--text-dark);
  margin-bottom: 3rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background-color: var(--primary);
    border-radius: 3px;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FeatureCard = styled(motion.div)`
  background-color: rgba(255, 255, 255, 0.8);
  padding: 2rem 2rem 0;
  border-radius: var(--border-radius);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureIcon = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  
  &.shopping {
    background-color: rgba(128, 0, 32, 0.1);
    color: var(--primary);
  }
  
  &.clock {
    background-color: rgba(25, 118, 210, 0.1);
    color: #1976d2;
  }
  
  &.check {
    background-color: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: var(--text-dark);
`;

const FeatureDescription = styled.p`
  color: var(--text-dark);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const FeatureImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  margin-top: auto;
  transition: transform 0.5s ease;
  
  ${FeatureCard}:hover & {
    transform: scale(1.05);
  }
`;

const CallToActionSection = styled.section`
  padding: 4rem 1.5rem;
  background-color: rgba(var(--primary-rgb), 0.85);
  color: var(--white);
  backdrop-filter: blur(10px);
  margin: 2rem 1rem;
  border-radius: var(--border-radius);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  
  @media (min-width: 992px) {
    margin: 2rem auto;
    max-width: 1200px;
  }
`;

const CtaContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
    align-items: center;
  }
`;

const CtaImageContainer = styled.div`
  width: 100%;
  max-width: 300px;
  margin-bottom: 2rem;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  
  @media (min-width: 768px) {
    margin-bottom: 0;
    margin-right: 2rem;
  }
`;

const CtaImage = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const CtaText = styled.div`
  @media (min-width: 768px) {
    flex: 1;
  }
`;

const CtaTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const CtaDescription = styled.p`
  color: var(--gray);
  font-size: 1.1rem;
  max-width: 500px;
`;

const CtaButton = styled(Link)`
  background-color: var(--white);
  color: var(--primary);
  padding: 0.75rem 2rem;
  border-radius: var(--border-radius);
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  
  &:hover {
    background-color: var(--light-gray);
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
  }
`;

// Management Section Styles
const ManagementSection = styled.section`
  padding: 4rem 1.5rem;
  background-color: var(--bg-light);
`;

const ManagementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0;
`;

const ManagementCard = styled(motion(Link))`
  display: flex;
  flex-direction: column;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-decoration: none;
  color: var(--text-dark);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const ManagementIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  
  &.shop {
    background-color: rgba(255, 152, 0, 0.1);
    color: #ff9800;
  }
  
  &.user {
    background-color: rgba(33, 150, 243, 0.1);
    color: #2196f3;
  }
`;

const ManagementTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-dark);
`;

const ManagementDescription = styled.p`
  font-size: 1rem;
  color: var(--text-light);
  line-height: 1.5;
`;

export default HomePage;
