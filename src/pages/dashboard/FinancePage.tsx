import React, { useEffect, useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { CreditCard, Calendar, Download, TrendingUp } from 'lucide-react';

interface Transaction {
    transaction_id: string;
    amount: number;
    status: string;
    date: number;
    method: string;
    card_last4: string;
}

export const FinancePage: React.FC = () => {
    const { getMyBusinesses } = useBusiness();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const myBusinesses = getMyBusinesses();
    const business = myBusinesses[0]; // Get user's first business

    useEffect(() => {
        if (!business) return;

        fetch(`/api/subscription/history/${business.business_id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        })
            .then(res => res.json())
            .then(data => {
                setTransactions(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [business]);

    if (!business) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500">Nenhuma empresa encontrada para este usuário.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Financeiro</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Plano Atual</h3>
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <CreditCard size={20} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 capitalize">{business.is_premium ? 'Premium' : 'Gratuito'}</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {business.is_premium ? 'Renova em 30 dias' : 'Sem custos'}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Próxima Fatura</h3>
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Calendar size={20} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">R$ {business.is_premium ? '99,90' : '0,00'}</p>
                    <p className="text-sm text-gray-400 mt-1">Previsão automática</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Investimento Total</h3>
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        R$ {transactions.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Desde o início</p>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Histórico de Transações</h2>
                    <button className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center">
                        <Download size={16} className="mr-1" /> Exportar
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Carregando histórico...</div>
                ) : transactions.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CreditCard size={24} />
                        </div>
                        <p>Nenhuma transação encontrada.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Data</th>
                                <th className="px-6 py-4 font-medium">Descrição</th>
                                <th className="px-6 py-4 font-medium">Método</th>
                                <th className="px-6 py-4 font-medium">Valor</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((tx) => (
                                <tr key={tx.transaction_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(tx.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        Assinatura Premium Mensal
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center">
                                        <CreditCard size={14} className="mr-2" />
                                        •••• {tx.card_last4}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        R$ {tx.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                            Pago
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
