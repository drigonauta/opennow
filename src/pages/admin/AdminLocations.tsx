```
import React from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { API_BASE_URL } from '../../lib/api';

export const AdminLocations: React.FC = () => {
    const { businesses, refreshData } = useAdmin();

    const handleSimulateLocations = async () => {
        if (!confirm('Isso irá randomizar as coordenadas de empresas que estão na localização padrão (Uberaba). Continuar?')) return;

        let count = 0;
        const updates = businesses.map(async (b: any) => {
            // Check if at default location (approx)
            if (Math.abs(b.latitude - (-19.747)) < 0.001 && Math.abs(b.longitude - (-47.939)) < 0.001) {
                // Add random jitter (~2km radius)
                const latOffset = (Math.random() - 0.5) * 0.04;
                const lngOffset = (Math.random() - 0.5) * 0.04;

                try {
                    await fetch(`${ API_BASE_URL } /api/admin / business / ${ b.business_id } `, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer admin - secret - token`
                        },
                        body: JSON.stringify({
                            latitude: -19.747 + latOffset,
                            longitude: -47.939 + lngOffset
                        })
                    });
                    count++;
                } catch {
                    console.error("Failed to update loc for", b.name);
                }
            }
        });

        await Promise.all(updates);
        alert(`${ count } empresas tiveram suas localizações simuladas!`);
        refreshData();
    };

    const locationStats = Object.entries(businesses.reduce((acc: any, b: any) => {
        const key = `${ b.state || 'N/A' } - ${ b.city || 'N/A' } `;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {}));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Locais</h1>
                    <p className="text-gray-400">Distribuição geográfica das empresas.</p>
                </div>
                <button
                    onClick={handleSimulateLocations}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-purple-900/20"
                >
                    <RefreshCw size={18} />
                    Simular GPS (Randomizar)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Cidades Ativas</h3>
                    <div className="space-y-3">
                        {locationStats.map(([location, count]: any) => {
                            const [state, city] = location.split(' - ');
                            return (
                                <div key={location} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{city}</p>
                                            <p className="text-xs text-gray-500">{state}</p>
                                        </div>
                                    </div>
                                    <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs font-bold">
                                        {count} empresas
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center justify-center text-gray-500">
                    <p>Mapa interativo em breve...</p>
                </div>
            </div>
        </div>
    );
};
