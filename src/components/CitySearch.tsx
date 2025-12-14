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

    // Helper to get state abbreviation
    const getStateAbbreviation = (fullStateName: string): string | null => {
        const map: Record<string, string> = {
            'acre': 'AC', 'alagoas': 'AL', 'amapá': 'AP', 'amazonas': 'AM', 'bahia': 'BA', 'ceará': 'CE',
            'distrito federal': 'DF', 'espírito santo': 'ES', 'goiás': 'GO', 'maranhão': 'MA', 'mato grosso': 'MT',
            'mato grosso do sul': 'MS', 'minas gerais': 'MG', 'pará': 'PA', 'paraíba': 'PB', 'paraná': 'PR',
            'pernambuco': 'PE', 'piauí': 'PI', 'rio de janeiro': 'RJ', 'rio grande do norte': 'RN',
            'rio grande do sul': 'RS', 'rondônia': 'RO', 'roraima': 'RR', 'santa catarina': 'SC',
            'são paulo': 'SP', 'sergipe': 'SE', 'tocantins': 'TO',
            'state of são paulo': 'SP', 'state of rio de janeiro': 'RJ', // Common Google variations
            'state of minas gerais': 'MG'
        };
        const lowerName = fullStateName.toLowerCase().trim();
        return map[lowerName] || null;
    };

    const handleSelectSuggestion = (prediction: any) => {
        // Prediction description format: "Uberaba - MG, Brasil" or "Bauru, State of São Paulo, Brazil"
        const text = prediction.description;
        setInputValue(text);
        setShowSuggestions(false);

        // Extract City and State
        const parts = text.split(',').map((p: string) => p.trim());

        // Strategy 1: Look for "City - State" pattern in first part
        // Often Google returns "Uberaba - MG" as the first component
        if (parts[0].includes('-')) {
            const subParts = parts[0].split('-').map((p: string) => p.trim());
            if (subParts.length >= 2) {
                const potentialState = subParts[subParts.length - 1]; // Last part of split
                if (potentialState.length === 2) {
                    console.log(`📍 Parsed from hyphen: ${subParts[0]}, ${potentialState}`);
                    setLocation(potentialState, subParts[0]);
                    return;
                }
            }
        }

        // Strategy 2: Look for State in 2nd or 3rd position
        let city = parts[0];
        let stateCode = currentState; // Default fallback (try to avoid using this if possible)
        let foundState = false;

        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];

            // Is it a 2-letter code?
            if (part.length === 2 && part === part.toUpperCase()) {
                stateCode = part;
                foundState = true;
                break;
            }

            // Is it a full state name?
            const mapped = getStateAbbreviation(part);
            if (mapped) {
                stateCode = mapped;
                foundState = true;
                break;
            }
        }

        console.log(`📍 Selected: ${city}, ${stateCode} (Found in text? ${foundState})`);
        setLocation(stateCode, city);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            // Prevent manual submission if no suggestion is selected
            if (suggestions.length > 0) {
                // Select the first suggestion automatically
                handleSelectSuggestion(suggestions[0]);
            } else {
                console.log("Input blocked: User must select a city from the list.");
            }
        }
    };

    // Helper to clear invalid input on blur
    const handleBlur = () => {
        // Delay to allow click event on suggestion to fire first
        setTimeout(() => {
            const currentDisplay = currentCity && currentState ? `${currentCity}, ${currentState}` : currentCity || '';
            if (inputValue !== currentDisplay) {
                setInputValue(currentDisplay); // Revert to last valid city
            }
        }, 200);
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
                    onBlur={handleBlur}
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
