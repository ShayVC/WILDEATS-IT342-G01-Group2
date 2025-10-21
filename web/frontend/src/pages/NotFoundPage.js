import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiHome } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <Container>
      <ContentWrapper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ErrorIcon>
          <FiAlertCircle />
        </ErrorIcon>
        
        <ErrorCode>404</ErrorCode>
        
        <ErrorTitle>Page Not Found</ErrorTitle>
        
        <ErrorMessage>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </ErrorMessage>
        
        <HomeButton to="/">
          <FiHome />
          <span>Back to Home</span>
        </HomeButton>
      </ContentWrapper>
    </Container>
  );
};

const Container = styled.div`
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const ContentWrapper = styled(motion.div)`
  max-width: 500px;
  text-align: center;
  background-color: white;
  padding: 3rem 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  color: var(--primary);
  margin-bottom: 1rem;
`;

const ErrorCode = styled.h1`
  font-size: 5rem;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 1rem;
  line-height: 1;
`;

const ErrorTitle = styled.h2`
  font-size: 1.8rem;
  color: var(--text-dark);
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  color: var(--gray-dark);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const HomeButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--primary-light);
    color: white;
    transform: translateY(-2px);
  }
`;

export default NotFoundPage;
