import React from 'react';
import styled, { keyframes } from 'styled-components';

const moveGradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const floatBubble = keyframes`
  0% {
    transform: translateY(0) translateX(0) rotate(0);
    opacity: 1;
    border-radius: 40%;
  }
  100% {
    transform: translateY(-1000px) translateX(20px) rotate(720deg);
    opacity: 0;
    border-radius: 60%;
  }
`;

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  background: linear-gradient(
    -45deg,
    rgba(255, 222, 173, 0.2),
    rgba(255, 160, 122, 0.2),
    rgba(250, 128, 114, 0.2),
    rgba(240, 128, 128, 0.2)
  );
  background-size: 400% 400%;
  animation: ${moveGradient} 15s ease infinite;
`;

const Bubble = styled.div`
  position: absolute;
  bottom: -100px;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(1px);
  border-radius: 40%;
  animation: ${floatBubble} ${props => props.duration}s ease-in infinite;
  animation-delay: ${props => props.delay}s;
  left: ${props => props.left}%;
`;

const AnimatedBackground = ({ theme = 'food' }) => {
  // Create 15 bubbles with random properties
  const bubbles = Array.from({ length: 15 }, (_, index) => ({
    id: index,
    size: Math.random() * 80 + 20, // 20-100px
    duration: Math.random() * 20 + 10, // 10-30s
    delay: Math.random() * 15,
    left: Math.random() * 100, // 0-100%
  }));

  return (
    <BackgroundContainer className={`theme-${theme}`}>
      {bubbles.map(bubble => (
        <Bubble
          key={bubble.id}
          size={bubble.size}
          duration={bubble.duration}
          delay={bubble.delay}
          left={bubble.left}
        />
      ))}
    </BackgroundContainer>
  );
};

export default AnimatedBackground;
