import React, { useEffect, useState } from 'react';
import type { AttendanceLog } from '../types';
import { api } from '../services/api';

interface DashboardProps {
    onOpenTapModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenTapModal }) => {
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch logs from the backend API
    const fetchLogs = async () => {
        try {
            const response = await api.get('/logs');
            if (response.data.success) {
                setLogs(response.data.logs || []);
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
            setError('Unable to connect to server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();

        // Listen for live scan updates from TapModal
        const handleAttendanceUpdate = () => fetchLogs();
        window.addEventListener('attendance-updated', handleAttendanceUpdate);

        // Auto-refresh every 10 seconds as a fallback
        const interval = setInterval(fetchLogs, 10000);

        return () => {
            clearInterval(interval);
            window.removeEventListener('attendance-updated', handleAttendanceUpdate);
        };
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col min-h-[calc(100vh-4rem)] justify-between">

            {/* Central Dashboard Logs Section */}
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden flex-1 mb-8">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Attendance Dashboard</h2>
                        <p className="text-xs text-gray-500">Live feed of Time-In and Time-Out logs</p>
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                        Refresh Logs
                    </button>
                </div>

                <div className="flex-1 overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-gray-400 font-medium">
                            Loading attendance logs...
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64 text-red-500 font-medium">
                            {error}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <p className="font-medium text-base">No attendance logs found.</p>
                            <p className="text-xs mt-1">Scan a card to record the first entry!</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="py-3 px-6">Name</th>
                                    <th className="py-3 px-6">Role</th>
                                    <th className="py-3 px-6">Card ID</th>
                                    <th className="py-3 px-6">Time In</th>
                                    <th className="py-3 px-6">Time Out</th>
                                    <th className="py-3 px-6 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {logs.map((log) => (
                                    <tr key={log.log_id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="py-4 px-6 font-semibold text-gray-900">{log.user_name}</td>
                                        <td className="py-4 px-6 text-gray-600">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                                {log.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-500 font-mono text-xs">{log.card_id}</td>
                                        <td className="py-4 px-6 text-gray-600">
                                            {new Date(log.time_in).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">
                                            {log.time_out ? new Date(log.time_out).toLocaleString() : '—'}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {log.time_out ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                                                    Active In
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Bottom Action Section: Tap Trigger Button */}
            <div className="w-full flex justify-center pb-2">
                <button
                    onClick={onOpenTapModal}
                    className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-lg font-bold rounded-2xl shadow-xl hover:shadow-indigo-200 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-300 flex items-center space-x-3 cursor-pointer"
                >
                    <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.115 6.845l.209-.414m-7.2-4.14a13.882 13.882 0 00-2.05-6.75m14.85 2.25a14.004 14.004 0 00-11.45-3.35" />
                    </svg>
                    <span>Tap Card to Scan</span>
                </button>
            </div>
        </div>
    );
};