import React, { createContext, useContext, useEffect, useState } from 'react';

interface EventData {
    id: string;
    type: string;
    payload: any;
    created_at: number;
}

interface EventContextType {
    lastEvent: EventData | null;
    isInactive: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lastEvent, setLastEvent] = useState<EventData | null>(null);
    const [isInactive, setIsInactive] = useState(false);
    const inactivityTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // 1. Inactivity Tracker
    useEffect(() => {
        const resetInactivity = () => {
            setIsInactive(false);
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = setTimeout(() => {
                setIsInactive(true);
            }, 10000); // 10 seconds
        };

        // Listeners
        window.addEventListener('mousemove', resetInactivity);
        window.addEventListener('keydown', resetInactivity);
        window.addEventListener('click', resetInactivity);

        // Init
        resetInactivity();

        return () => {
            window.removeEventListener('mousemove', resetInactivity);
            window.removeEventListener('keydown', resetInactivity);
            window.removeEventListener('click', resetInactivity);
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        };
    }, []);

    // 2. WebSocket Listener (Mocked for now via polling or just assuming global broadcast works if we implemented WS client)
    // For MVP, we will rely on the ChatButton to poll or just use the Inactivity for now.
    // But let's add a basic WS client if possible.
    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const ws = new WebSocket(`${protocol}//${host}`);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'EVENT_TRIGGERED') {
                    console.log('🔔 EVENT RECEIVED:', data.payload);
                    setLastEvent(data.payload);
                    // Clear event after 5s
                    setTimeout(() => setLastEvent(null), 5000);
                }
            } catch (e) {
                console.error('WS Parse Error', e);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    return (
        <EventContext.Provider value={{ lastEvent, isInactive }}>
            {children}
        </EventContext.Provider>
    );
};

export const useEvent = () => {
    const context = useContext(EventContext);
    if (!context) throw new Error('useEvent must be used within EventProvider');
    return context;
};
