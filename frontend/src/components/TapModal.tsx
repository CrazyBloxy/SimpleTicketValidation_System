import React, { useState, useRef, useEffect } from 'react';
import type { TapResponse } from '../types';
import { api } from '../services/api'; // <-- Use your Axios instance with baseURL

interface TapModalProps {
  onClose: () => void;
}

export const TapModal: React.FC<TapModalProps> = ({ onClose }) => {
  const [cardId, setCardId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
    action?: 'TIME_IN' | 'TIME_OUT';
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the scanner input element immediately when the modal opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle hardware scanner enter key submission
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardId.trim() || loading) return;

    setLoading(true);
    setFeedback(null);

    try {
      // Use your configured Axios client instead of raw fetch
      const response = await api.post('/tap', { card_id: cardId.trim() });
      const data: TapResponse = response.data;

      setFeedback({
        success: data.success,
        message: data.message,
        action: data.action,
      });

      // If successful, dispatch a custom event so the Dashboard immediately refreshes logs
      if (data.success) {
        window.dispatchEvent(new Event('attendance-updated'));
        
        // Optional: Auto close modal after 1.5 seconds on successful tap
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Scan submission error:', err);
      const errorMsg = err.response?.data?.message || 'Network error. Could not connect to server.';
      setFeedback({
        success: false,
        message: errorMsg,
      });
    } finally {
      setLoading(false);
      setCardId(''); // Reset input for the next card scan
      
      // Re-focus input instantly so subsequent scans require zero clicks
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-8 relative flex flex-col items-center text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Icon */}
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
          <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.115 6.845l.209-.414m-7.2-4.14a13.882 13.882 0 00-2.05-6.75m14.85 2.25a14.004 14.004 0 00-11.45-3.35" />
          </svg>
        </div>

        <h3 className="text-xl font-extrabold text-gray-900 mb-1">
          TAP TO TIME IN OR TIMEOUT
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Ready for NFC scanner input. Swipe your card now.
        </p>

        {/* Auto-focused Hardware Wedge Input Form */}
        <form onSubmit={handleScan} className="w-full">
          <input
            ref={inputRef}
            type="password"
            value={cardId}
            maxLength={10}
            onChange={(e) => setCardId(e.target.value)}
            placeholder="Waiting for card..."
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-center font-mono text-lg text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all shadow-sm"
            autoFocus
            disabled={loading}
          />
        </form>

        {/* Feedback Response Banner */}
        {feedback && (
          <div
            className={`mt-6 w-full p-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 animate-in fade-in zoom-in-95 duration-150 ${
              feedback.success
                ? feedback.action === 'TIME_IN'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span>{feedback.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};