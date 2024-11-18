import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/forms/LoginForm';
import RegisterForm from './components/forms/RegisterForm';
import ForgotPasswordForm from './components/forms/ForgotPasswordForm';
import ResetPasswordForm from './components/forms/ResetPasswordForm';
import VerifyEmailForm from './components/forms/VerifyEmailForm';
import Dashboard from './components/Dashboard';
import FloatingShape from "./components/FloatingShape";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="text-white">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 
      flex items-center justify-center relative overflow-hidden p-4">
        <FloatingShape color="bg-green-500/20" size="w-64 h-64" top="-7%" left="11%" delay={0}/>
        <FloatingShape color="bg-emerald-500/20" size="w-72 h-72" top="60%" left="65%" delay={2}/>
        <FloatingShape color="bg-lime-500/20" size="w-80 h-80" top="30%" left="-10%" delay={4}/>
        
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
          <Route path="/verify-email" element={<VerifyEmailForm />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
