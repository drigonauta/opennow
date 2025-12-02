import React, { useState } from 'react';
import { X, Zap, CheckCircle } from 'lucide-react';

interface HighlightModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessId: string;
}

export const HighlightModal: React.FC<HighlightModalProps> = ({ isOpen, onClose, businessId }) => {
    const [step, setStep] = useState<'select' | 'pay' | 'success'>('select');
    const [amount, setAmount] = useState(1);
    const [qrCode, setQrCode] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleCreateOrder = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/highlights/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    business_id: businessId,
                    amount,
                    duration_minutes: amount
                })
            });
            const data = await res.json();
            if (data.success) {
                setQrCode(data.qr_code_url);
                setStep('pay');

                // Simulate auto-confirmation after 5 seconds
                setTimeout(async () => {
                    await fetch('/api/highlights/confirm', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                            order_id: data.order_id,
                            business_id: businessId,
                            duration_minutes: amount
                        })
                    });
                    setStep('success');
                }, 5000);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
                            <Zap className="text-yellow-400 fill-current" /> Destaque Agora
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                    </div>

                    {step === 'select' && (
                        <div className="space-y-6">
                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center">
                                <p className="text-gray-300 mb-2">Quanto tempo você quer ficar no topo?</p>
                                <div className="text-4xl font-bold text-white mb-1">{amount} min</div>
                                <p className="text-sm text-gray-500">R$ 1,00 / minuto</p>

                                <input
                                    type="range"
                                    min="1"
                                    max="60"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full mt-4 accent-yellow-500"
                                />
                            </div>

                            <div className="space-y-2 text-sm text-gray-400">
                                <p className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Apareça na seção "Em Destaque"</p>
                                <p className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Ícone de fogo 🔥 no seu card</p>
                                <p className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> +300% de visibilidade estimada</p>
                            </div>

                            <button
                                onClick={handleCreateOrder}
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl font-bold text-white shadow-lg shadow-orange-900/50 hover:scale-[1.02] transition-transform"
                            >
                                {loading ? 'Gerando PIX...' : `Pagar R$ ${amount},00 com PIX`}
                            </button>
                        </div>
                    )}

                    {step === 'pay' && (
                        <div className="text-center space-y-6">
                            <div className="bg-white p-4 rounded-xl inline-block">
                                <img src={qrCode} alt="QR Code PIX" className="w-48 h-48" />
                            </div>
                            <p className="text-gray-300 text-sm">Escaneie o QR Code para pagar.<br />Aguardando confirmação automática...</p>
                            <div className="animate-pulse text-yellow-500 text-xs font-mono">Verificando pagamento...</div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center space-y-6 py-8">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400">
                                <Zap size={40} className="fill-current" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Sucesso! 🔥</h3>
                                <p className="text-gray-400">Sua empresa está em destaque agora!</p>
                            </div>
                            <button onClick={onClose} className="w-full py-3 bg-gray-800 rounded-xl font-bold text-white hover:bg-gray-700">
                                Fechar e Ver Resultado
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
