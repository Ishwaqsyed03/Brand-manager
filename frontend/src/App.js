import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import Posts from './pages/Posts';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

function AppContent() {
  const { user } = useAuth();

  const isGuest = !user || user.id === 'guest';
  const [showAuthModal, setShowAuthModal] = React.useState(isGuest);

  React.useEffect(() => {
    setShowAuthModal(isGuest);
  }, [isGuest]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-center">Welcome to Steward</h2>
              <p className="mb-6 text-center text-gray-600">Please login or sign up to continue.</p>
              <div className="flex justify-center space-x-4">
                <Link to="/login" className="btn-secondary px-6 py-2 text-lg" onClick={() => setShowAuthModal(false)}>Login</Link>
                <Link to="/register" className="btn-primary px-6 py-2 text-lg" onClick={() => setShowAuthModal(false)}>Sign Up</Link>
              </div>
            </div>
          </div>
        )}
        <main className={'pt-16'}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/dashboard" element={isGuest ? <Navigate to="/login" /> : <Dashboard />} />
            <Route path="/posts" element={isGuest ? <Navigate to="/login" /> : <Posts />} />
            <Route path="/create" element={isGuest ? <Navigate to="/login" /> : <CreatePost />} />
            <Route path="/profile" element={isGuest ? <Navigate to="/login" /> : <Profile />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
