import React, { useState, useEffect } from 'react';
import { NoniAvatar } from './NoniAvatar';
import { useChat } from '../../App';
import { useEvent } from '../../context/EventContext';

export const ChatButton: React.FC = () => {
    const { isChatOpen, setIsChatOpen } = useChat();
    const { isInactive, lastEvent } = useEvent();
    const [avatarState, setAvatarState] = useState<'idle' | 'happy' | 'knocking'>('idle');

    // React to Inactivity and Events
    useEffect(() => {
        if (isChatOpen) return;

        if (lastEvent) {
            // If event received (e.g. store closing), maybe wave or look happy
            setTimeout(() => setAvatarState('happy'), 0);
            const timer = setTimeout(() => setAvatarState('idle'), 3000);
            return () => clearTimeout(timer);
        }

        if (isInactive) {
            setTimeout(() => setAvatarState('knocking'), 0);
        } else {
            setTimeout(() => setAvatarState('idle'), 0);
        }
    }, [isInactive, lastEvent, isChatOpen]);

    return (
        <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            onMouseEnter={() => setAvatarState('happy')}
            onMouseLeave={() => setAvatarState('idle')}
            className={`fixed bottom-6 right-6 z-50 transition-transform duration-300 hover:scale-110 active:scale-95 ${isChatOpen ? 'scale-0' : 'scale-100'}`}
        >
            <div className="relative">
                <NoniAvatar size="lg" state={avatarState} />

                {/* Notification Badge (Optional) */}
                {/* <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div> */}
            </div>
        </button>
    );
};
