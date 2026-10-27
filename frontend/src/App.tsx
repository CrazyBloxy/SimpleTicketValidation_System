import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { TapModal } from './components/TapModal';

export const App: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isTapModalOpen, setIsTapModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsAdminAuthenticated(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* Global Navbar fixed on top across all pages */}
      <Navbar
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />

      {/* Route Switcher */}
      <main className="flex-1 w-full">
        <Routes>
          {/* Main Attendance Page */}
          <Route 
            path="/" 
            element={<Dashboard onOpenTapModal={() => setIsTapModalOpen(true)} />} 
          />

          {/* Protected Admin Panel Page */}
          <Route
            path="/admin"
            element={
              isAdminAuthenticated ? (
                <AdminPanel />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

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