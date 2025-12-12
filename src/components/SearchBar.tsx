import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch?: (term: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSearch }) => {
    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500 group-focus-within:text-ta-blue transition-colors" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl leading-5 bg-ta-card/50 backdrop-blur-md text-white autofill-dark placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-ta-blue/50 focus:border-ta-blue/50 transition-all shadow-inner"
                placeholder="Buscar por nome ou categoria..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && onSearch) {
                        onSearch(value);
                    }
                }}
            />
        </div>
    );
};
