import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ResetPasswordForm() {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { resetPassword } = useAuth();
    
    // Get token from either URL params or query params
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            navigate('/forgot-password');
        }
    }, [token, navigate]);

    // If no token is present, don't render the form
    if (!token) {
        return null;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error when user starts typing
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);
        try {
            const result = await resetPassword(token, formData.password);
            if (result.success) {
                navigate('/login', { 
                    state: { message: 'Password has been reset successfully. Please login with your new password.' }
                });
            } else {
                setError(result.error || 'Failed to reset password');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error('Reset password error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center text-white mb-8">Reset Password</h2>
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                        New Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-md text-white 
                        shadow-sm placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        placeholder="Enter your new password"
                        minLength={6}
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-md text-white 
                        shadow-sm placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        placeholder="Confirm your new password"
                        minLength={6}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !formData.password || !formData.confirmPassword}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
}
