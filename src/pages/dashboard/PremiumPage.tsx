import React, { useState } from 'react';
import { Check, X, Zap, Crown, Award } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { HighlightModal } from '../../components/HighlightModal';

export const PremiumPage: React.FC = () => {
    const { getMyBusinesses, upgradeToPremium } = useBusiness();
    const myBusiness = getMyBusinesses()[0];
    const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
    const [adAmount, setAdAmount] = useState<string>('');

    if (!myBusiness) return null;

    const handleUpgrade = async (plan: 'pro' | 'dominante') => {
        if (confirm(`Deseja assinar o plano ${plan.toUpperCase()}? Simulando pagamento...`)) {
            // In a real app, this would redirect to Stripe/MercadoPago
            await upgradeToPremium(myBusiness.business_id); // This needs to accept plan type in real backend
            // Mocking plan update via context for now (Context needs update to support specific plan arg)
            alert(`Bem-vindo ao plano ${plan.toUpperCase()}!`);
            window.location.reload();
        }
    };

    const calculateAdTime = (amount: string) => {
        const value = parseFloat(amount.replace(',', '.'));
        if (isNaN(value)) return 0;
        return value * 10; // 1 Real = 10 Minutes
    };

    const handlePixAd = () => {
        const minutes = calculateAdTime(adAmount);
        if (minutes <= 0) return alert("Digite um valor válido.");

        setIsHighlightModalOpen(true);
        // In real flow, we pass 'amount' to the modal generates QR Code
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Turbine Seu Negócio</h2>
                <p className="text-gray-500">Escolha o plano ideal ou anuncie avulso para dominar a cidade.</p>
            </div>

            {/* AD SYSTEM - PIX PROPAGANDA */}
            <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-gray-700">
                <div className="absolute top-0 right-0 opacity-20 transform translate-x-10 -translate-y-10">
                    <Zap size={200} className="text-yellow-400" />
                </div>

                <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-bold mb-4 border border-yellow-400/30">
                            <Zap size={12} fill="currentColor" /> PRIORIDADE MÁXIMA
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Anúncio Relâmpago (Pix)</h3>
                        <p className="text-gray-300 mb-4">
                            Sua empresa no <strong className="text-white">topo absoluto</strong> por tempo determinado.
                            Pague o quanto quiser e apareça na hora.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Ativação imediata via Pix
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Quanto você quer investir?</label>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                <input
                                    type="number"
                                    value={adAmount}
                                    onChange={(e) => setAdAmount(e.target.value)}
                                    placeholder="10,00"
                                    className="w-full bg-black/50 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                                />
                            </div>
                            <button
                                onClick={handlePixAd}
                                className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Zap size={18} fill="currentColor" />
                                Anunciar
                            </button>
                        </div>

                        {calculateAdTime(adAmount) > 0 && (
                            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <p className="text-center text-green-400 text-sm">
                                    Sua empresa ficará no **Topo Absoluto** por:
                                    <span className="block text-xl font-bold text-white">{calculateAdTime(adAmount)} minutos</span>
                                </p>
                            </div>
                        )}
                        {!adAmount && <p className="mt-3 text-xs text-center text-gray-500">1 Real = 10 Minutos de destaque</p>}
                    </div>
                </div>
            </div>

            {/* PLANS COMPARISON */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* FREE PLAN */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                    <div className="mb-4">
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-bold">INICIANTE</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Plano Grátis</h3>
                    <div className="my-4">
                        <span className="text-4xl font-bold text-gray-900">R$ 0</span>
                        <span className="text-gray-500">/mês</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-6">Apenas presença, sem destaque.</p>

                    <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                            <Check size={16} className="text-green-500" /> Presença no App
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                            <Check size={16} className="text-green-500" /> WhatsApp e Ligação
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-400">
                            <X size={16} /> Sem Selo Verificado
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-400">
                            <X size={16} /> Sem Destaque
                        </li>
                    </ul>

                    <button disabled className="w-full py-3 bg-gray-100 text-gray-400 font-bold rounded-xl cursor-not-allowed">
                        Plano Atual
                    </button>
                </div>

                {/* PRO PLAN */}
                <div className="bg-white p-6 rounded-2xl border-2 border-ta-blue shadow-lg relative flex flex-col transform md:-translate-y-2">
                    <div className="absolute top-0 right-0 bg-ta-blue text-white text-xs px-3 py-1 rounded-bl-xl rounded-tr-lg font-bold">
                        MAIS POPULAR
                    </div>
                    <div className="mb-4">
                        <span className="bg-blue-50 text-ta-blue text-xs px-2 py-1 rounded-full font-bold flex items-center w-fit gap-1">
                            <Award size={12} /> PROFISSIONAL
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Plano PRO</h3>
                    <div className="my-4">
                        <span className="text-4xl font-bold text-gray-900">R$ 29,90</span>
                        <span className="text-gray-500">/mês</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-6">Para quem quer mais credibilidade.</p>

                    <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                            <Check size={16} className="text-green-500" /> Tudo do Grátis
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                            <Check size={16} className="text-ta-blue" /> Selo Verificado (Azul)
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                            <Check size={16} className="text-green-500" /> Topo da Categoria
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                            <Check size={16} className="text-green-500" /> Relatório de Cliques
                        </li>
                    </ul>

                    <button
                        onClick={() => handleUpgrade('pro')}
                        className="w-full py-3 bg-ta-blue text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200"
                    >
                        Assinar PRO
                    </button>
                </div>

                {/* DOMINANTE PLAN */}
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-2xl flex flex-col relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="mb-4 relative z-10">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center w-fit gap-1 shadow-lg">
                            <Crown size={12} /> DOMINANTE
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white relative z-10">Plano DOMINANTE</h3>
                    <div className="my-4 relative z-10">
                        <span className="text-4xl font-bold text-white">R$ 59,90</span>
                        <span className="text-gray-400">/mês</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-6 relative z-10">Para quem quer liderar o mercado.</p>

                    <ul className="space-y-3 mb-8 flex-1 relative z-10">
                        <li className="flex items-center gap-2 text-sm text-gray-300">
                            <Check size={16} className="text-green-400" /> Tudo do PRO
                        </li>
                        <li className="flex items-center gap-2 text-sm text-white font-bold">
                            <Check size={16} className="text-purple-400" /> Selo Premium (Dourado)
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-300">
                            <Check size={16} className="text-green-400" /> Sempre no Topo da Busca
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-300">
                            <Check size={16} className="text-green-400" /> Destaque Visual (Glow)
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-300">
                            <Check size={16} className="text-green-400" /> Anúncios Rotativos
                        </li>
                    </ul>

                    <button
                        onClick={() => handleUpgrade('dominante')}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-900/50 relative z-10"
                    >
                        DOMINAR AGORA
                    </button>
                </div>
            </div>

            <HighlightModal
                isOpen={isHighlightModalOpen}
                onClose={() => setIsHighlightModalOpen(false)}
                businessId={myBusiness.business_id}
            />
        </div>
    );
};
