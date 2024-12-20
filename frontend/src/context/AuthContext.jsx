import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set default base URL and credentials
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get('/api/auth/check-auth');
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Auth check failed:', error.response?.data || error.message);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await axios.post('/api/auth/register', userData);
            if (response.data.success) {
                setUser(response.data.user);
                return { success: true };
            }
            return { success: false, error: 'Registration failed' };
        } catch (err) {
            console.error('Registration error:', err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await axios.post('/api/auth/login', credentials);
            console.log('Login response:', response.data);
            
            if (response.data.success) {
                const userData = {
                    ...response.data.user,
                    isVerified: response.data.user.isVerified,
                    last_login: response.data.user.last_login
                };
                console.log('Setting user state:', userData);
                setUser(userData);
                return { success: true };
            }
            return { success: false, error: response.data.message || 'Login failed' };
        } catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            const response = await axios.post('/api/auth/logout');
            if (response.data.success) {
                setUser(null);
                return { success: true };
            }
            return { success: false, error: 'Logout failed' };
        } catch (err) {
            console.error('Logout error:', err.response?.data || err.message);
            return { success: false, error: err.response?.data?.message || 'Logout failed' };
        }
    };

    const verifyEmail = async (code) => {
        try {
            const response = await axios.post('/api/auth/verify-email', { code });
            console.log('Verify email response:', response.data);
            
            if (response.data.success) {
                const userData = {
                    ...response.data.user,
                    isVerified: response.data.user.isVerified
                };
                console.log('Updating user state after verification:', userData);
                setUser(userData);
                return { success: true };
            }
            return { success: false, error: response.data.message || 'Email verification failed' };
        } catch (err) {
            console.error('Email verification error:', err.response?.data || err.message);
            return { success: false, error: err.response?.data?.message || 'Email verification failed' };
        }
    };

    const forgotPassword = async (email) => {
        try {
            const response = await axios.post('/api/auth/forgot-password', { email });
            return { success: true, message: response.data.message };
        } catch (err) {
            console.error('Forgot password error:', err.response?.data || err.message);
            return { 
                success: false, 
                error: err.response?.data?.message || 'Failed to process forgot password request' 
            };
        }
    };

    const resetPassword = async (token, password) => {
        try {
            const response = await axios.post('/api/auth/reset-password', { token, password });
            return { success: true, message: response.data.message };
        } catch (err) {
            console.error('Reset password error:', err.response?.data || err.message);
            return { 
                success: false, 
                error: err.response?.data?.message || 'Failed to reset password' 
            };
        }
    };

    const resendVerification = async (email) => {
        try {
            const response = await axios.post('/api/auth/resend-verification', { email });
            return { 
                success: true, 
                message: response.data.message || 'Verification email sent successfully!' 
            };
        } catch (err) {
            console.error('Resend verification error:', err.response?.data || err.message);
            return { 
                success: false, 
                error: err.response?.data?.message || 'Failed to resend verification email' 
            };
        }
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        verifyEmail,
        forgotPassword,
        resetPassword,
        resendVerification
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
