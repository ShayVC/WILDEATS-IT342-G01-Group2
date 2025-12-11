import React from 'react';
import '../styles/Loader.css';

const SPINNER_CONFIG = {
    size: 40, // px
    borderWidth: 4, // px
    color: '#4caf50',
    text: 'Loading...',
};

const Loader = ({ size = SPINNER_CONFIG.size, color = SPINNER_CONFIG.color, text = SPINNER_CONFIG.text }) => {
    return (
        <div className="loader-container">
            <div
                className="spinner"
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderTopColor: color,
                    borderWidth: `${SPINNER_CONFIG.borderWidth}px`,
                }}
            />
            <p className="loading-text">{text}</p>
        </div>
    );
};

export default Loader;