import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import type { Category } from '../types';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const { addBusiness, userLocation } = useBusiness();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const [formData, setFormData] = useState({
        name: '',
        category: 'Food' as Category,
        description: '',
        address: '',
        phone: '',
        whatsapp: '',
        openTime: '08:00',
        closeTime: '18:00'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addBusiness({
            name: formData.name,
            category: formData.category,
            description: formData.description,
            open_time: formData.openTime,
            close_time: formData.closeTime,
            whatsapp: formData.whatsapp,
            latitude: userLocation?.lat || -19.747,
            longitude: userLocation?.lng || -47.939,
            plan: 'free'
        });
        navigate('/');
    };

    return (
        <div className="pb-20 min-h-screen bg-gray-50">
            <header className="bg-white p-4 shadow-sm">
                <h1 className="text-xl font-bold text-gray-900">Cadastrar Empresa</h1>
            </header>

            <main className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome do Estabelecimento</label>
                        <input
                            required
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                        >
                            <option value="Food">Alimentação</option>
                            <option value="Pharmacy">Farmácia</option>
                            <option value="Services">Serviços</option>
                            <option value="Retail">Varejo</option>
                            <option value="Health">Saúde</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição Curta</label>
                        <textarea
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            rows={2}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Abre às</label>
                            <input
                                type="time"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                value={formData.openTime}
                                onChange={e => setFormData({ ...formData, openTime: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha às</label>
                            <input
                                type="time"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                value={formData.closeTime}
                                onChange={e => setFormData({ ...formData, closeTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">WhatsApp (apenas números)</label>
                        <input
                            required
                            type="tel"
                            placeholder="5534999999999"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            value={formData.whatsapp}
                            onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cadastrar Grátis
                    </button>
                </form>
            </main>
            <Navbar />
        </div>
    );
};
