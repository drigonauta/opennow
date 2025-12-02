import React from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { BarChart2, Eye, MousePointer, Map } from 'lucide-react';

export const Analytics: React.FC = () => {
    const { getMyBusinesses } = useBusiness();
    const myBusiness = getMyBusinesses()[0];

    if (!myBusiness) return null;

    // Mock Data
    const stats = {
        views: myBusiness.analytics?.views || 1240,
        clicks: myBusiness.analytics?.clicks || 85,
        appearances: myBusiness.analytics?.appearances || 3500,
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Relatórios</h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center text-gray-500 mb-2">
                        <Eye size={16} className="mr-2" />
                        <span className="text-xs">Visualizações</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.views}</p>
                    <p className="text-xs text-green-600 font-medium">+12% essa semana</p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center text-gray-500 mb-2">
                        <MousePointer size={16} className="mr-2" />
                        <span className="text-xs">Cliques no WhatsApp</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.clicks}</p>
                    <p className="text-xs text-green-600 font-medium">+5% essa semana</p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 col-span-2">
                    <div className="flex items-center text-gray-500 mb-2">
                        <Map size={16} className="mr-2" />
                        <span className="text-xs">Aparições no Mapa</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.appearances}</p>
                </div>
            </div>

            {/* Mock Chart Placeholder */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-48">
                <BarChart2 className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">Gráfico de desempenho semanal</p>
            </div>
        </div>
    );
};
