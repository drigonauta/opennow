import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from './LocationContext';
import type { Business, Category } from '../types';

interface BusinessContextType {
    businesses: Business[];
    addBusiness: (business: Omit<Business, 'business_id' | 'owner_id' | 'created_at' | 'updated_at' | 'forced_status'>) => Promise<void>;
    updateBusinessStatus: (id: string, status: 'open' | 'closed' | null) => Promise<void>;
    filterByCategory: () => Business[];
    getOpenBusinesses: () => Business[];
    getMyBusinesses: () => Business[];
    userLocation: { lat: number; lng: number } | null;
    distances: Record<string, string>;
    toggleOpenOnly: () => void;
    isOpenOnly: boolean;
    lastUpdated: Date | null;
    updateBusiness: (id: string, updates: Partial<Business>) => Promise<void>;
    upgradeToPremium: (id: string) => Promise<void>;
    subscribe: (id: string, plan: string, cardDetails: any) => Promise<void>;
    selectedCategory: Category;
    setSelectedCategory: (category: Category) => void;
    filteredBusinesses: Business[];
    loading: boolean;
    error: string | null;
    refreshBusinesses: () => Promise<void>;
    sortBy: 'distance' | 'rating';
    setSortBy: (sort: 'distance' | 'rating') => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);



export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userLocation, calculateDistance, currentCity, currentState } = useLocation();
    const { user } = useAuth();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [distances, setDistances] = useState<Record<string, string>>({});
    const [isOpenOnly, setIsOpenOnly] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');
    const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');

    // WebSocket Connection
    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const ws = new WebSocket(`${protocol}//${host}`);

        ws.onopen = () => {
            console.log('📡 Connected to Real-time Radar');
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'BUSINESS_UPDATED' || message.type === 'BUSINESS_CREATED') {
                console.log('⚡ Real-time update received:', message.payload);
                fetchBusinesses(); // Re-fetch to ensure consistency and sort
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from Radar');
        };

        return () => {
            ws.close();
        };
    }, []);

    const fetchBusinesses = React.useCallback(async () => {
        setLoading(true);
        // Do not clear businesses here to prevent blinking

        try {
            let url = `/api/business/list?`;

            // Add City/State Filter
            if (currentCity && currentCity !== 'Todas') {
                url += `&city=${encodeURIComponent(currentCity)}`;
                if (currentState && currentState !== 'Todas') {
                    url += `&state=${encodeURIComponent(currentState)}`;
                }
            }

            // Add Category Filter (Server-side)
            if (selectedCategory && selectedCategory !== 'All') {
                url += `&category=${encodeURIComponent(selectedCategory)}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data: Business[] = await response.json();

                // Calculate distances and sort if location is available
                if (userLocation) {
                    const newDistances: Record<string, string> = {};
                    data.forEach(b => {
                        const dist = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
                        if (dist < 1) {
                            newDistances[b.business_id] = `${Math.round(dist * 1000)} m`;
                        } else {
                            newDistances[b.business_id] = `${dist.toFixed(1)} km`;
                        }
                        // Attach numeric distance for sorting (temporary)
                        (b as any)._distance = dist;
                    });
                    setDistances(newDistances);

                    // Sort by distance
                    data.sort((a, b) => ((a as any)._distance || 0) - ((b as any)._distance || 0));
                }

                setBusinesses(data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch businesses:", error);
            setError("Failed to load businesses");
        } finally {
            setLoading(false);
        }
    }, [userLocation, calculateDistance, currentCity, currentState, selectedCategory]);

    // Poll for updates every 60 seconds (Time-based status)
    useEffect(() => {
        fetchBusinesses();
        const interval = setInterval(fetchBusinesses, 60000);
        return () => clearInterval(interval);
    }, [fetchBusinesses]); // Re-run when userLocation or selectedCategory changes

    const refreshBusinesses = async () => {
        setLoading(true);
        setError(null);
        try {
            await fetchBusinesses();
        } catch {
            setError('Failed to refresh businesses');
        } finally {
            setLoading(false);
        }
    };

    const getToken = () => {
        // Assuming AuthContext or Login stores the token in localStorage for simplicity in this migration
        // Or we can modify AuthContext to expose the token. 
        // For now, let's assume the token is stored in localStorage by the Login component or AuthContext
        return localStorage.getItem('authToken');
    };

    const addBusiness = async (businessData: any) => {
        const token = getToken();
        if (!token) throw new Error("Must be logged in");

        const response = await fetch('/api/business/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(businessData)
        });

        if (!response.ok) throw new Error("Failed to create business");
        fetchBusinesses(); // Refresh list
    };

    const updateBusinessStatus = async (businessId: string, status: 'open' | 'closed' | null) => {
        await updateBusiness(businessId, { forced_status: status });
    };

    const updateBusiness = async (id: string, updates: Partial<Business>) => {
        try {
            const token = getToken();
            if (!token) throw new Error("Must be logged in to update business");
            const response = await fetch(`/api/business/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                // Optimistic update
                setBusinesses(prev => prev.map(b =>
                    b.business_id === id ? { ...b, ...updates } : b
                ));
            } else {
                throw new Error("Failed to update business");
            }
        } catch (error) {
            console.error("Failed to update business:", error);
            throw error; // Re-throw to be handled by caller if needed
        }
    };

    const upgradeToPremium = async (id: string) => {
        await updateBusiness(id, { is_premium: true });
    };

    const isOpenNow = (business: Business) => {
        if (business.forced_status === 'open') return true;
        if (business.forced_status === 'closed') return false;

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;

        const [openHour, openMinute] = business.open_time.split(':').map(Number);
        const [closeHour, closeMinute] = business.close_time.split(':').map(Number);

        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;

        return currentTime >= openTime && currentTime < closeTime;
    };

    const filterByCategory = () => {
        let filtered = businesses;

        // 1. Open Only Filter (Client-side)
        if (isOpenOnly) {
            filtered = filtered.filter(isOpenNow);
        }

        // Note: Category and City filtering is now handled server-side in fetchBusinesses.
        // We trust 'businesses' to already contain the correct filtered list.

        // Apply Weighted Sorting
        // Weights: Active Ad (1000), Dominante (100), Pro (50), Free (0)
        filtered.sort((a, b) => {
            const getScore = (business: Business) => {
                let score = 0;
                const now = Date.now();
                // 1. Pix Ad Priority
                if (business.highlight_expires_at && business.highlight_expires_at > now) score += 1000;
                // 2. Plan Priority
                if (business.plan === 'dominante') score += 100;
                else if (business.plan === 'pro') score += 50;

                return score;
            };

            const scoreA = getScore(a);
            const scoreB = getScore(b);

            if (scoreA !== scoreB) {
                return scoreB - scoreA; // Primary: Higher score first
            }

            // Secondary Sorting
            if (sortBy === 'rating') {
                return (b.rating || 0) - (a.rating || 0);
            } else if (sortBy === 'distance' && userLocation) {
                return ((a as any)._distance || 0) - ((b as any)._distance || 0);
            }

            return 0;
        });

        return filtered;
    };

    // Derived state for consumers
    const filteredBusinesses = filterByCategory();

    const getOpenBusinesses = () => {
        return businesses.filter(isOpenNow);
    };

    const getMyBusinesses = () => {
        if (!user) return [];
        // user.uid from Firebase context maps to user_id in our new backend
        return businesses.filter(b => b.owner_id === user.uid);
    };

    const toggleOpenOnly = () => {
        setIsOpenOnly(prev => !prev);
    };

    const subscribe = async (id: string, plan: string, cardDetails: any) => {
        try {
            const token = getToken();
            if (!token) throw new Error("Must be logged in");

            const response = await fetch('/api/subscription/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ business_id: id, plan, card_details: cardDetails }),
            });

            if (response.ok) {
                const data = await response.json();
                // Update local state
                setBusinesses(prev => prev.map(b =>
                    b.business_id === id ? { ...b, is_premium: true } : b
                ));
                return data;
            } else {
                throw new Error("Payment failed");
            }
        } catch (error) {
            console.error("Subscription failed:", error);
            throw error;
        }
    };

    return (
        <BusinessContext.Provider value={{
            businesses,
            addBusiness,
            updateBusinessStatus,
            filterByCategory,
            getOpenBusinesses,
            getMyBusinesses,
            userLocation,
            distances,
            toggleOpenOnly,
            isOpenOnly,
            lastUpdated,
            updateBusiness,
            upgradeToPremium,
            subscribe,
            selectedCategory,
            setSelectedCategory,
            filteredBusinesses,
            loading,
            error,
            refreshBusinesses,
            sortBy,
            setSortBy
        }}>
            {children}
        </BusinessContext.Provider>
    );
};

export const useBusiness = () => {
    const context = useContext(BusinessContext);
    if (context === undefined) {
        throw new Error('useBusiness must be used within a BusinessProvider');
    }
    return context;
};
