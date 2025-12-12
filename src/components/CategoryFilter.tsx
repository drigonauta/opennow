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
        <div className="flex overflow-x-auto gap-3 p-2 no-scrollbar">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id === 'All' ? 'All' : cat.id)}
                    className={cn(
                        "px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 border",
                        selected === (cat.id === 'All' ? 'All' : cat.id)
                            ? "bg-ta-blue/20 text-ta-blue border-ta-blue shadow-[0_0_15px_rgba(0,180,255,0.3)] scale-105"
                            : "bg-ta-card/80 text-gray-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-ta-card"
                    )}
                >
                    {cat.label}
                </button>
            ))}
        </div>
    );
};
