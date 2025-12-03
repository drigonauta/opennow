import React, { useState } from 'react';
import { CreditCard, QrCode, Lock, CheckCircle } from 'lucide-react';
import type { PlanType } from '../../types/subscription';

interface StepCheckoutProps {
    plan: PlanType;
    billingCycle: 'monthly' | 'yearly';
    onConfirm: (paymentData: any) => void;
    loading: boolean;
}

export const StepCheckout: React.FC<StepCheckoutProps> = ({ plan, billingCycle, onConfirm, loading }) => {
    const [method, setMethod] = useState<'pix' | 'card'>('card');
    const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvc: '' });

    const price = plan === 'gold'
        ? (billingCycle === 'monthly' ? 120 : 899)
        : (billingCycle === 'monthly' ? 249 : 1790);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({ method, ...cardData });
    };

    if (plan === 'free') {
        return (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Plano Gratuito Selecionado</h2>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                    Você terá acesso imediato aos recursos básicos para gerenciar sua empresa.
                </p>
                <button
                    onClick={() => onConfirm({ method: 'free' })}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                    {loading ? 'Ativando...' : 'Confirmar e Começar'}
                </button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Finalizar Assinatura</h2>
                <p className="text-gray-500 mt-2">
                    Plano {plan === 'gold' ? 'Ouro' : 'Diamante'} ({billingCycle === 'monthly' ? 'Mensal' : 'Anual'})
                </p>
                <div className="text-3xl font-bold text-blue-600 mt-2">
                    R$ {price.toFixed(2)}
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setMethod('card')}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium flex items-center justify-center gap-2 transition-all ${method === 'card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    <CreditCard size={20} /> Cartão
                </button>
                <button
                    onClick={() => setMethod('pix')}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium flex items-center justify-center gap-2 transition-all ${method === 'pix' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    <QrCode size={20} /> Pix
                </button>
            </div>

            {method === 'card' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Número do Cartão"
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            value={cardData.number}
                            onChange={e => setCardData({ ...cardData, number: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Validade (MM/AA)"
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            value={cardData.expiry}
                            onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="CVC"
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            value={cardData.cvc}
                            onChange={e => setCardData({ ...cardData, cvc: e.target.value })}
                            required
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Nome no Cartão"
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={cardData.name}
                        onChange={e => setCardData({ ...cardData, name: e.target.value })}
                        required
                    />

                    <div className="flex items-center gap-2 text-xs text-gray-500 justify-center mt-4">
                        <Lock size={12} /> Pagamento 100% seguro e criptografado
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transform hover:scale-[1.02] transition-all shadow-lg shadow-blue-200 mt-4 disabled:opacity-70"
                    >
                        {loading ? 'Processando...' : `Pagar R$ ${price.toFixed(2)}`}
                    </button>
                </form>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-48 h-48 bg-white mx-auto mb-4 p-2 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
                        <QrCode size={100} className="text-gray-800" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Escaneie o QR Code para pagar</p>
                    <button
                        onClick={() => onConfirm({ method: 'pix' })}
                        disabled={loading}
                        className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-70"
                    >
                        {loading ? 'Verificando...' : 'Já fiz o pagamento'}
                    </button>
                </div>
            )}
        </div>
    );
};
