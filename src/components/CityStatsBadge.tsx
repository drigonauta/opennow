import React, { useEffect, useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { useLocation } from '../context/LocationContext';

export const CityStatsBadge: React.FC = () => {
    const { businesses, getOpenBusinesses } = useBusiness();
    const { currentCity } = useLocation();

    // Calculate stats
    const total = businesses.length;
    const openCount = getOpenBusinesses().length;
    const closedCount = total - openCount;

    // Animation state
    const [displayTotal, setDisplayTotal] = useState(0);
    const [displayOpen, setDisplayOpen] = useState(0);
    const [displayClosed, setDisplayClosed] = useState(0);

    useEffect(() => {
        const duration = 800; // 0.8s
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);

            setDisplayTotal(Math.floor(total * ease));
            setDisplayOpen(Math.floor(openCount * ease));
            setDisplayClosed(Math.floor(closedCount * ease));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Ensure final values are exact
                setDisplayTotal(total);
                setDisplayOpen(openCount);
                setDisplayClosed(closedCount);
            }
        };

        requestAnimationFrame(animate);

    }, [total, openCount, closedCount, currentCity]);

    if (!currentCity || currentCity === 'Todas') return null;

    return (
        <div className="
            flex flex-wrap items-center justify-center gap-2 sm:gap-3
            bg-white/5 backdrop-blur-sm 
            text-white/80 px-3 py-1.5 rounded-full
            transition-all duration-500 ease-in-out
            hover:bg-white/10 hover:text-white
            animate-fade-in
            text-xs sm:text-[13px]
        ">
            <span className="font-semibold drop-shadow-sm flex items-center gap-1.5">
                📊 {currentCity}:
            </span>

            <div className="flex items-center gap-2 sm:gap-3">
                <span className="font-medium">
                    {displayTotal} <span className="opacity-70 font-normal">empresas</span>
                </span>

                <span className="flex items-center gap-1 font-medium text-green-300/90">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    {displayOpen} <span className="opacity-70 font-normal">abertas</span>
                </span>

                <span className="flex items-center gap-1 font-medium text-red-300/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    {displayClosed} <span className="opacity-70 font-normal">fechadas</span>
                </span>
            </div>
        </div>
    );
};
