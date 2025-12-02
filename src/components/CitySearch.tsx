/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { Crosshair } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

declare global {
    interface Window {
        google: any;
    }
}

export const CitySearch: React.FC = () => {
    const { currentCity, currentState, setLocation, detectLocation } = useLocation();
    const pickerRef = useRef<any>(null);

    useEffect(() => {
        // @ts-expect-error - Exposing for debugging/external use
        window.locationContext = { setLocation };
    }, [setLocation]);

    const processPlace = React.useCallback((place: any) => {
        console.log("📍 Processing Place:", place);
        console.log("📍 Address Components:", place.address_components);
        console.log("📍 Formatted Address:", place.formatted_address);
        let city = '';
        let state = '';
        let country = '';

        // 1. Try Address Components
        if (place.address_components) {
            for (const component of place.address_components) {
                const types = component.types;
                if (types.includes('locality')) {
                    city = component.long_name;
                }
                if (types.includes('administrative_area_level_1')) {
                    state = component.short_name;
                }
                if (types.includes('country')) {
                    country = component.short_name;
                }
                // Fallback for city
                if (!city && types.includes('administrative_area_level_2')) {
                    city = component.long_name;
                }
                if (!city && types.includes('sublocality_level_1')) {
                    city = component.long_name;
                }
            }
        }

        // 2. Fallback: Try Formatted Address (e.g. "Jaú - SP, Brasil")
        if ((!city || !state) && place.formatted_address) {
            console.log("⚠️ Using formatted_address fallback");
            const parts = place.formatted_address.split(',').map((p: string) => p.trim());
            // Expected formats: "City - State, Country" or "City, State, Country"

            // Try to find State (2 chars)
            const statePartIndex = parts.findIndex((p: string) => /^[A-Z]{2}$/.test(p) || /\s[A-Z]{2}$/.test(p));

            if (statePartIndex !== -1) {
                const statePart = parts[statePartIndex];
                // Extract "SP" from "Jaú - SP" or just "SP"
                const stateMatch = statePart.match(/[A-Z]{2}$/);
                if (stateMatch) state = stateMatch[0];

                // City is usually before state
                if (statePartIndex > 0) {
                    const cityPart = parts[statePartIndex - 1];
                    // Remove " - SP" suffix if present in city part
                    city = cityPart.replace(/\s-\s[A-Z]{2}$/, '').trim();
                } else if (parts[0].includes('-')) {
                    // Handle "Jaú - SP" in first part
                    const split = parts[0].split('-');
                    if (split.length > 1) {
                        city = split[0].trim();
                        const potentialState = split[1].trim();
                        if (potentialState.length === 2) state = potentialState;
                    }
                }
            }
        }

        console.log(`📍 Extracted: ${city}, ${state}`);

        // Logic to determine scope
        if (city && state) {
            // Specific City
            setLocation(state, city);
        } else if (state) {
            // Whole State
            setLocation(state, 'Todas');
        } else if (country) {
            // Whole Country
            setLocation('Todas', 'Todas');
        } else {
            // Fallback
            console.warn("Could not determine location, defaulting to Todas");
            setLocation('Todas', 'Todas');
        }
    }, [setLocation]);

    useEffect(() => {
        const picker = pickerRef.current;
        if (!picker) return;

        const handlePlaceChange = () => {
            const place = picker.value;
            if (place) {
                processPlace(place);
            }
        };

        picker.addEventListener('gmpx-placechange', handlePlaceChange);
        return () => {
            picker.removeEventListener('gmpx-placechange', handlePlaceChange);
        };
    }, [processPlace]);

    const handleGPS = async () => {
        await detectLocation();
    };

    return (
        <div className="flex items-center gap-2">
            <div className="relative group flex items-center z-50 w-80">
                {/* @ts-expect-error - Web Component */}
                <gmpx-place-picker
                    ref={pickerRef}
                    placeholder={`${currentCity}, ${currentState}`}
                    style={{ width: '100%' }}
                ></gmpx-place-picker>
            </div>

            <button
                onClick={handleGPS}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-full shadow-lg transition-all hover:scale-105 border border-blue-400 flex-shrink-0"
                title="Usar minha localização atual"
            >
                <Crosshair size={20} />
            </button>
        </div>
    );
};
