import React, { useState, useEffect, useRef } from 'react';
import { Crosshair, Search, MapPin } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

export const CitySearch: React.FC = () => {
    const { currentCity, currentState, setLocation, detectLocation } = useLocation();
    const [inputValue, setInputValue] = useState(`${currentCity}, ${currentState}`);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync input with context changes (e.g. GPS detection)
    useEffect(() => {
        const newVal = currentCity && currentState ? `${currentCity}, ${currentState}` : currentCity || '';
        if (inputValue !== newVal) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setInputValue(newVal);
        }
    }, [currentCity, currentState]);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        if (!value || value.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (window.google && window.google.maps && window.google.maps.places) {
            const service = new window.google.maps.places.AutocompleteService();
            service.getPlacePredictions({
                input: value,
                types: ['(cities)'],
                componentRestrictions: { country: 'br' }
            }, (predictions: any[], status: any) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setSuggestions(predictions);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            });
        }
    };

    const handleSelectSuggestion = (prediction: any) => {
        // Prediction description format: "Uberaba - MG, Brasil"
        const text = prediction.description;
        setInputValue(text);
        setShowSuggestions(false);

        // Extract City and State
        // Format usually: "City - State, Country" or "City, State, Country"
        const parts = text.split('-').map((p: string) => p.trim());

        let city = parts[0];
        let state = currentState;

        // Try to find state in the second part (e.g. "MG, Brasil")
        if (parts.length > 1) {
            const statePart = parts[1].split(',')[0].trim(); // Get "MG" from "MG, Brasil"
            if (statePart.length === 2) {
                state = statePart;
            }
        } else {
            // Fallback for comma separation: "Uberaba, MG, Brasil"
            const commaParts = text.split(',').map((p: string) => p.trim());
            if (commaParts.length > 1) {
                city = commaParts[0];
                const potentialState = commaParts[1];
                if (potentialState.length === 2) state = potentialState;
            }
        }

        console.log(`📍 Selected: ${city}, ${state}`);
        setLocation(state, city);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setShowSuggestions(false);
            // Parse input to separate City and State if possible
            const parts = inputValue.split(',').map(p => p.trim());
            const newCity = parts[0];
            let newState = currentState;

            if (parts.length > 1) {
                const statePart = parts[1].toUpperCase();
                if (statePart.length === 2) {
                    newState = statePart;
                }
            }

            if (newCity) {
                setLocation(newState, newCity);
            }
        }
    };

    const handleGPS = async () => {
        await detectLocation();
    };

    return (
        <div className="flex items-center gap-2 w-full max-w-md" ref={wrapperRef}>
            <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    placeholder="Cidade, Estado"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-700/50 rounded-lg leading-5 bg-gray-900/90 text-white autofill-dark placeholder-gray-400 focus:outline-none focus:bg-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors shadow-sm"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {suggestions.map((suggestion) => (
                            <div
                                key={suggestion.place_id}
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-gray-900 flex items-center gap-2"
                            >
                                <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                                <span className="block truncate font-medium">
                                    {suggestion.structured_formatting.main_text}
                                </span>
                                <span className="text-gray-500 text-xs truncate">
                                    {suggestion.structured_formatting.secondary_text}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
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
