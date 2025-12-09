import React, { useState } from 'react';
import { Megaphone, TrendingUp, Zap, Crown } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const MarketingPanel: React.FC = () => {
    const { businesses } = useBusiness();
    // Assuming the first business is the managed one for now, or we'd select one
    const business = businesses[0]; // In real app, select from list
    const isDiamond = business?.plan === 'dominante';
    const [loading, setLoading] = useState(false);

    const campaigns = [
        {
            id: 'boost',
            title: 'Boost de Visibilidade',
            description: 'Sua empresa aparecerá no topo das buscas por 7 dias.',
            price: 49.00,
            icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
            color: 'bg-orange-50 border-orange-200'
        },
        {
            id: 'ad',
            title: 'Anúncio Visual',
            description: 'Banner rotativo na página inicial por 7 dias.',
            price: 99.00,
            icon: <Megaphone className="w-6 h-6 text-purple-500" />,
            color: 'bg-purple-50 border-purple-200'
        }
    ];

    const handleCreateCampaign = async (type: string) => {
        if (!business) return;
        setLoading(true);
        try {
            const res = await fetch('/api/marketing/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || 'dev-token'}`
                },
                body: JSON.stringify({
                    businessId: business.business_id,
                    type,
                    durationDays: 7
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message);
            } else {
                alert(data.error || 'Erro ao criar campanha.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Painel de Marketing</h1>
                <p className="text-gray-500 mt-2">Impulsione sua empresa e alcance mais clientes.</p>
            </div>

            {isDiamond && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Crown className="w-6 h-6 text-yellow-300" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Cliente Diamante</h3>
                            <p className="text-blue-100 text-sm">Você tem 30% de desconto automático em todas as campanhas!</p>
                        </div>
                    </div>
                    <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm font-bold text-sm">
                        Desconto Ativo ✔
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {campaigns.map(camp => {
                    const finalPrice = isDiamond ? camp.price * 0.7 : camp.price;

                    return (
                        <div key={camp.id} className={`border rounded-2xl p-6 transition-all hover:shadow-lg ${camp.color} bg-white`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-white shadow-sm">
                                    {camp.icon}
                                </div>
                                {isDiamond && (
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                                        -30% OFF
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">{camp.title}</h3>
                            <p className="text-gray-600 mb-6 text-sm h-10">{camp.description}</p>

                            <div className="flex items-end gap-2 mb-6">
                                <span className="text-3xl font-bold text-gray-900">
                                    R$ {finalPrice.toFixed(2)}
                                </span>
                                {isDiamond && (
                                    <span className="text-sm text-gray-400 line-through mb-1">
                                        R$ {camp.price.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => handleCreateCampaign(camp.id)}
                                disabled={loading}
                                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                <Zap size={18} />
                                {loading ? 'Criando...' : 'Impulsionar Agora'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
