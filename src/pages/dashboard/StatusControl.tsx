import React from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Lock, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StatusControl: React.FC = () => {
    const { getMyBusinesses, updateBusinessStatus } = useBusiness();
    const myBusiness = getMyBusinesses()[0];

    if (!myBusiness) return null;

    const isPremium = myBusiness.is_premium;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Controle de Status</h2>

            {/* Auto Mode */}
            <div className={`p-4 rounded-xl border ${myBusiness.forced_status === null ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        <Clock className={`w-5 h-5 mr-3 ${myBusiness.forced_status === null ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div>
                            <h3 className="font-bold text-gray-900">Modo Automático</h3>
                            <p className="text-xs text-gray-500">Segue o horário configurado ({myBusiness.open_time} - {myBusiness.close_time})</p>
                        </div>
                    </div>
                    <button
                        onClick={() => updateBusinessStatus(myBusiness.business_id, null)}
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${myBusiness.forced_status === null ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}
                    >
                        {myBusiness.forced_status === null && <div className="w-2 h-2 bg-white rounded-full" />}
                    </button>
                </div>
            </div>

            {/* Manual Mode (Premium) */}
            <div className="relative">
                {!isPremium && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-gray-200">
                        <Lock className="w-8 h-8 text-gray-400 mb-2" />
                        <h3 className="font-bold text-gray-800">Recurso Premium</h3>
                        <p className="text-sm text-gray-500 mb-3">Controle manual total e destaque.</p>
                        <Link to="/dashboard/premium" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                            Ver Planos
                        </Link>
                    </div>
                )}

                <div className={`space-y-3 ${!isPremium ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className={`p-4 rounded-xl border ${myBusiness.forced_status === 'open' ? 'bg-green-50 border-green-200 ring-1 ring-green-200' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Zap className={`w-5 h-5 mr-3 ${myBusiness.forced_status === 'open' ? 'text-green-600' : 'text-gray-400'}`} />
                                <div>
                                    <h3 className="font-bold text-gray-900">Forçar ABERTO</h3>
                                    <p className="text-xs text-gray-500">Abre imediatamente, ignorando horário.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => updateBusinessStatus(myBusiness.business_id, 'open')}
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${myBusiness.forced_status === 'open' ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}
                            >
                                {myBusiness.forced_status === 'open' && <div className="w-2 h-2 bg-white rounded-full" />}
                            </button>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${myBusiness.forced_status === 'closed' ? 'bg-red-50 border-red-200 ring-1 ring-red-200' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Lock className={`w-5 h-5 mr-3 ${myBusiness.forced_status === 'closed' ? 'text-red-600' : 'text-gray-400'}`} />
                                <div>
                                    <h3 className="font-bold text-gray-900">Forçar FECHADO</h3>
                                    <p className="text-xs text-gray-500">Fecha imediatamente (férias, emergências).</p>
                                </div>
                            </div>
                            <button
                                onClick={() => updateBusinessStatus(myBusiness.business_id, 'closed')}
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${myBusiness.forced_status === 'closed' ? 'border-red-600 bg-red-600' : 'border-gray-300'}`}
                            >
                                {myBusiness.forced_status === 'closed' && <div className="w-2 h-2 bg-white rounded-full" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
