import React, { useState } from 'react';
import { Share2, Gift, Users, Copy, CheckCircle } from 'lucide-react';

interface ReferralHistoryItem {
    name: string;
    status: 'approved' | 'pending';
    date: string;
}

export const ReferralPage: React.FC = () => {
    const [referralLink] = useState('https://www.taaberto.com.br/register?ref=12345');
    const [stats] = useState({ count: 3, target: 10, reward: '1 Mês Premium' });
    const [history] = useState<ReferralHistoryItem[]>([
        { name: 'Padaria do Zé', status: 'approved', date: '20/11/2025' },
        { name: 'Lanchonete X', status: 'pending', date: '21/11/2025' },
        { name: 'Mercado Silva', status: 'approved', date: '22/11/2025' },
    ]);

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        alert('Link copiado!');
    };

    const progress = (stats.count / stats.target) * 100;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Gift className="text-purple-600" /> Programa de Indicação
            </h2>

            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">Indique e Ganhe Premium! 🚀</h3>
                        <p className="text-purple-100 mb-4">
                            Convide outros empresários para o OpeNow. A cada <strong>10 indicações aprovadas</strong>, você ganha <strong>1 mês de Plano Premium Grátis</strong>.
                        </p>
                        <div className="bg-white/20 rounded-lg p-3 flex items-center gap-3 backdrop-blur-sm">
                            <code className="flex-1 text-sm font-mono truncate">{referralLink}</code>
                            <button onClick={copyLink} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Copiar Link">
                                <Copy size={18} />
                            </button>
                            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Compartilhar">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="w-full md:w-1/3 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                        <div className="flex justify-between text-sm mb-2 font-medium">
                            <span>Seu Progresso</span>
                            <span>{stats.count}/{stats.target}</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-3 mb-2">
                            <div className="bg-yellow-400 h-3 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-xs text-purple-200 text-center">Faltam {stats.target - stats.count} indicações para o prêmio!</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users size={20} className="text-gray-500" /> Suas Indicações
                </h3>

                {history.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Você ainda não indicou ninguém.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="p-3 rounded-l-lg">Empresa</th>
                                    <th className="p-3">Data</th>
                                    <th className="p-3 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-900">{item.name}</td>
                                        <td className="p-3 text-gray-500">{item.date}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1
                                                ${item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {item.status === 'approved' ? <CheckCircle size={12} /> : null}
                                                {item.status === 'approved' ? 'Aprovado' : 'Pendente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
