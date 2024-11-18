import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function VerifyEmailForm() {
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { verifyEmail } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await verifyEmail(verificationCode);
            if (result.success) {
                navigate('/dashboard', { 
                    state: { message: 'Email verified successfully! Welcome aboard!' }
                });
            } else {
                setError(result.error || 'Verification failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center text-white mb-8">Verify Your Email</h2>
            <p className="text-gray-300 text-center mb-6">
                Please enter the verification code sent to your email address.
            </p>
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-200">
                        Verification Code
                    </label>
                    <input
                        type="text"
                        id="verificationCode"
                        required
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-md text-white 
                        shadow-sm placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 
                        tracking-widest text-center text-2xl"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        pattern="[0-9]{6}"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {loading ? 'Verifying...' : 'Verify Email'}
                </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-300">
                Didn't receive the code?{' '}
                <button
                    onClick={() => {/* Implement resend code functionality */}}
                    className="text-green-400 hover:text-green-300 focus:outline-none"
                >
                    Resend Code
                </button>
            </p>
        </div>
    );
}
