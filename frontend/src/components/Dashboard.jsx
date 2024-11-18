import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
                            {user?.is_verified ? (
                                <span className="text-green-400">Verified</span>
                            ) : (
                                <span className="text-yellow-400">Pending Verification</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                <p className="text-gray-300">Last login: {new Date(user?.last_login).toLocaleString()}</p>
            </div>
        </div>
    );
}
