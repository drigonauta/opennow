import React from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { BarChart2, Eye, MousePointer, Map } from 'lucide-react';

export const Analytics: React.FC = () => {
    const { getMyBusinesses } = useBusiness();
    const myBusiness = getMyBusinesses()[0];

    if (!myBusiness) return null;

    // Check for Premium Plan
    const isPremium = myBusiness.plan === 'pro' || myBusiness.plan === 'dominante';

    // Mock Data (Fallback if analytics undefined)
    const stats = {
        views: myBusiness.analytics?.views || 0,
        clicks: myBusiness.analytics?.clicks || 0,
        appearances: myBusiness.analytics?.appearances || 0,
        likes: myBusiness.analytics?.likes || 0,
        dislikes: myBusiness.analytics?.dislikes || 0,
        whatsapp: myBusiness.analytics?.whatsapp_clicks || 0,
        calls: myBusiness.analytics?.call_clicks || 0
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Relatórios de Desempenho</h2>

            {/* General Stats (Free) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center text-gray-500 mb-2">
                        <Eye size={16} className="mr-2" />
                        <span className="text-xs">Visualizações</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.views}</p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center text-gray-500 mb-2">
                        <Map size={16} className="mr-2" />
                        <span className="text-xs">Aparições no Mapa</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.appearances}</p>
                </div>
            </div>

            {/* Engagement Stats (Premium Only) */}
            <div className={`relative space-y-4 ${!isPremium ? 'blur-sm select-none opacity-50 pointer-events-none' : ''}`}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center text-green-600 mb-2">
                            <span className="mr-2 text-lg">👍</span>
                            <span className="text-xs font-bold">Curtidas</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.likes}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center text-red-500 mb-2">
                            <span className="mr-2 text-lg">👎</span>
                            <span className="text-xs font-bold">Não Curtiu</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.dislikes}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center text-green-500 mb-2">
                            <MousePointer size={16} className="mr-2" />
                            <span className="text-xs font-bold">Cliques WhatsApp</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.whatsapp}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center text-blue-500 mb-2">
                            <MousePointer size={16} className="mr-2" />
                            <span className="text-xs font-bold">Chamadas</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.calls}</p>
                    </div>
                </div>

                {/* Charts */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-48">
                    <BarChart2 className="w-12 h-12 text-gray-300 mb-2" />
                    <p className="text-gray-400 text-sm">Gráfico de Retenção (Semanal)</p>
                </div>
            </div>

            {/* Premium Lock Overlay */}
            {!isPremium && (
                <div className="absolute inset-0 top-[200px] flex items-center justify-center z-10 pointer-events-auto">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-yellow-200 text-center max-w-xs mx-auto">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Recurso Premium</h3>
                        <p className="text-sm text-gray-500 mb-4">Atualize seu plano para ver quem curtiu sua empresa e quantos clientes entraram em contato.</p>
                        <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105 transition-transform">
                            Quero ser Premium
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
