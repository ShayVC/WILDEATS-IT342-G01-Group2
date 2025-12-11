import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext.jsx';
import './Login.css';

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

    // Quick login helper (optional)
    const quickLogin = async (email, password) => {
        setFormData({ email, password });
        try {
            setLoading(true);
            const user = await login(email, password);
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

    return (
        <div className="login-container">
            <div className="form-card">
                <h1 className="form-header">Login to WildEats</h1>
                {error && <div className="error-message">{error}</div>}

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
            </div>
        </div>
    );
};

export default LoginPage;