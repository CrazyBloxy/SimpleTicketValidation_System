import React from 'react';

interface NavbarProps {
  onOpenLogin: () => void;
  isAdminAuthenticated: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin, isAdminAuthenticated, onLogout }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            P
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Passtap</h1>
            <p className="text-xs text-gray-500">NFC Attendance Verification</p>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {isAdminAuthenticated ? (
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              Admin Logout
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};