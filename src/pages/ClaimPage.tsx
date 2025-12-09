import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusiness } from '../context/BusinessContext';
import { ClaimWizard } from '../components/claim/ClaimWizard';
import { Building2, Loader2 } from 'lucide-react';

export const ClaimPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { businesses, loading } = useBusiness();
    const business = businesses.find(b => b.business_id === id);

    const handleClose = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!business) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Empresa não encontrada</h1>
                <p className="text-gray-500 mb-6">Não conseguimos localizar a empresa com o ID informado.</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                    Voltar para o Início
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <ClaimWizard business={business} onClose={handleClose} />
        </div>
    );
};
