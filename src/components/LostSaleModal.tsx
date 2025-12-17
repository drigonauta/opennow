import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

import type { Business } from '../types';

interface LostSaleModalProps {
    onClose: () => void;
    onClaim: () => void;
    onContinue: () => void;
    business: Business;
}

export const LostSaleModal: React.FC<LostSaleModalProps> = ({ onClose, onClaim, onContinue, business }) => {

    // Format phone number for WhatsApp
    const getWhatsAppNumber = (contact: string | undefined) => {
        if (!contact) return null;
        return contact.replace(/\D/g, ''); // Remove all non-digits
    };

    const handleWhatsAppNotify = () => {
        const phone = getWhatsAppNumber(business.whatsapp || business.phone);
        if (phone) {
            // Persuasive message
            const message = `Olá! Tentei acessar a *${business.name}* no *TáAberto* e estava fechada. 😕\n\nO sistema me avisou que *você acabou de perder uma venda*! \n\nCorra e reivindique sua empresa para ativar o Plantão IA e não perder mais clientes: https://www.taaberto.com.br/business/${business.business_id}`;
            window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
        } else {
            alert('Número de contato indisponível para este estabelecimento.');
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border-2 border-red-100"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase leading-tight">
                        O PROPRIETÁRIO <br />
                        <span className="text-red-600">PERDEU UMA VENDA!</span>
                    </h2>

                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Este estabelecimento está fechado e o dono não sabe que você tentou comprar.
                        <br />
                        <span className="font-bold text-gray-800">Avise-o agora mesmo!</span>
                    </p>

                    <div className="w-full space-y-3">
                        {/* WhatsApp Action - Primary */}
                        <button
                            onClick={handleWhatsAppNotify}
                            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            <span>📲</span>
                            Avisar Dono no WhatsApp
                        </button>

                        {/* Secondary Actions */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={onClaim}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs transition-colors"
                            >
                                🛡️ Sou o Dono
                            </button>
                            <button
                                onClick={onContinue}
                                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 font-medium py-3 rounded-xl text-xs transition-colors"
                            >
                                Ver perfil
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 w-full">
                        <p className="text-xs text-center text-gray-400">
                            Ajude o comércio local a não perder clientes.
                        </p>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
