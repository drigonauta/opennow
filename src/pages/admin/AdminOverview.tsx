import React from 'react';
import { Layout, Check, Shield, Star, ArrowUpRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { StatCard } from '../../components/admin/StatCard';
import { AIInsights } from '../../components/admin/AIInsights';
import { Heatmap } from '../../components/admin/Heatmap';
import { ActivityFeed } from '../../components/admin/ActivityFeed';
import { AdsManager } from '../../components/admin/AdsManager';

export const AdminOverview: React.FC = () => {
    const { stats, businesses, openCount, closedCount, premiumCount, loading } = useAdmin();

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-32 bg-gray-800 rounded-xl"></div>
                <div className="grid grid-cols-4 gap-6">
                    <div className="h-32 bg-gray-800 rounded-xl"></div>
                    <div className="h-32 bg-gray-800 rounded-xl"></div>
                    <div className="h-32 bg-gray-800 rounded-xl"></div>
                    <div className="h-32 bg-gray-800 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Visão Geral</h1>
                <p className="text-gray-400">Bem-vindo ao painel de controle do TáAberto.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Layout />}
                    label="Empresas Totais"
                    value={stats?.total_businesses || businesses.length || 0}
                    color="blue"
                    trend="+12% este mês"
                />
                <StatCard
                    icon={<Check />}
                    label="Abertas Agora"
                    value={openCount}
                    color="green"
                />
                <StatCard
                    icon={<Shield />}
                    label="Fechadas Agora"
                    value={closedCount}
                    color="red"
                />
                <StatCard
                    icon={<Star />}
                    label="Planos Premium"
                    value={premiumCount}
                    color="purple"
                    trend="+5% conversão"
                />
            </div>

            {/* AI Insights Module */}
            <AIInsights />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3) */}

                {/* Main Content Grid */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Ads Management Module */}
                    <AdsManager />

                    <Heatmap />

                    {/* Ranking Section */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white">Ranking de Empresas (WhatsApp)</h3>
                            <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                Ver relatório completo <ArrowUpRight size={14} />
                            </button>
                        </div>

                        {stats?.ranking && stats.ranking.length > 0 ? (
                            <div className="space-y-4">
                                {stats.ranking.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                                                    idx === 2 ? 'bg-orange-700/20 text-orange-500' :
                                                        'bg-gray-800 text-gray-500'
                                                }`}>
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <p className="font-medium text-gray-200 group-hover:text-white transition-colors">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-24 bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{ width: `${Math.min((item.clicks / (stats.ranking[0].clicks || 1)) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-bold text-gray-300 w-12 text-right">{item.clicks}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
                                Nenhum dado de clique ainda.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (1/3) */}
                <div className="lg:col-span-1">
                    <ActivityFeed />
                </div>
            </div>
        </div>
    );
};
