import React, { useEffect, useState } from 'react';
import type { User } from '../types';
import { api } from '../services/api';
import { CreateUserModal } from '../components/CreateUserModal';
import { EditUserModal } from '../components/EditUserModal';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.users || []);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to load users');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        fetchUsers();
      } else {
        alert(response.data.message || 'Failed to delete user');
      }
    } catch (err: any) {
      console.error('Delete user error:', err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Control Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Manage registered users, NFC card bindings, and access privileges.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="mt-4 sm:mt-0 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Register New User</span>
        </button>
      </div>

      {/* Users Management Table */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-md font-bold text-gray-800">Registered System Users</h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
            Total: {users.length}
          </span>
        </div>

        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400 font-medium">Loading user accounts...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500 font-medium">{error}</div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <p className="font-medium text-base">No registered users found.</p>
              <p className="text-xs mt-1">Click 'Register New User' to add one.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Card ID</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-900">{user.name}</td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-600">{user.card_id}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {user.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchUsers}
      />

      <EditUserModal
        isOpen={isEditOpen}
        user={selectedUser}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={fetchUsers}
      />
    </div>
  );
};