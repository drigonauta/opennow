import React from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Link } from 'react-router-dom';
import { Power, Edit, Star } from 'lucide-react';

export const DashboardHome: React.FC = () => {
    const { getMyBusinesses, updateBusinessStatus } = useBusiness();
    const myBusiness = getMyBusinesses()[0]; // Assuming single business for MVP

    if (!myBusiness) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">Nenhuma empresa encontrada.</p>
                <Link to="/register" className="text-blue-600 font-medium">Cadastrar Empresa</Link>
            </div>
        );
    }

    const isOpen = myBusiness.forced_status === 'open' ||
        (myBusiness.forced_status === null && isTimeOpen(myBusiness));

    return (
        <div className="space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{myBusiness.name}</h2>
                        <p className="text-sm text-gray-500">{myBusiness.category}</p>
                    </div>
                    {myBusiness.is_premium && (
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                            <Star size={12} className="mr-1 fill-yellow-700" /> Premium
                        </span>
                    )}
                </div>

                <div className={`p-4 rounded-lg mb-4 text-center border ${isOpen ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-sm text-gray-500 mb-1">Status Atual</p>
                    <p className={`text-2xl font-bold ${isOpen ? 'text-green-700' : 'text-red-700'}`}>
                        {isOpen ? 'ABERTO' : 'FECHADO'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => updateBusinessStatus(myBusiness.business_id, isOpen ? 'closed' : 'open')}
                        className={`flex items-center justify-center p-3 rounded-lg font-medium transition-colors ${isOpen
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                    >
                        <Power size={18} className="mr-2" />
                        {isOpen ? 'Fechar' : 'Abrir'}
                    </button>
                    <Link
                        to="/dashboard/edit"
                        className="flex items-center justify-center p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                    >
                        <Edit size={18} className="mr-2" />
                        Editar
                    </Link>
                </div>
            </div>

            {/* Quick Stats (Mock) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500">Visualizações hoje</p>
                    <p className="text-xl font-bold text-gray-900">124</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500">Cliques no WhatsApp</p>
                    <p className="text-xl font-bold text-gray-900">12</p>
                </div>
            </div>
        </div>
    );
};

// Helper (duplicate, should be in utility)
const isTimeOpen = (business: any) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [openHour, openMinute] = business.open_time.split(':').map(Number);
    const [closeHour, closeMinute] = business.close_time.split(':').map(Number);

    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;

    return currentTime >= openTime && currentTime < closeTime;
};
