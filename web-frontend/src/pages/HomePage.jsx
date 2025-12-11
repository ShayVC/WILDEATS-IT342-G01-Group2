import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiShoppingBag,
    FiShoppingCart,
    FiList,
    FiPlusCircle,
    FiLogIn,
    FiUserPlus,
    FiUsers
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext.jsx';
import AnimatedBackground from '../components/AnimatedBackground';
import './HomePage.css';

// Import images
import hamburgerImg from '../assets/hamburger.jpg';
import pizzaSliceImg from '../assets/pizza-slice.jpg';
import pastaImg from '../assets/pasta.jpg';
import caesarSaladImg from '../assets/caesar-salad.jpg';
import chocolateCakeImg from '../assets/chocolate-cake.jpg';

// Hero images configuration
const HERO_IMAGES = [
    { src: hamburgerImg, alt: 'Hamburger', className: 'main' },
    { src: pizzaSliceImg, alt: 'Pizza Slice' },
    { src: pastaImg, alt: 'Pasta' },
    { src: caesarSaladImg, alt: 'Caesar Salad' },
    { src: chocolateCakeImg, alt: 'Chocolate Cake' }
];

// Feature cards configuration
const FEATURE_CONFIGS = {
    guest: [
        {
            to: '/login',
            icon: FiLogIn,
            title: 'Log In',
            description: 'Access your account to place orders and view history'
        },
        {
            to: '/register',
            icon: FiUserPlus,
            title: 'Register',
            description: 'Create a new account to start using WildEats'
        }
    ],
    seller: [
        {
            to: '/my-shop',
            icon: FiShoppingBag,
            title: 'My Shop',
            description: 'Manage your shop details and food items'
        },
        {
            to: '/orders',
            icon: FiList,
            title: 'Incoming Orders',
            description: 'View and process customer orders'
        }
    ],
    customer: [
        {
            to: '/shops',
            icon: FiShoppingCart,
            title: 'Browse Shops',
            description: 'Explore all available canteen shops and their offerings'
        },
        {
            to: '/orders',
            icon: FiList,
            title: 'View Orders',
            description: 'Check the status of your current and past orders'
        },
        {
            to: '/shops',
            icon: FiPlusCircle,
            title: 'Place Order',
            description: 'Quickly place a new order from your favorite shops'
        }
    ]
};

// Management cards configuration
const MANAGEMENT_CARDS = [
    {
        to: '/shops',
        icon: FiShoppingCart,
        iconClass: 'shop',
        title: 'Shop Management',
        description: 'Add, edit, and manage shops in the online canteen system.'
    },
    {
        to: '/users',
        icon: FiUsers,
        iconClass: 'user',
        title: 'User Management',
        description: 'Manage user accounts, permissions, and profiles.'
    }
];

// Hero content configuration
const getHeroContent = (isAuthenticated, isSeller, currentUser) => {
    if (!isAuthenticated) {
        return {
            title: 'Welcome to WildEats Online Canteen',
            subtitle: 'Your one-stop solution for campus dining',
            description: 'Log in to browse shops, place orders, and enjoy delicious meals from your favorite campus eateries.',
            ctaText: 'Log In',
            ctaLink: '/login'
        };
    }

    if (isSeller) {
        return {
            title: `Welcome back, ${currentUser?.name || 'User'}!`,
            subtitle: 'Manage your shop and fulfill orders',
            description: 'Manage your shop, add food items, and process customer orders all in one place.',
            ctaText: 'Manage My Shop',
            ctaLink: '/my-shop'
        };
    }

    return {
        title: `Welcome back, ${currentUser?.name || 'User'}!`,
        subtitle: 'Your one-stop solution for campus dining',
        description: 'Browse shops, place orders, and enjoy delicious meals from your favorite campus eateries.',
        ctaText: 'Explore Shops',
        ctaLink: '/shops'
    };
};

const HomePage = () => {
    const { isAuthenticated, currentUser, isSeller, isCustomer, isAdmin } = useAuth();

    const heroContent = getHeroContent(isAuthenticated, isSeller, currentUser);

    const getUserRole = () => {
        if (!isAuthenticated) return 'guest';
        if (isSeller) return 'seller';
        return 'customer';
    };

    const featureCards = FEATURE_CONFIGS[getUserRole()];

    return (
        <div className="homepage-container">
            <AnimatedBackground theme="food" />

            {/* Hero Section */}
            <section className="hero-section">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="hero-title">{heroContent.title}</h1>
                    <p className="hero-subtitle">{heroContent.subtitle}</p>
                    <p className="hero-description">{heroContent.description}</p>
                    <Link to={heroContent.ctaLink} className="hero-cta">
                        {heroContent.ctaText}
                    </Link>
                </motion.div>

                <motion.div
                    className="hero-image-grid"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {HERO_IMAGES.map((image, index) => (
                        <div key={index} className={`hero-image-item ${image.className || ''}`}>
                            <img src={image.src} alt={image.alt} />
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-title">
                    {isAuthenticated ? 'Quick Actions' : 'Get Started'}
                </h2>
                <div className="features-grid">
                    {featureCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <Link key={index} to={card.to} className="feature-card-link">
                                <motion.div className="feature-card">
                                    <div className="feature-icon">
                                        <Icon />
                                    </div>
                                    <h3 className="feature-title">{card.title}</h3>
                                    <p className="feature-description">{card.description}</p>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <div className="cta-image-container">
                        <img src={chocolateCakeImg} alt="Delicious dessert" className="cta-image" />
                    </div>
                    <div className="cta-text">
                        <h2 className="cta-title">Ready to Order?</h2>
                        <p className="cta-description">
                            Explore our menu and place your order now for a delightful dining experience.
                        </p>
                        <Link to="/shops" className="cta-button">
                            Place an Order
                        </Link>
                    </div>
                </div>
            </section>

            {/* Management Section (Admin Only) */}
            {isAdmin && (
                <section className="management-section">
                    <h2 className="section-title">Management Features</h2>
                    <div className="management-grid">
                        {MANAGEMENT_CARDS.map((card, index) => {
                            const Icon = card.icon;
                            return (
                                <motion.div
                                    key={index}
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Link to={card.to} className="management-card">
                                        <div className={`management-icon ${card.iconClass}`}>
                                            <Icon />
                                        </div>
                                        <h3 className="management-title">{card.title}</h3>
                                        <p className="management-description">{card.description}</p>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
};

export default HomePage;