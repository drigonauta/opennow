import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, PlusCircle, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
    <Link to={to} className={cn("flex flex-col items-center justify-center w-full h-full space-y-1",
        active ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
    )}>
        <Icon size={24} />
        <span className="text-xs font-medium">{label}</span>
    </Link>
);

export const Navbar: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 pb-safe z-50">
            <div className="flex justify-around items-center h-full max-w-md mx-auto">
                <NavItem to="/" icon={Home} label="Início" active={isActive('/')} />
                <NavItem to="/map" icon={Map} label="Mapa" active={isActive('/map')} />
                <NavItem to="/register-business" icon={PlusCircle} label="Cadastrar" active={isActive('/register-business')} />
                <NavItem to="/dashboard" icon={Settings} label="Painel" active={isActive('/dashboard')} />
            </div>
        </nav>
    );
};
