import React, { createContext, useContext, useState, type ReactNode } from 'react';

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
    const [currentState, setCurrentState] = useState<string>(localStorage.getItem('taaberto_state') || 'MG');
    const [currentCity, setCurrentCity] = useState<string>(localStorage.getItem('taaberto_city') || 'Uberaba');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Removed auto-watch useEffect to prevent overriding selected city

    const setLocation = (state: string, city: string) => {
        setCurrentState(state);
        setCurrentCity(city);
        localStorage.setItem('taaberto_state', state);
        localStorage.setItem('taaberto_city', city);
    };

    const detectLocation = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({
                        lat: latitude,
                        lng: longitude
                    });

                    // Reverse Geocode to get City/State
                    try {
                        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
                        const data = await response.json();

                        if (data.results && data.results.length > 0) {
                            const addressComponents = data.results[0].address_components;
                            let city = '';
                            let state = '';

                            for (const component of addressComponents) {
                                if (component.types.includes('administrative_area_level_2')) {
                                    city = component.long_name;
                                }
                                if (component.types.includes('administrative_area_level_1')) {
                                    state = component.short_name;
                                }
                            }

                            // Fallback if level 2 is missing
                            if (!city) {
                                const locality = addressComponents.find((c: any) => c.types.includes('locality'));
                                if (locality) city = locality.long_name;
                            }

                            if (city && state) {
                                console.log(`📍 GPS Detected: ${city} - ${state}`);
                                setLocation(state, city);
                            }
                        }
                    } catch (error) {
                        console.error("Reverse geocoding failed:", error);
                    }
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
