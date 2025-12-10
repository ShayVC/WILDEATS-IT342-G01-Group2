import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext.jsx';
import './Register.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, error } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            toast.error('All fields are required');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        try {
            setLoading(true);
            toast.info('Creating your account...', { autoClose: 2000 });

            const user = await register(
                formData.firstName,
                formData.lastName,
                formData.email,
                formData.password,
                formData.confirmPassword
            );

            const roleDisplay = user?.role?.toUpperCase() || 'USER';
            toast.success(`Registration successful! Welcome as ${roleDisplay}.`);

            setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });

            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            toast.error(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="form-card">
                <h1 className="form-header">Create an Account</h1>
                {error && <div className="error-message">{error}</div>}

                <form className="styled-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Enter your first name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Enter your last name"
                                required
                            />
                        </div>
                    </div>

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
                            placeholder="Create a password (min. 6 characters)"
                            minLength="6"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <button className="submit-button" type="submit" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="form-footer">
                    Already have an account? <Link className="styled-link" to="/login">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;