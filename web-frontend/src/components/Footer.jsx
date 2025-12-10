import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiHeart, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import '../styles/Footer.css';

const QUICK_LINKS = [
    { path: '/', label: 'Home' },
    { path: '/orders', label: 'View Orders' },
    { path: '/create-order', label: 'New Order' },
];

const CONTACT_ITEMS = [
    { icon: <FiMail />, text: 'contact@wildeats.com' },
    { icon: <FiPhone />, text: '+1 (555) 123-4567' },
    { icon: <FiMapPin />, text: 'University Campus, Building B' },
];

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer-container">
            <div className="footer-content">
                {/* Logo and description */}
                <div className="footer-section">
                    <div className="footer-logo">
                        <FiShoppingBag />
                        <span>WildEats</span>
                    </div>
                    <p className="footer-text">
                        WildEats Online Canteen provides a convenient way for customers to order food online and manage their orders efficiently.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="footer-section">
                    <h3 className="footer-title">Quick Links</h3>
                    <div className="footer-links">
                        {QUICK_LINKS.map(link => (
                            <Link key={link.path} to={link.path} className="footer-link">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Contact Info */}
                <div className="footer-section">
                    <h3 className="footer-title">Contact Us</h3>
                    {CONTACT_ITEMS.map((item, index) => (
                        <div key={index} className="contact-item">
                            {item.icon}
                            <span>{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <p className="footer-copyright">
                    &copy; {currentYear} WildEats Online Canteen. All rights reserved.
                </p>
                <p className="footer-love">
                    Made with <FiHeart /> by Canteen Team
                </p>
            </div>
        </footer>
    );
};

export default Footer;