import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { TapModal } from './components/TapModal';
import { api } from './services/api';

export const App: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isTapModalOpen, setIsTapModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check authentication status with the backend when the app loads / refreshes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/status');
        if (response.data.isAuthenticated) {
          setIsAdminAuthenticated(true);
        } else {
          setIsAdminAuthenticated(false);
        }
      } catch (err) {
        setIsAdminAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsAdminAuthenticated(false);
    navigate('/');
  };

  // Show a blank or loading state while checking cookies on initial load to prevent flashing redirects
  if (isAdminAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 font-medium">
        Loading system session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Global Navbar fixed on top across all pages */}
      <Navbar
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />

      {/* Route Switcher */}
      <main className="w-full">
        <Routes>
          {/* Main Attendance Page */}
          <Route 
            path="/" 
            element={<Dashboard onOpenTapModal={() => setIsTapModalOpen(true)} />} 
          />

          {/* Protected Admin Panel Page */}
          <Route path="/admin" element={isAdminAuthenticated ? (<AdminPanel />) : (<Navigate to="/" replace />)}/>

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Admin Login Modal */}
      {isLoginOpen && (
        <LoginModal
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={() => {
            setIsAdminAuthenticated(true);
            setIsLoginOpen(false);
            navigate('/admin');
          }}
        />
      )}

      {/* NFC Tap Scanner Modal */}
      {isTapModalOpen && (
        <TapModal onClose={() => setIsTapModalOpen(false)} />
      )}
    </div>
  );
};

export default App;