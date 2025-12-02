import React, { useState } from 'react';
import { Check, X, Zap } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { HighlightModal } from '../../components/HighlightModal';

export const PremiumPage: React.FC = () => {
    const { getMyBusinesses, upgradeToPremium } = useBusiness();
    const myBusiness = getMyBusinesses()[0];
    const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);

    if (!myBusiness) return null;

    const handleUpgrade = async (plan: string) => {
        if (confirm(`Deseja assinar o plano ${plan}?`)) {
            await upgradeToPremium(myBusiness.business_id);
            alert('Plano atualizado com sucesso!');
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">Escolha o Plano Ideal</h2>
                <p className="text-gray-500 mt-2">Potencialize suas vendas com as ferramentas certas.</p>
            </div>

            {/* Highlight Mode Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                    <Zap size={150} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            <Zap className="fill-current text-yellow-300" /> Modo Destaque (PIX)
                        </h3>
                        <p className="text-orange-100 mt-1">
                            Coloque sua empresa no topo da página inicial agora mesmo!
                            <br />
                            <strong>Apenas R$ 1,00 por minuto.</strong>
                        </p>
                    </div>
                    <button
                        onClick={() => setIsHighlightModalOpen(true)}
                        className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
                    >
                        Destacar Agora
                    </button>
                </div>
            </div>

            {/* Comparative Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 bg-gray-50 rounded-tl-xl">Recursos</th>
                            <th className="p-4 bg-gray-100 text-center font-bold text-gray-600">Grátis</th>
                            <th className="p-4 bg-blue-50 text-center font-bold text-blue-600 border-t-4 border-blue-500 relative">
                                <div className="absolute -top-6 left-0 right-0 text-center">
                                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full uppercase tracking-wide">Mais Popular</span>
                                </div>
                                Premium
                            </th>
                            <th className="p-4 bg-purple-50 text-center font-bold text-purple-600 border-t-4 border-purple-500 rounded-tr-xl">
                                IA Chatbot
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700 divide-y divide-gray-200">
                        <tr>
                            <td className="p-4 font-medium">Preço Mensal</td>
                            <td className="p-4 text-center">R$ 0</td>
                            <td className="p-4 text-center font-bold text-blue-600">R$ 99,90</td>
                            <td className="p-4 text-center font-bold text-purple-600">R$ 299,00</td>
                        </tr>
                        <tr>
                            <td className="p-4">Visibilidade no Mapa</td>
                            <td className="p-4 text-center"><Check size={16} className="mx-auto text-green-500" /></td>
                            <td className="p-4 text-center"><Check size={16} className="mx-auto text-green-500" /></td>
                            <td className="p-4 text-center"><Check size={16} className="mx-auto text-green-500" /></td>
                        </tr>
                        <tr>
                            <td className="p-4">Destaque na Busca</td>
                            <td className="p-4 text-center"><X size={16} className="mx-auto text-gray-300" /></td>
                            <td className="p-4 text-center"><Check size={16} className="mx-auto text-green-500" /></td>
                            <td className="p-4 text-center"><Check size={16} className="mx-auto text-green-500" /></td>
                        </tr>
                        <tr>
                            <td className="p-4">Alcance de Clientes</td>
                            <td className="p-4 text-center">Baixo</td>
                            <td className="p-4 text-center font-bold">Alto</td>
                            <td className="p-4 text-center font-bold">Máximo</td>
                        </tr>
                        <tr>
                            <td className="p-4">IA Nôni Integrada</td>
                            <td className="p-4 text-center"><X size={16} className="mx-auto text-gray-300" /></td>
                            <td className="p-4 text-center">Básica</td>
                            <td className="p-4 text-center font-bold text-purple-600">Avançada</td>
                        </tr>
                        <tr>
                            <td className="p-4">Chatbot Automático</td>
                            <td className="p-4 text-center"><X size={16} className="mx-auto text-gray-300" /></td>
                            <td className="p-4 text-center"><X size={16} className="mx-auto text-gray-300" /></td>
                            <td className="p-4 text-center"><Check size={16} className="mx-auto text-green-500" /></td>
                        </tr>
                        <tr>
                            <td className="p-4"></td>
                            <td className="p-4 text-center">
                                <span className="text-gray-400 text-xs">Seu plano atual</span>
                            </td>
                            <td className="p-4 text-center">
                                <button onClick={() => handleUpgrade('Premium')} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                                    Assinar
                                </button>
                            </td>
                            <td className="p-4 text-center">
                                <button onClick={() => handleUpgrade('IA Chatbot')} className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700">
                                    Assinar
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <HighlightModal
                isOpen={isHighlightModalOpen}
                onClose={() => setIsHighlightModalOpen(false)}
                businessId={myBusiness.business_id}
            />
        </div>
    );
};
