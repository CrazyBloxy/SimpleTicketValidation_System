import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', card_id: '', role: 'Student', is_active: true });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setFormData({ 
        name: user.name, 
        card_id: user.card_id, 
        role: user.role, 
        is_active: user.is_active 
      });
      setFormError(null);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const response = await api.put(`/admin/users/${user.id}`, formData);
      if (response.data.success) {
        onSuccess();
        onClose();
      } else {
        setFormError(response.data.message || 'Failed to update user');
      }
    } catch (err: any) {
      console.error('Update user error:', err);
      setFormError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-8 relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-extrabold text-gray-900">Edit User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">NFC Card ID</label>
            <input
              type="text"
              required
              maxLength={10}
              value={formData.card_id}
              onChange={(e) => setFormData({ ...formData, card_id: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl font-mono text-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500"
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Staff">Staff</option>
              <option value="Faculty">Faculty</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>

          {/* Active Status Toggle Checkbox */}
          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 cursor-pointer">
              User is Active
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};