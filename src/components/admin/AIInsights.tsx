import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

export const AIInsights: React.FC = () => {
    return (
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>

            <div className="flex items-center gap-2 mb-4 relative z-10">
                <Sparkles className="text-purple-400" size={20} />
                <h3 className="text-lg font-semibold text-white">Insights Inteligentes (IA)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm hover:bg-gray-800/60 transition-colors">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="text-green-400 mt-1" size={16} />
                        <div>
                            <p className="text-sm text-gray-200 font-medium">Tendência de Alta</p>
                            <p className="text-xs text-gray-400 mt-1">A categoria <span className="text-white font-semibold">Saúde</span> recebeu 78% mais visualizações que ontem.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm hover:bg-gray-800/60 transition-colors">
                    <div className="flex items-start gap-3">
                        <Lightbulb className="text-yellow-400 mt-1" size={16} />
                        <div>
                            <p className="text-sm text-gray-200 font-medium">Destaques do Dia</p>
                            <p className="text-xs text-gray-400 mt-1">Empresas mais clicadas: <span className="text-white">AMO</span>, <span className="text-white">Tiro ao Alvo</span>, <span className="text-white">Intelecto</span>.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm hover:bg-gray-800/60 transition-colors">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-orange-400 mt-1" size={16} />
                        <div>
                            <p className="text-sm text-gray-200 font-medium">Sugestão de Ação</p>
                            <p className="text-xs text-gray-400 mt-1">Existem 3 empresas fechadas há mais de 30 dias. Considere notificá-las.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
