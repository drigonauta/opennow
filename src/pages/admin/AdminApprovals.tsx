import React from 'react';
import { CheckCircle } from 'lucide-react';

export const AdminApprovals: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Aprovações</h1>
                <p className="text-gray-400">Gerencie solicitações pendentes.</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Tudo limpo!</h3>
                <p className="text-gray-400">Não há empresas ou alterações pendentes de aprovação no momento.</p>
            </div>
        </div>
    );
};
