import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Clock, Edit, CreditCard, BarChart2, DollarSign, Home, Gift } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Início' },
        { path: '/dashboard/edit', icon: Edit, label: 'Empresa' },
        { path: '/dashboard/status', icon: Clock, label: 'Status' },
        { path: '/dashboard/analytics', icon: BarChart2, label: 'Relatórios' },
        { path: '/dashboard/premium', icon: CreditCard, label: 'Planos' },
        { path: '/dashboard/finance', icon: DollarSign, label: 'Financeiro' },
        { path: '/dashboard/referral', icon: Gift, label: 'Indique' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Bar */}
            <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-xl font-bold text-blue-600">Painel do Lojista</h1>
                <Link to="/" className="text-gray-500 hover:text-blue-600">
                    <Home size={20} />
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 pb-24 overflow-y-auto">
                <Outlet />
            </main>

            {/* Bottom Navigation (Mobile First) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center z-20">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex - col items - center p - 2 rounded - lg transition - colors ${isActive(item.path)
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-400 hover:text-gray-600'
                            } `}
                    >
                        <item.icon size={20} />
                        <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};
