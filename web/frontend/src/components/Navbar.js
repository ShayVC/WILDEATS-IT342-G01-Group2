import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiShoppingBag, FiHome, FiList, FiPlusCircle, FiShoppingCart, FiUsers, FiLogIn, FiLogOut, FiUserPlus, FiUser } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isSeller, isCustomer, logout } = useAuth();
  
  // Close mobile menu when changing routes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <NavbarContainer>
      <NavInner>
        <Logo to="/">
          <FiShoppingBag />
          <span>WildEats</span>
        </Logo>
        
        <MenuToggle onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX /> : <FiMenu />}
        </MenuToggle>
        
        <DesktopNav>
          <NavLink 
            to="/"
            isActive={location.pathname === '/'}
          >
            <FiHome />
            <span>Home</span>
          </NavLink>
          
          {isAuthenticated && (
            <>
              <NavLink 
                to="/my-orders"
                isActive={location.pathname === '/my-orders'}
              >
                <FiList />
                <span>My Orders</span>
              </NavLink>
              
              <NavLink 
                to="/shops"
                isActive={location.pathname.startsWith('/shops')}
              >
                <FiShoppingCart />
                <span>Shops</span>
              </NavLink>
              
              {isSeller && (
                <NavLink 
                  to="/my-shop"
                  isActive={location.pathname.startsWith('/my-shop')}
                >
                  <FiShoppingBag />
                  <span>My Shop</span>
                </NavLink>
              )}
              
              {/* Only show Users link to sellers for now */}
              {isSeller && (
                <NavLink 
                  to="/users"
                  isActive={location.pathname.startsWith('/users')}
                >
                  <FiUsers />
                  <span>Users</span>
                </NavLink>
              )}
            </>
          )}
          
          {!isAuthenticated ? (
            <>
              <NavLink 
                to="/login"
                isActive={location.pathname === '/login'}
              >
                <FiLogIn />
                <span>Login</span>
              </NavLink>
              <NavLink 
                to="/register"
                isActive={location.pathname === '/register'}
              >
                <FiUserPlus />
                <span>Register</span>
              </NavLink>
            </>
          ) : (
            <NavButton onClick={handleLogout}>
              <FiLogOut />
              <span>Logout</span>
            </NavButton>
          )}
        </DesktopNav>
      </NavInner>

      <AnimatePresence>
        {isOpen && (
          <MobileNav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MobileNavLink 
              to="/"
              isActive={location.pathname === '/'}
            >
              <FiHome />
              <span>Home</span>
            </MobileNavLink>
            
            {isAuthenticated && (
              <>
                <MobileNavLink 
                  to="/my-orders"
                  isActive={location.pathname === '/my-orders'}
                >
                  <FiList />
                  <span>My Orders</span>
                </MobileNavLink>
                
                <MobileNavLink 
                  to="/shops"
                  isActive={location.pathname.startsWith('/shops')}
                >
                  <FiShoppingCart />
                  <span>Shops</span>
                </MobileNavLink>
                
                {isSeller && (
                  <MobileNavLink 
                    to="/my-shop"
                    isActive={location.pathname.startsWith('/my-shop')}
                  >
                    <FiShoppingBag />
                    <span>My Shop</span>
                  </MobileNavLink>
                )}
                
                {isSeller && (
                  <MobileNavLink 
                    to="/users"
                    isActive={location.pathname.startsWith('/users')}
                  >
                    <FiUsers />
                    <span>Users</span>
                  </MobileNavLink>
                )}
              </>
            )}
            
            {!isAuthenticated ? (
              <>
                <MobileNavLink 
                  to="/login"
                  isActive={location.pathname === '/login'}
                >
                  <FiLogIn />
                  <span>Login</span>
                </MobileNavLink>
                <MobileNavLink 
                  to="/register"
                  isActive={location.pathname === '/register'}
                >
                  <FiUserPlus />
                  <span>Register</span>
                </MobileNavLink>
              </>
            ) : (
              <MobileNavButton onClick={handleLogout}>
                <FiLogOut />
                <span>Logout</span>
              </MobileNavButton>
            )}
          </MobileNav>
        )}
      </AnimatePresence>
    </NavbarContainer>
  );
};

const NavbarContainer = styled.nav`
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  
  svg {
    font-size: 1.5rem;
  }
`;

const MenuToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--primary);
  font-size: 1.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(128, 0, 32, 0.1);
    transform: none;
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const DesktopNav = styled.div`
  display: none;
  align-items: center;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    display: flex;
  }
`;

const NavLink = styled(({ isActive, ...props }) => <Link {...props} />)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${(props) => props.isActive ? 'var(--primary)' : 'var(--text-dark)'};
  font-weight: ${(props) => props.isActive ? '600' : '400'};
  padding: 0.5rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--primary);
    transform: scaleX(${(props) => props.isActive ? '1' : '0'});
    transform-origin: bottom left;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    color: var(--primary);
    
    &:after {
      transform: scaleX(1);
    }
  }
`;

const MobileNav = styled(motion.div)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: white;
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-dark);
  font-weight: 400;
  padding: 0.5rem;
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    color: var(--primary);
    
    &:after {
      transform: scaleX(1);
    }
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--primary);
    transform: scaleX(0);
    transform-origin: bottom left;
    transition: transform 0.3s ease;
  }
`;

const MobileNavLink = styled(({ isActive, ...props }) => <Link {...props} />)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  color: ${(props) => props.isActive ? 'var(--primary)' : 'var(--text-dark)'};
  font-weight: ${(props) => props.isActive ? '600' : '400'};
  background-color: ${(props) => props.isActive ? 'rgba(128, 0, 32, 0.1)' : 'transparent'};
  
  &:hover {
    background-color: rgba(128, 0, 32, 0.05);
  }
`;

const MobileNavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  color: var(--text-dark);
  background-color: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(128, 0, 32, 0.05);
  }
  
  svg {
    font-size: 1.25rem;
  }
`;

export default Navbar;
