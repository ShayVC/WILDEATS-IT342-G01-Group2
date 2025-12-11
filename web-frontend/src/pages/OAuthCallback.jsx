import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';

/**
 * OAuth Callback Handler
 * 
 * This component handles the redirect from the backend after successful
 * Google OAuth authentication. It extracts the JWT token and user data
 * from URL parameters and updates the auth context.
 */
const OAuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setCurrentUser } = useAuth();

    useEffect(() => {
        const handleOAuthCallback = () => {
            // Extract parameters from URL
            const token = searchParams.get('token');
            const userId = searchParams.get('userId');
            const email = searchParams.get('email');
            const firstName = searchParams.get('firstName');
            const lastName = searchParams.get('lastName');
            const role = searchParams.get('role');
            const rolesParam = searchParams.get('roles');

            // Validate required parameters
            if (!token || !userId || !email) {
                toast.error('Authentication failed. Missing required information.');
                navigate('/login');
                return;
            }

            // Parse roles array
            const roles = rolesParam ? rolesParam.split(',') : [role];

            // Create user object
            const user = {
                id: parseInt(userId),
                firstName: firstName || 'User',
                lastName: lastName || '',
                name: `${firstName || 'User'} ${lastName || ''}`.trim(),
                email,
                role: role?.toLowerCase() || 'customer',
                roles,
                token,
            };

            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Update auth context
            if (setCurrentUser) {
                setCurrentUser(user);
            }

            // Show success message
            const roleDisplay = role?.toUpperCase() || 'USER';
            toast.success(`Welcome! Logged in as ${roleDisplay} via Google.`);

            // Redirect based on role
            if (roles.includes('SELLER')) {
                navigate('/my-shop');
            } else if (roles.includes('ADMIN')) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        };

        handleOAuthCallback();
    }, [searchParams, navigate, setCurrentUser]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem'
        }}>
            <Loader text="Completing sign in with Google..." />
            <p style={{ marginTop: '1rem', color: '#666' }}>
                Please wait while we set up your account...
            </p>
        </div>
    );
};

export default OAuthCallback;