import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface LocationContextType {
    currentState: string;
    currentCity: string;
    userLocation: { lat: number; lng: number } | null;
    setLocation: (state: string, city: string) => void;
    detectLocation: () => Promise<void>;
    calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentState, setCurrentState] = useState<string>(localStorage.getItem('openow_state') || 'MG');
    const [currentCity, setCurrentCity] = useState<string>(localStorage.getItem('openow_city') || 'Uberaba');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        // Real-time GPS Tracking
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    console.log("📍 GPS Updated:", position.coords.latitude, position.coords.longitude);
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error watching location:", error);
                    // Don't set fallback here, let UI handle "no gps" state
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    const setLocation = (state: string, city: string) => {
        setCurrentState(state);
        setCurrentCity(city);
        localStorage.setItem('openow_state', state);
        localStorage.setItem('openow_city', city);
    };

    const detectLocation = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    // Here we could reverse geocode to get city/state
                },
                (error) => {
                    console.error("Error detecting location:", error);
                    alert("Não foi possível obter sua localização. Verifique as permissões.");
                }
            );
        } else {
            alert("Geolocalização não suportada neste navegador.");
        }
    };

    return (
        <LocationContext.Provider value={{ currentState, currentCity, userLocation, setLocation, detectLocation, calculateDistance }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
