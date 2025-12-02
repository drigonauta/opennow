import React from 'react';
import { cn } from '../lib/utils';

interface StatusBadgeProps {
    isOpen: boolean;
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ isOpen, className }) => {
    return (
        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
            isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
            className
        )}>
            <span className={cn("relative flex h-2.5 w-2.5")}>
                {isOpen && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5",
                    isOpen ? "bg-green-500" : "bg-red-500"
                )}></span>
            </span>
            {isOpen ? 'Aberto Agora' : 'Fechado'}
        </div>
    );
};
