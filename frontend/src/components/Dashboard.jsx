import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [resendStatus, setResendStatus] = useState({ loading: false, message: '' });

    const handleLogout = async () => {
        try {
            const result = await logout();
            if (result.success) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleResendVerification = async () => {
        try {
            setResendStatus({ loading: true, message: '' });
            const response = await axios.post('/api/auth/resend-verification', { email: user.email });
            setResendStatus({ 
                loading: false, 
                message: response.data.message || 'Verification email sent successfully!' 
            });
        } catch (error) {
            console.error('Failed to resend verification:', error);
            setResendStatus({ 
                loading: false, 
                message: error.response?.data?.message || 'Failed to send verification email' 
            });
        }
    };

    return (
        <div className="w-full max-w-4xl p-8 bg-white/10 backdrop-blur-md rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Welcome, {user?.name}!</h1>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 
                    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    Logout
                </button>
            </div>

            {!user?.isVerified && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-4">
                        <div className="flex-grow">
                            <p className="text-yellow-400 font-medium">
                                Your email is not verified
                            </p>
                            <p className="text-gray-300 text-sm mt-1">
                                Please check your email for the verification link or click the button to resend it.
                            </p>
                            {resendStatus.message && (
                                <p className={`text-sm mt-2 ${resendStatus.message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                                    {resendStatus.message}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleResendVerification}
                            disabled={resendStatus.loading}
                            className="px-4 py-2 bg-yellow-600/80 text-white rounded hover:bg-yellow-700/80 
                            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendStatus.loading ? 'Sending...' : 'Resend Verification'}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white/5 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Name</label>
                        <p className="text-white">{user?.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Email</label>
                        <p className="text-white">{user?.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Account Status</label>
                        <p className="text-white">
                            {user?.isVerified ? (
                                <span className="inline-flex items-center text-green-400">
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verified
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-yellow-400">
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Pending Verification
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                <p className="text-gray-300">
                    Last login: {user?.last_login 
                        ? new Date(user.last_login).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'medium'
                        }) 
                        : 'N/A'}
                </p>
            </div>
        </div>
    );
}
