import React from 'react';
import { Outlet } from 'react-router-dom';
// import { LayoutDashboard } from 'lucide-react'; // Removed unused
import { Sidebar } from '../components/admin/Sidebar';
import { Topbar } from '../components/admin/Topbar';
import { AdminProvider, useAdmin } from '../context/AdminContext';
import { CommandPalette } from '../components/admin/CommandPalette';

const AdminLayoutContent: React.FC = () => {
    const { handleSync, isSyncing } = useAdmin();

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-500/30">
            <Sidebar />
            <div className="pl-64 flex flex-col min-h-screen">
                <Topbar onSync={handleSync} isSyncing={isSyncing} />
                <main className="flex-1 p-8 overflow-y-auto relative">
                    <Outlet />
                </main>
            </div>
            <CommandPalette />
        </div>
    );
};

export const AdminLayout: React.FC = () => {
    return (
        <AdminProvider>
            <AdminLayoutContent />
        </AdminProvider>
    );
};
