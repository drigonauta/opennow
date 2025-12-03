import React from 'react';

export const Heatmap: React.FC = () => {
    // Mock data for visual representation
    const weeks = 52;
    const days = 7;

    const getIntensity = () => {
        const rand = Math.random();
        if (rand > 0.9) return 'bg-blue-500';
        if (rand > 0.7) return 'bg-blue-600/80';
        if (rand > 0.5) return 'bg-blue-700/60';
        if (rand > 0.3) return 'bg-blue-800/40';
        return 'bg-gray-800';
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Engajamento por Cidade</h3>
                <select className="bg-gray-800 border border-gray-700 text-xs rounded px-2 py-1 text-gray-300 focus:outline-none">
                    <option>Últimos 12 meses</option>
                    <option>Últimos 30 dias</option>
                </select>
            </div>

            <div className="flex gap-1 overflow-hidden">
                {Array.from({ length: weeks }).map((_, w) => (
                    <div key={w} className="flex flex-col gap-1">
                        {Array.from({ length: days }).map((_, d) => (
                            <div
                                key={d}
                                className={`w-3 h-3 rounded-sm ${getIntensity()} hover:ring-1 hover:ring-white transition-all cursor-pointer`}
                                title={`Atividade: ${Math.floor(Math.random() * 100)}`}
                            ></div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 justify-end">
                <span>Menos</span>
                <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-800/40 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-600/80 rounded-sm"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                <span>Mais</span>
            </div>
        </div>
    );
};
