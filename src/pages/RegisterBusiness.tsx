import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Clock, FileText, Image as ImageIcon, Mail, Lock, AlertCircle } from 'lucide-react';
import type { Category } from '../types';
import { locationService } from '../services/locationService';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const RegisterBusiness: React.FC = () => {
    const { registerWithEmail } = useAuth();
    const { addBusiness } = useBusiness();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResetLink, setShowResetLink] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: 'Food' as Category,
        address: '',
        whatsapp: '',
        openTime: '08:00',
        closeTime: '18:00',
        description: '',
        logoUrl: '',
        email: '',
        password: '',
        customCategory: '',
        state: '',
        city: '',
        latitude: -19.747,
        longitude: -47.939
    });

    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    useEffect(() => {
        locationService.getStates().then(setStates);
    }, []);

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }));
                    alert('Localização capturada com sucesso!');
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert('Erro ao obter localização. Verifique as permissões do navegador.');
                }
            );
        } else {
            alert('Geolocalização não suportada neste navegador.');
        }
    };

    const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const stateSigla = e.target.value;
        setFormData({ ...formData, state: stateSigla, city: '' });
        if (stateSigla) {
            const citiesList = await locationService.getCities(stateSigla);
            setCities(citiesList);
        } else {
            setCities([]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setShowResetLink(false);

        try {
            // 1. Create Auth User
            const user = await registerWithEmail(formData.email, formData.password);

            // 2. Create Business Profile
            // Note: addBusiness in context usually expects the user to be logged in.
            // Since we just registered, the AuthContext should update 'user' state, 
            // but we might need to wait or pass the ID manually if the context update is slow.
            // However, registerWithEmail usually signs the user in automatically.

            await addBusiness({
                name: formData.name,
                category: formData.category === 'Other' ? `Other:${formData.customCategory}` : formData.category,
                description: formData.description,
                open_time: formData.openTime,
                close_time: formData.closeTime,
                whatsapp: formData.whatsapp,
                latitude: formData.latitude,
                longitude: formData.longitude,
                is_premium: false,
                analytics: { views: 0, clicks: 0, appearances: 0 },
                owner_id: user.uid,
                state: formData.state,
                city: formData.city
            } as any); // Type cast if needed until context types are updated

            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Este e-mail já está cadastrado no sistema.');
                setShowResetLink(true);
            } else {
                setError(err.message || 'Erro ao criar conta.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!formData.email) return;
        try {
            await sendPasswordResetEmail(auth, formData.email);
            setResetSent(true);
            setError(''); // Clear error to show success state cleanly
        } catch (err: any) {
            console.error(err);
            setError('Erro ao enviar e-mail de redefinição.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900">Cadastre seu Negócio</h2>
                    <p className="mt-2 text-gray-600">Junte-se ao OpenNow e seja encontrado por milhares de clientes.</p>
                </div>

                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p>{error}</p>
                                {showResetLink && (
                                    <button
                                        type="button"
                                        onClick={handleResetPassword}
                                        className="mt-2 text-red-700 underline font-medium hover:text-red-800"
                                    >
                                        Esqueci minha senha (Enviar e-mail de redefinição)
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {resetSent && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center">
                            <Mail className="w-5 h-5 mr-2" />
                            E-mail de redefinição enviado para {formData.email}! Verifique sua caixa de entrada.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Account Info */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Dados de Acesso</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="admin@empresa.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Senha</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input type="password" name="password" required value={formData.password} onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="••••••••" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Business Info */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Informações da Empresa</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building2 className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="Ex: Padaria Central" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                                        <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border">
                                            <option value="Food">Alimentação</option>
                                            <option value="Pharmacy">Farmácia</option>
                                            <option value="Services">Serviços</option>
                                            <option value="Retail">Varejo</option>
                                            <option value="Health">Saúde</option>
                                            <option value="Driver">Motorista Particular</option>
                                            <option value="Delivery">Motoboy / Entregador</option>
                                            <option value="Freelancer">Freelancer</option>
                                            <option value="Other">Outros (Especificar)</option>
                                        </select>
                                        {formData.category === 'Other' && (
                                            <input
                                                type="text"
                                                name="customCategory"
                                                value={formData.customCategory}
                                                onChange={handleChange}
                                                placeholder="Qual sua categoria?"
                                                className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input type="tel" name="whatsapp" required value={formData.whatsapp} onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="+55 34 99999-9999" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleStateChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {states.map(state => (
                                            <option key={state.id} value={state.sigla}>{state.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cidade</label>
                                    <select
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                                        required
                                        disabled={!formData.state}
                                    >
                                        <option value="">Selecione...</option>
                                        {cities.map(city => (
                                            <option key={city.id} value={city.nome}>{city.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Endereço Completo</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input type="text" name="address" required value={formData.address} onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="Rua Exemplo, 123, Bairro" />
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        <MapPin size={16} />
                                        Usar minha localização atual (GPS)
                                    </button>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Lat: {formData.latitude?.toFixed(6)}, Lng: {formData.longitude?.toFixed(6)}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Abertura</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Clock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input type="time" name="openTime" required value={formData.openTime} onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Fechamento</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Clock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input type="time" name="closeTime" required value={formData.closeTime} onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Descrição Curta</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="Conte um pouco sobre seu negócio..." />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">URL do Logo (Opcional)</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ImageIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input type="url" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="https://..." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                {loading ? 'Criando Conta...' : 'Finalizar Cadastro'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
