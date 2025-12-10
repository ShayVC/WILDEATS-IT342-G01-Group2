import React from 'react';
import AnimatedBackground from './AnimatedBackground';
import '../styles/AnimatedLayout.css';

/**
 * Wraps pages with an animated background.
 * @param {React.ReactNode} children - Page content.
 * @param {string} theme - Theme for background animation (default: 'food').
 */
const AnimatedLayout = ({ children, theme = 'food' }) => {
    return (
        <div className="layout-container">
            <AnimatedBackground theme={theme} />
            <div className="content-container">
                {children}
            </div>
        </div>
    );
};

export default AnimatedLayout;