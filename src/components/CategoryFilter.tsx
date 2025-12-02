import React, { useEffect, useState } from 'react';
import type { Category } from '../types';
import { cn } from '../lib/utils';

interface CategoryFilterProps {
    selected: Category;
    onSelect: (category: Category) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ selected, onSelect }) => {
    const [categories, setCategories] = useState<{ id: string, label: string }[]>([]);

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                // Ensure 'All' is first
                const all = { id: 'All', label: 'Todos' };
                setCategories([all, ...data]);
            })
            .catch(err => {
                console.error('Failed to fetch categories', err);
                // Fallback
                setCategories([{ id: 'All', label: 'Todos' }]);
            });
    }, []);

    return (
        <div className="flex overflow-x-auto gap-2 p-4 no-scrollbar">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id === 'All' ? 'All' : cat.id)} // Use ID for selection
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                        selected === (cat.id === 'All' ? 'All' : cat.id)
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    )}
                >
                    {cat.label}
                </button>
            ))}
        </div>
    );
};
