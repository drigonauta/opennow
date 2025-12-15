import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AdCampaign } from '../types';

interface AdsContextType {
    ads: AdCampaign[];
    activeAd: AdCampaign | null;
    addAd: (ad: any) => Promise<string | undefined>; // Kept for interface compatibility, though creation is now via specific endpoints
    removeAd: (id: string) => Promise<void>; // Kept for interface compatibility
    refreshAds: () => void;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export const AdsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [ads, setAds] = useState<AdCampaign[]>([]);
    const [activeAd, setActiveAd] = useState<AdCampaign | null>(null);

    const fetchAds = async () => {
        try {
            const res = await fetch('/api/marketing/ads');
            if (res.ok) {
                const apiAds = await res.json();

                // Map API response to AdCampaign type
                const mappedAds: AdCampaign[] = apiAds.map((ad: any) => ({
                    id: ad.id,
                    imageUrl: ad.image,
                    link: ad.link,
                    durationMinutes: 0, // Not relevant for display only
                    startTime: Date.now(),
                    status: 'active',
                    type: 'automated',
                    priority: 1,
                    neonColor: '#00ff00', // Default neon
                    businessName: ad.businessName, // Extra field if needed
                    description: ad.description
                }));

                setAds(mappedAds);
            }
        } catch (error) {
            console.error("Failed to fetch ads:", error);
        }
    };

    // Initial Fetch
    useEffect(() => {
        const initAds = async () => {
            await fetchAds();
        };
        initAds();
    }, []);

    // Rotation Logic
    useEffect(() => {
        const interval = setInterval(() => {
            if (ads.length > 0) {
                setActiveAd((current: AdCampaign | null) => {
                    if (current && ads.find(a => a.id === current.id)) {
                        // Rotation chance: 20% every 5 seconds to switch content if multiple ads
                        if (ads.length > 1 && Math.random() > 0.8) {
                            const others = ads.filter(a => a.id !== current.id);
                            return others[Math.floor(Math.random() * others.length)];
                        }
                        return current; // Stay on current
                    }
                    // If no current or current removed, pick random
                    return ads[Math.floor(Math.random() * ads.length)];
                });
            } else {
                setActiveAd(null);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [ads]);

    const addAd = async (newAdData: any) => {
        console.warn("addAd is deprecated in context, use /api/marketing/create", newAdData);
        return undefined;
    };

    const removeAd = async (id: string) => {
        console.warn("removeAd is deprecated in client context", id);
    };

    const refreshAds = () => {
        fetchAds();
    }

    return (
        <AdsContext.Provider value={{ ads, activeAd, addAd, removeAd, refreshAds }}>
            {children}
        </AdsContext.Provider>
    );
};

export const useAds = () => {
    const context = useContext(AdsContext);
    if (!context) {
        throw new Error('useAds must be used within an AdsProvider');
    }
    return context;
};
