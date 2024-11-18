import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const result = await forgotPassword(email);
            if (result.success) {
                setSuccess('Password reset instructions have been sent to your email');
                setEmail('');
            } else {
                setError(result.error || 'Failed to send reset email');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center text-white mb-8">Forgot Password</h2>
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded mb-4">
                    {success}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-md text-white 
                        shadow-sm placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        placeholder="Enter your email address"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {loading ? 'Sending...' : 'Send Reset Instructions'}
                </button>
            </form>
            <div className="mt-4 text-center space-y-2">
                <p className="text-sm text-gray-300">
                    Remember your password?{' '}
                    <Link to="/login" className="text-green-400 hover:text-green-300">
                        Sign in here
                    </Link>
                </p>
                <p className="text-sm text-gray-300">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-green-400 hover:text-green-300">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
