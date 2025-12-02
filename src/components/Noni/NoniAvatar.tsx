import React, { useEffect, useState } from 'react';

interface NoniAvatarProps {
    size?: 'sm' | 'md' | 'lg';
    state?: 'idle' | 'happy' | 'thinking' | 'knocking';
    showShadow?: boolean;
}

export const NoniAvatar: React.FC<NoniAvatarProps> = ({ size = 'md', state = 'idle', showShadow = true }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-24 h-24'
    };

    const [internalState, setInternalState] = useState(state);

    useEffect(() => {
        setInternalState(state);
    }, [state]);

    return (
        <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
            {/* Nôni Character Image */}
            <img
                src="/noni-final-v2.png"
                alt="Noni Avatar"
                className={`w-full h-full object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] z-10 animate-float-internal transition-transform duration-300 ${internalState === 'knocking' ? 'animate-knock' : ''} ${internalState === 'happy' ? 'scale-110' : ''}`}
            />

            {/* Shadow under the avatar */}
            {showShadow && (
                <div className="absolute -bottom-1 w-[60%] h-[10%] bg-black/20 rounded-full blur-sm z-0"></div>
            )}
        </div>
    );
};
