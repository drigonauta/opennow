import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Award } from 'lucide-react';

export const UserStatusBadge: React.FC = () => {
    const { user, leadProfile } = useAuth();

    if (!user) return null;

    return (
        <div className="
      flex items-center gap-3 
      bg-white/10 border border-white/20 
      backdrop-blur-md 
      text-white px-3 py-1.5 rounded-full 
      shadow-md
      transition-all
      hover:bg-white/20
    ">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                <span className="font-medium text-sm">
                    {user.displayName || user.email?.split('@')[0] || "Usuário"}
                </span>
            </div>

            {(leadProfile?.points || 0) > 0 && (
                <div className="flex items-center gap-1 pl-2 border-l border-white/20 text-yellow-300">
                    <Award size={14} />
                    <span className="text-xs font-bold">{leadProfile?.points || 0} pts</span>
                </div>
            )}
        </div>
    );
};
