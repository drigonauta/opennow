import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, CheckCircle, MapPin, Users, Tag, Settings, LogOut, Download } from 'lucide-react';

export const Sidebar: React.FC = () => {
    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Visão Geral', end: true },
        { path: '/admin/businesses', icon: Building2, label: 'Empresas' },
        { path: '/admin/approvals', icon: CheckCircle, label: 'Aprovações' },
        { path: '/admin/locations', icon: MapPin, label: 'Locais' },
        { path: '/admin/leads', icon: Users, label: 'Leads' },
        { path: '/admin/categories', icon: Tag, label: 'Categorias' },
        { path: '/admin/import', icon: Download, label: 'Importação' },
    ];

    return (
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-30">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="font-bold text-white text-lg">O</span>
                </div>
                <span className="font-bold text-xl text-white tracking-tight">TáAberto</span>
            </div>

            <div className="px-4 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Workspace</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm text-gray-200 font-medium">Admin Panel</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${isActive
                                ? 'bg-blue-600/10 text-blue-400 shadow-[inset_3px_0_0_0_#3b82f6]'
                                : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
                            }
                        `}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors w-full">
                    <Settings size={18} />
                    Configurações
                </button>
                <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors w-full mt-1">
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </aside>
    );
};
