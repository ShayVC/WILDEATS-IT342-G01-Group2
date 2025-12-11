import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMenu, FiX, FiShoppingBag, FiHome, FiList, FiShoppingCart,
    FiUsers, FiLogIn, FiLogOut, FiUserPlus
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext.jsx';
import '../styles/NavBar.css';

const NAV_ITEMS = [
    { path: '/', label: 'Home', icon: <FiHome />, roles: ['all'] },
    { path: '/my-orders', label: 'My Orders', icon: <FiList />, roles: ['authenticated'] },
    { path: '/shops', label: 'Shops', icon: <FiShoppingCart />, roles: ['authenticated'] },
    { path: '/my-shop', label: 'My Shop', icon: <FiShoppingBag />, roles: ['seller'] },
    { path: '/users', label: 'Users', icon: <FiUsers />, roles: ['seller'] },
    { path: '/login', label: 'Login', icon: <FiLogIn />, roles: ['guest'] },
    { path: '/register', label: 'Register', icon: <FiUserPlus />, roles: ['guest'] },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, isSeller, logout } = useAuth();

    useEffect(() => setIsOpen(false), [location]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const filterNavItems = (items) =>
        items.filter(item => {
            if (item.roles.includes('all')) return true;
            if (item.roles.includes('authenticated') && isAuthenticated) return true;
            if (item.roles.includes('seller') && isSeller) return true;
            if (item.roles.includes('guest') && !isAuthenticated) return true;
            return false;
        });

    const renderLink = (item, isMobile = false) => {
        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        const className = isMobile ? `mobile-nav-link ${isActive ? 'active' : ''}` : `nav-link ${isActive ? 'active' : ''}`;
        return (
            <Link key={item.path} to={item.path} className={className}>
                {item.icon}
                <span>{item.label}</span>
            </Link>
        );
    };

    return (
        <nav className="navbar-container">
            <div className="nav-inner">
                <Link to="/" className="logo">
                    <FiShoppingBag />
                    <span>WildEats</span>
                </Link>

                <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <FiX /> : <FiMenu />}
                </button>

                <div className="desktop-nav">
                    {filterNavItems(NAV_ITEMS).map(item => renderLink(item))}
                    {isAuthenticated && (
                        <button className="nav-button" onClick={handleLogout}>
                            <FiLogOut />
                            <span>Logout</span>
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="mobile-nav"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {filterNavItems(NAV_ITEMS).map(item => renderLink(item, true))}
                        {isAuthenticated && (
                            <button className="mobile-nav-button" onClick={handleLogout}>
                                <FiLogOut />
                                <span>Logout</span>
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;