import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiHeart, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterLogo>
            <FiShoppingBag />
            <span>WildEats</span>
          </FooterLogo>
          <FooterText>
            WildEats Online Canteen provides a convenient way for customers to order food online and manage their orders efficiently.
          </FooterText>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Quick Links</FooterTitle>
          <FooterLinks>
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/orders">View Orders</FooterLink>
            <FooterLink to="/create-order">New Order</FooterLink>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Contact Us</FooterTitle>
          <ContactItem>
            <FiMail />
            <span>contact@wildeats.com</span>
          </ContactItem>
          <ContactItem>
            <FiPhone />
            <span>+1 (555) 123-4567</span>
          </ContactItem>
          <ContactItem>
            <FiMapPin />
            <span>University Campus, Building B</span>
          </ContactItem>
        </FooterSection>
      </FooterContent>
      
      <FooterBottom>
        <FooterCopyright>
          &copy; {currentYear} WildEats Online Canteen. All rights reserved.
        </FooterCopyright>
        <FooterLove>
          Made with <FiHeart /> by Canteen Team
        </FooterLove>
      </FooterBottom>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  background-color: var(--primary-dark);
  color: var(--white);
  padding: 3rem 1.5rem 1.5rem;
  margin-top: 3rem;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--white);
  
  svg {
    font-size: 1.5rem;
  }
`;

const FooterText = styled.p`
  color: var(--gray);
  font-size: 0.9rem;
  line-height: 1.6;
`;

const FooterTitle = styled.h3`
  color: var(--white);
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 3rem;
    height: 2px;
    background-color: var(--primary-light);
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FooterLink = styled(Link)`
  color: var(--gray);
  text-decoration: none;
  transition: var(--transition);
  
  &:hover {
    color: var(--white);
    padding-left: 0.25rem;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--gray);
  font-size: 0.9rem;
  
  svg {
    color: var(--primary-light);
  }
`;

const FooterBottom = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const FooterCopyright = styled.p`
  color: var(--gray);
  font-size: 0.9rem;
`;

const FooterLove = styled.p`
  color: var(--gray);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    color: #ff6b6b;
  }
`;

export default Footer;
