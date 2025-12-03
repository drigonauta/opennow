import React from 'react';
import { useAuth } from '../context/AuthContext';

export const UserStatusBadge: React.FC = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="
      flex items-center gap-2 
      bg-white/10 border border-white/20 
      backdrop-blur-md 
      text-white px-3 py-1.5 rounded-full 
      shadow-md
      transition-all
      hover:bg-white/20
    ">
            <div className="online-dot"></div>
            <span className="font-medium text-sm">
                {user.displayName || user.email?.split('@')[0] || "Usuário"}
            </span>
        </div>
    );
};
