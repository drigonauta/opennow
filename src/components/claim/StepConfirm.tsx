import React, { useState } from 'react';
import { User, Phone, Mail, Building2 } from 'lucide-react';

interface StepConfirmProps {
    businessName: string;
    initialData: {
        name: string;
        email: string;
        phone: string;
    };
    onNext: (data: { name: string; email: string; phone: string }) => void;
}

export const StepConfirm: React.FC<StepConfirmProps> = ({ businessName, initialData, onNext }) => {
    const [formData, setFormData] = useState(initialData);



    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Reivindicar {businessName}</h2>
                <p className="text-gray-500 mt-2">Confirme seus dados para iniciarmos o processo de verificação.</p>
            </div>

            {/* Removed generic form submission to manual handling for better UX control */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome Completo</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Ex: João Silva"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Profissional</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Ex: contato@empresa.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Ex: (34) 99999-9999"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        if (!formData.name || !formData.email || !formData.phone) {
                            alert("Por favor, preencha todos os campos.");
                            return;
                        }
                        onNext(formData);
                    }}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transform hover:scale-[1.02] transition-all shadow-lg shadow-blue-200 mt-6"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
};
