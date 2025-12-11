import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../contexts/AuthContext.jsx';
import './Login.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const BACKEND_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, error } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error('Please enter both email and password');
            return;
        }

        try {
            setLoading(true);
            const user = await login(formData.email, formData.password);

            const roleDisplay = user?.role?.toUpperCase() || 'USER';
            toast.success(`Welcome back! Logged in as ${roleDisplay}.`);

            if (user.roles?.includes('SELLER')) navigate('/my-shop');
            else if (user.roles?.includes('ADMIN')) navigate('/admin');
            else navigate('/');
        } catch (err) {
            toast.error(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Redirect to backend OAuth2 endpoint
        window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
    };

    return (
        <div className="login-container">
            <div className="form-card">
                <h1 className="form-header">Login to WildEats</h1>
                {error && <div className="error-message">{error}</div>}

                {/* Traditional Login Form */}
                <form className="styled-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button className="submit-button" type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="form-footer">
                    Don't have an account? <Link className="styled-link" to="/register">Register here</Link>
                </div>

                {/* Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '1.5rem 0',
                    color: '#666'
                }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }} />
                    <span style={{ padding: '0 1rem', fontSize: '0.875rem' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }} />
                </div>

                {/* Google Sign-In Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="google-signin-button"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        width: '100%',
                        padding: '0.875rem',
                        backgroundColor: 'white',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        marginBottom: '1.5rem'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f8f8';
                        e.currentTarget.style.borderColor = '#800020';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#ddd';
                    }}
                >
                    <FcGoogle size={24} />
                    <span style={{ color: '#333' }}>Continue with Google</span>
                </button>
            </div>
        </div>
    );
};

export default LoginPage;