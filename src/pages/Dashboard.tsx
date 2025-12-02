import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Lock, Unlock } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { getMyBusinesses, updateBusinessStatus } = useBusiness();
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const businesses = getMyBusinesses();
    const [selectedId, setSelectedId] = useState<string>('');

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (businesses.length > 0 && !selectedId) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setSelectedId(businesses[0].business_id);
        }
    }, [businesses, selectedId]);

    const selectedBusiness = businesses.find(b => b.business_id === selectedId);

    const handleToggle = (status: 'open' | 'closed' | null) => {
        if (!selectedBusiness) return;

        // If clicking the same status, toggle off (set to null/auto)
        if (selectedBusiness.forced_status === status) {
            updateBusinessStatus(selectedBusiness.business_id, null);
        } else {
            updateBusinessStatus(selectedBusiness.business_id, status);
        }
    };

    return (
        <div className="pb-20 min-h-screen bg-gray-50">
            <header className="bg-white p-4 shadow-sm">
                <h1 className="text-xl font-bold text-gray-900">Painel do Parceiro</h1>
            </header>

            <main className="p-4">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selecione sua empresa</label>
                    <select
                        className="w-full p-3 border rounded-lg mb-6"
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                    >
                        {businesses.map(b => (
                            <option key={b.business_id} value={b.business_id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                {selectedBusiness && (
                    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                        <div className="text-center">
                            <h2 className="text-lg font-semibold">{selectedBusiness.name}</h2>
                            <p className="text-gray-500 text-sm">Gerencie seu status em tempo real</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleToggle('open')}
                                className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${selectedBusiness.forced_status === 'open'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200 hover:border-green-200'
                                    }`}
                            >
                                <Unlock className={`w-8 h-8 ${selectedBusiness.forced_status === 'open' ? 'text-green-600' : 'text-gray-400'}`} />
                                <span className="font-medium">Forçar Aberto</span>
                            </button>

                            <button
                                onClick={() => handleToggle('closed')}
                                className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${selectedBusiness.forced_status === 'closed'
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-gray-200 hover:border-red-200'
                                    }`}
                            >
                                <Lock className={`w-8 h-8 ${selectedBusiness.forced_status === 'closed' ? 'text-red-600' : 'text-gray-400'}`} />
                                <span className="font-medium">Forçar Fechado</span>
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 mt-2 text-center">
                            Use isso para emergências ou feriados. O horário normal ({selectedBusiness.open_time} - {selectedBusiness.close_time}) é automático.
                        </p>
                    </div>
                )}
            </main>
            <Navbar />
        </div>
    );
};
