import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    planName: string;
    price: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, planName, price }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });

    if (!isOpen) return null;

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock validation
        if (cardData.number.length < 16) {
            setError('Número do cartão inválido');
            setLoading(false);
            return;
        }

        // Call parent success handler (which will call the actual API)
        try {
            await onSuccess();
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 2000);
        } catch {
            setError('Pagamento recusado. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Pagamento Seguro</h2>
                        <p className="text-sm text-gray-500">Ativando {planName} - {price}/mês</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Pagamento Confirmado!</h3>
                        <p className="text-gray-500 mt-2">Seu plano Premium já está ativo.</p>
                    </div>
                ) : (
                    <form onSubmit={handlePayment} className="space-y-4">
                        {/* Card Number */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Número do Cartão</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    value={cardData.number}
                                    onChange={e => setCardData({ ...cardData, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Nome no Cartão</label>
                            <input
                                type="text"
                                placeholder="COMO NO CARTÃO"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none uppercase"
                                value={cardData.name}
                                onChange={e => setCardData({ ...cardData, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Expiry & CVV */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Validade</label>
                                <input
                                    type="text"
                                    placeholder="MM/AA"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={cardData.expiry}
                                    onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">CVV</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="123"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={cardData.cvv}
                                        onChange={e => setCardData({ ...cardData, cvv: e.target.value.slice(0, 3) })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                                <AlertCircle size={16} className="mr-2" />
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-500/30'
                                }`}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                            ) : (
                                <Lock size={18} className="mr-2" />
                            )}
                            {loading ? 'Processando...' : `Pagar ${price}`}
                        </button>

                        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center">
                            <Lock size={12} className="mr-1" />
                            Pagamento processado via MockGateway (Ambiente Seguro)
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};
