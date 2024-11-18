import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
        console.log('Starting registration with data:', { ...formData, password: '[REDACTED]' });

        if (!validateForm()) {
            console.log('Form validation failed');
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...registrationData } = formData;
            console.log('Sending registration request...');
            const result = await register(registrationData);
            console.log('Registration response:', { success: result.success, error: result.error });
            
            if (result.success) {
                console.log('Registration successful, navigating to verify-email');
                navigate('/verify-email');
            } else {
                console.log('Registration failed:', result.error);
                setError(result.error || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center text-white mb-8">Register</h2>
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-md text-white 
                        shadow-sm placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-md text-white 
                        shadow-sm placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                        Password
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
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
                        Confirm Password
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
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-300">
                Already have an account?{' '}
                <Link to="/login" className="text-green-400 hover:text-green-300">
                    Sign in here
                </Link>
            </p>
        </div>
    );
}
