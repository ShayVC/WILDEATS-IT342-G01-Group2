import React from 'react';
import styled from 'styled-components';
import AnimatedBackground from './AnimatedBackground';

// This component wraps all pages with the animated background
const AnimatedLayout = ({ children, theme = 'food' }) => {
  return (
    <LayoutContainer>
      <AnimatedBackground theme={theme} />
      <ContentContainer>
        {children}
      </ContentContainer>
    </LayoutContainer>
  );
};

const LayoutContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
`;

const ContentContainer = styled.div`
  position: relative;
  z-index: 1;
`;

export default AnimatedLayout;
