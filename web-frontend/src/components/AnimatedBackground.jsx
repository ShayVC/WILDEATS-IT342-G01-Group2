import React from 'react';
import '../styles/AnimatedBackground.css';

/**
 * Animated background component with theme support.
 * @param {string} theme - Theme of the background ('food', 'nature', etc.)
 */
const AnimatedBackground = ({ theme = 'food' }) => {
    return (
        <div className={`animated-background ${theme}`}>
            {/* Example animated elements */}
            {[...Array(10)].map((_, index) => (
                <div key={index} className="background-item" />
            ))}
        </div>
    );
};

export default AnimatedBackground;