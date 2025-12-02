import React, { useState } from 'react';
import { ShieldCheck, X, CheckCircle, AlertTriangle, Phone } from 'lucide-react';
import type { Business } from '../types';

interface ClaimBusinessModalProps {
    business: Business;
    onClose: () => void;
}

export const ClaimBusinessModal: React.FC<ClaimBusinessModalProps> = ({ business, onClose }) => {
    const [step, setStep] = useState<'intro' | 'verify' | 'success'>('intro');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClaim = async () => {
        setLoading(true);
        setError('');

        try {
            // Simulate API call to initiate claim
            // In a real app, this would send a code to the business phone or email from Google
            const response = await fetch('/api/business/claim-init', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || 'dev-token'}`
                },
                body: JSON.stringify({ business_id: business.business_id })
            });

            const data = await response.json();

            if (response.ok) {
                setStep('verify');
            } else {
                setError(data.error || 'Erro ao iniciar reivindicação.');
            }
        } catch (err) {
            setError('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setLoading(true);
        // Simulate verification
        setTimeout(() => {
            setLoading(false);
            setStep('success');
        }, 1500);
    };

    if (step === 'success') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl text-center">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Sucesso!</h2>
                    <p className="text-gray-600 mb-6">
                        Você reivindicou a empresa <strong>{business.name}</strong> com sucesso.
                        Agora você tem acesso total ao painel de gerenciamento.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        Ir para o Painel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Reivindicar Empresa</h2>
                        <p className="text-xs text-gray-500">Verificação de Propriedade</p>
                    </div>
                </div>

                {step === 'intro' && (
                    <>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-blue-900 mb-2">{business.name}</h3>
                            <p className="text-sm text-blue-700 mb-3">
                                Para garantir a segurança, precisamos confirmar que você é o proprietário.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-blue-800 bg-white/50 p-2 rounded">
                                <Phone size={14} />
                                <span>Número cadastrado no Google: <strong>{business.whatsapp || 'Não disponível'}</strong></span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            Utilizaremos os dados oficiais da API do Google Maps para verificar sua identidade.
                            Enviaremos um código de verificação para o número ou email cadastrado.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                <AlertTriangle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleClaim}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Verificando...' : 'Iniciar Verificação'}
                        </button>
                    </>
                )}

                {step === 'verify' && (
                    <>
                        <div className="text-center mb-6">
                            <p className="text-gray-600 mb-4">
                                Digite o código de 6 dígitos que enviamos para o contato da empresa.
                            </p>
                            <input
                                type="text"
                                placeholder="000000"
                                className="w-full text-center text-3xl tracking-widest font-mono border-2 border-gray-200 rounded-xl py-3 focus:border-blue-500 focus:outline-none"
                                maxLength={6}
                            />
                        </div>

                        <button
                            onClick={handleVerifyCode}
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-70"
                        >
                            {loading ? 'Validando...' : 'Confirmar Código'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
