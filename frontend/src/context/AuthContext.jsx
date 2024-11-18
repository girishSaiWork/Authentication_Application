import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set default base URL and credentials
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
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
            console.log('Attempting login with:', credentials);
            const response = await axios.post('/api/auth/login', credentials);
            console.log('Login response:', response.data);
            
            if (response.data.success) {
                setUser(response.data.user);
                return { success: true };
            }
            return { success: false, error: 'Login failed' };
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
            const errorMessage = err.response?.data?.message || 'Logout failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
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
                error: err.response?.data?.message || 'Failed to process password reset request' 
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

    const verifyEmail = async (code) => {
        try {
            const response = await axios.post('/api/auth/verify-email', { code });
            if (response.data.success) {
                setUser(response.data.user);
                return { success: true };
            }
            return { success: false, error: 'Email verification failed' };
        } catch (err) {
            console.error('Email verification error:', err.response?.data || err.message);
            return { 
                success: false, 
                error: err.response?.data?.message || 'Email verification failed' 
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
        forgotPassword,
        resetPassword,
        verifyEmail
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
