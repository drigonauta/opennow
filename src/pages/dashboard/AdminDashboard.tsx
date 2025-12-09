import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Layout, Star, BarChart2, Shield, Trash2, Check, MapPin, User, Edit, Search, Download, Tag, RefreshCw, DollarSign } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ position, onLocationSelect }: { position: [number, number], onLocationSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position ? <Marker position={position} /> : null;
};

interface Business {
    business_id: string;
    name: string;
    category: string;
    forced_status: string | null;
    is_premium: boolean;
    latitude: number;
    longitude: number;
    zip_code?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    verified?: boolean;
    state?: string;
    city?: string;
    open_time?: string;
    close_time?: string;
}

interface StatItem {
    name: string;
    category: string;
    clicks: number;
}

interface Stats {
    total_businesses: number;
    ranking: StatItem[];
}

interface Lead {
    uid: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    has_business: boolean;
    created_at: string;
    stats?: {
        visits: number;
        whatsapp_clicks: number;
    };
    type?: string;
    status?: string;
    notes?: string;
    contact?: string;
}

interface Category {
    id: string;
    label: string;
}



export const AdminDashboard: React.FC = () => {
    // const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'reviews' | 'approvals' | 'locations' | 'leads' | 'categories' | 'financials'>('overview');
    const [stats, setStats] = useState<Stats | null>(null);
    const [financialData, setFinancialData] = useState<any>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock Admin Check (In real app, check role)
    useEffect(() => {
        // if (!user || user.email !== 'admin@taaberto.com.br') {
        //   navigate('/login');
        // }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = 'admin-secret-token'; // Hardcoded for MVP



            const [statsRes, businessRes, leadsRes, categoriesRes, financialsRes] = await Promise.all([
                fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/businesses', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/leads', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/categories'),
                fetch('/api/admin/financials', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (financialsRes.ok) setFinancialData(await financialsRes.json());

            if (businessRes.ok) {
                const data = await businessRes.json();
                console.log('Admin Businesses Fetched:', data.length, data);
                setBusinesses(data);
            } else {
                console.error('Admin Businesses Fetch Failed:', businessRes.status, businessRes.statusText);
            }

            if (leadsRes.ok) {
                const leadsData = await leadsRes.json();
                console.log('Leads fetched:', leadsData);
                setLeads(leadsData);
            } else {
                console.error('Leads fetch failed:', leadsRes.status, leadsRes.statusText);
            }
            if (categoriesRes.ok) setCategories(await categoriesRes.json());

        } catch (error) {
            console.error("Error fetching admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');

    // --- DELETE MODAL STATE ---
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleDeleteBusiness = (id: string) => {
        setDeleteError(null);
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        setDeleteError(null);

        try {
            const res = await fetch(`/api/admin/business/${deletingId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer admin-secret-token` }
            });

            if (res.ok) {
                setBusinesses(prev => prev.filter(b => b.business_id !== deletingId));
                setDeletingId(null); // Close modal on success
            } else {
                const err = await res.json();
                setDeleteError(err.error || res.statusText);
            }
        } catch (error: any) {
            console.error(error);
            setDeleteError(`Erro de conexão: ${error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const [newCategory, setNewCategory] = useState('');

    const handleCreateCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer admin-secret-token` },
                body: JSON.stringify({ label: newCategory })
            });
            if (res.ok) {
                const data = await res.json();
                setCategories(prev => [...prev, data.category]);
                setNewCategory('');
            } else {
                alert('Erro ao criar categoria');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao criar categoria');
        }
    };

    // --- CATEGORY DELETE MODAL STATE ---
    const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
    const [isDeletingCategory, setIsDeletingCategory] = useState(false);
    const [deleteCategoryError, setDeleteCategoryError] = useState<string | null>(null);

    const handleDeleteCategory = (id: string) => {
        setDeleteCategoryError(null);
        setDeletingCategoryId(id);
    };

    const confirmDeleteCategory = async () => {
        if (!deletingCategoryId) return;
        setIsDeletingCategory(true);
        setDeleteCategoryError(null);

        try {
            const res = await fetch(`/api/admin/categories/${deletingCategoryId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer admin-secret-token` }
            });
            if (res.ok) {
                setCategories(prev => prev.filter(c => c.id !== deletingCategoryId));
                setDeletingCategoryId(null);
            } else {
                setDeleteCategoryError('Erro ao excluir categoria');
            }
        } catch (error) {
            console.error(error);
            setDeleteCategoryError('Erro ao excluir categoria');
        } finally {
            setIsDeletingCategory(false);
        }
    };

    // --- SYNC FUNCTIONALITY ---
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/admin/sync', {
                method: 'POST',
                headers: { Authorization: `Bearer admin-secret-token` }
            });
            if (res.ok) {
                alert('Sincronização enviada com sucesso! O site deve atualizar em instantes.');
            } else {
                alert('Erro ao sincronizar.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao sincronizar.');
        } finally {
            setIsSyncing(false);
        }
    };

    const filteredBusinesses = useMemo(() => {
        if (!searchTerm) return businesses;
        const lowerTerm = searchTerm.toLowerCase();
        return businesses.filter(b =>
            (b.name && b.name.toLowerCase().includes(lowerTerm)) ||
            (b.city && b.city.toLowerCase().includes(lowerTerm)) ||
            (b.category && b.category.toLowerCase().includes(lowerTerm))
        );
    }, [businesses, searchTerm]);

    // Calculate Open/Closed stats client-side for real-time accuracy
    const { openCount, closedCount, premiumCount } = useMemo(() => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        let open = 0;
        let closed = 0;
        let premium = 0;

        businesses.forEach(b => {
            if (b.is_premium) premium++;

            if (b.forced_status === 'open') {
                open++;
                return;
            }
            if (b.forced_status === 'closed') {
                closed++;
                return;
            }

            if (b.open_time && b.close_time) {
                try {
                    const [openH, openM] = b.open_time.split(':').map(Number);
                    const [closeH, closeM] = b.close_time.split(':').map(Number);
                    const start = openH * 60 + openM;
                    const end = closeH * 60 + closeM;

                    if (currentMinutes >= start && currentMinutes < end) {
                        open++;
                    } else {
                        closed++;
                    }
                } catch {
                    closed++; // Default to closed on error
                }
            } else {
                closed++; // Default to closed if no times
            }
        });

        return { openCount: open, closedCount: closed, premiumCount: premium };
    }, [businesses]);

    console.log(`[Admin v2.0] Search: "${searchTerm}" | Results: ${filteredBusinesses.length}`);

    const [editingBusiness, setEditingBusiness] = useState<any>(null);
    const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<any>(null);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

    const handleEditBusiness = (business: any) => {
        setEditingBusiness(business);
        setIsBusinessModalOpen(true);
    };

    const handleCreateBusiness = () => {
        setEditingBusiness({
            name: '', category: 'Food', description: '', whatsapp: '',
            open_time: '08:00', close_time: '18:00', latitude: -19.747, longitude: -47.939
        });
        setIsBusinessModalOpen(true);
    };

    const handleSaveBusiness = async (e: React.FormEvent) => {
        e.preventDefault();
        const isNew = !editingBusiness.business_id;
        const url = isNew ? '/api/admin/business/create' : `/api/admin/business/${editingBusiness.business_id}`;
        const method = isNew ? 'POST' : 'PUT';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer admin-secret-token` },
                body: JSON.stringify(editingBusiness)
            });
            if (res.ok) {
                setIsBusinessModalOpen(false);
                fetchData();
            } else {
                alert('Erro ao salvar empresa');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar');
        }
    };

    const handleEditLead = (lead: any) => {
        setEditingLead(lead);
        setIsLeadModalOpen(true);
    };

    const handleCreateLead = () => {
        setEditingLead({ name: '', contact: '', type: 'whatsapp', status: 'new', notes: '' });
        setIsLeadModalOpen(true);
    };

    const handleSaveLead = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/lead/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer admin-secret-token` },
                body: JSON.stringify(editingLead)
            });

            if (res.ok) {
                setIsLeadModalOpen(false);
                fetchData(); // Refresh list
            } else {
                alert('Erro ao salvar lead.');
            }
        } catch (error) {
            console.error('Save Lead Error:', error);
            alert('Erro de conexão ao salvar lead.');
        }
    };

    const handleDeleteLead = async (uid: string) => {
        if (!confirm('Excluir este lead?')) return;
        try {
            await fetch(`/api/admin/lead/${uid}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer admin-secret-token` }
            });
            setLeads(prev => prev.filter(l => l.uid !== uid));
        } catch {
            alert('Erro ao excluir lead');
        }
    };

    const handleSimulateLocations = async () => {
        if (!confirm('Isso irá randomizar as coordenadas de empresas que estão na localização padrão (Uberaba). Continuar?')) return;

        let count = 0;
        const updates = businesses.map(async (b: any) => {
            // Check if at default location (approx)
            if (Math.abs(b.latitude - (-19.747)) < 0.001 && Math.abs(b.longitude - (-47.939)) < 0.001) {
                // Add random jitter (~2km radius)
                const latOffset = (Math.random() - 0.5) * 0.04;
                const lngOffset = (Math.random() - 0.5) * 0.04;

                try {
                    await fetch(`/api/business/update/${b.business_id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer admin-secret-token`
                        },
                        body: JSON.stringify({
                            latitude: -19.747 + latOffset,
                            longitude: -47.939 + lngOffset
                        })
                    });
                    count++;
                } catch {
                    console.error("Failed to update loc for", b.name);
                }
            }
        });

        await Promise.all(updates);
        alert(`${count} empresas tiveram suas localizações simuladas!`);
        fetchData(); // Refresh
    };

    if (loading) return <div className="flex items-center justify-center h-screen text-white">Carregando Painel...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
            {/* DELETE CONFIRMATION MODAL */}
            {deletingId && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-2">Confirmar Exclusão</h3>
                        <p className="text-gray-300 mb-6">
                            Tem certeza que deseja excluir esta empresa permanentemente? Esta ação não pode ser desfeita.
                        </p>

                        {deleteError && (
                            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">
                                <strong>Erro:</strong> {deleteError}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setDeletingId(null); setDeleteError(null); }}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-200"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white flex items-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CATEGORY DELETE CONFIRMATION MODAL */}
            {deletingCategoryId && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-2">Excluir Categoria?</h3>
                        <p className="text-gray-300 mb-6">
                            Tem certeza? Isso pode afetar empresas que usam esta categoria.
                        </p>

                        {deleteCategoryError && (
                            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">
                                <strong>Erro:</strong> {deleteCategoryError}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setDeletingCategoryId(null); setDeleteCategoryError(null); }}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-200"
                                disabled={isDeletingCategory}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeleteCategory}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white flex items-center gap-2"
                                disabled={isDeletingCategory}
                            >
                                {isDeletingCategory ? 'Excluindo...' : 'Sim, Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* SYNC LOADING OVERLAY */}
            {isSyncing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-white font-semibold">Sincronizando site...</p>
                    </div>
                </div>
            )}

            <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Painel do Desenvolvedor v2.0 (FIX)
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Controle total do sistema OpeNow</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar Site'}
                    </button>
                    <button onClick={() => navigate('/admin/import')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                        <Download size={16} /> Importar do Google
                    </button>
                    <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">Voltar ao App</button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard icon={<Layout />} label="Empresas Totais" value={stats?.total_businesses || businesses.length || 0} color="blue" />
                <StatCard icon={<Check />} label="Abertas Agora" value={openCount} color="green" />
                <StatCard icon={<Shield />} label="Fechadas Agora" value={closedCount} color="red" />
                <StatCard icon={<Star />} label="Planos Premium" value={premiumCount} color="purple" />
            </div>

            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Visão Geral" icon={<BarChart2 size={18} />} />
                <TabButton active={activeTab === 'companies'} onClick={() => setActiveTab('companies')} label="Empresas" icon={<Layout size={18} />} />
                <TabButton active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} label="Aprovações" icon={<Shield size={18} />} />
                <TabButton active={activeTab === 'locations'} onClick={() => setActiveTab('locations')} label="Locais" icon={<MapPin size={18} />} />
                <TabButton active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} label="Leads" icon={<User size={18} />} />
                <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} label="Categorias" icon={<Tag size={18} />} />
                <TabButton active={activeTab === 'financials'} onClick={() => setActiveTab('financials')} label="Financeiro" icon={<DollarSign size={18} />} />
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 min-h-[500px]">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Relatórios Rápidos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-900 p-4 rounded-lg">
                                <h3 className="text-gray-400 mb-4 flex items-center gap-2">
                                    <Star className="text-yellow-500" size={16} />
                                    Ranking de Empresas (WhatsApp)
                                </h3>
                                {stats?.ranking && stats.ranking.length > 0 ? (
                                    <ul className="space-y-3">
                                        {stats.ranking.map((item: StatItem, idx: number) => (
                                            <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-800 pb-2 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-bold w-6 h-6 flex items-center justify-center rounded-full ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : idx === 2 ? 'bg-orange-700 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                                        {idx + 1}
                                                    </span>
                                                    <div>
                                                        <p className="text-gray-200 font-medium">{item.name}</p>
                                                        <p className="text-xs text-gray-500">{item.category}</p>
                                                    </div>
                                                </div>
                                                <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs font-bold">
                                                    {item.clicks} clicks
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
                                        Nenhum dado de clique ainda.
                                    </div>
                                )}
                            </div>
                            <div className="bg-gray-900 p-4 rounded-lg">
                                <h3 className="text-gray-400 mb-2">Últimas Atividades</h3>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li>• Nova empresa cadastrada: Pizzaria Top</li>
                                    <li>• Avaliação recebida em: Farmácia Central</li>
                                    <li>• Lead capturado: Categoria Mecânico</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'financials' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard
                                icon={<DollarSign />}
                                label="Faturamento Total"
                                value={`R$ ${financialData?.summary?.totalRevenue || '0.00'}`}
                                color="green"
                            />
                            <StatCard
                                icon={<RefreshCw />}
                                label="MRR (Recorrente)"
                                value={`R$ ${financialData?.summary?.mrr || '0.00'}/mês`}
                                color="blue"
                            />
                            <StatCard
                                icon={<Star />}
                                label="Impulsionamentos"
                                value={`${financialData?.summary?.activeBoosts || 0} Ativos`}
                                color="yellow"
                            />
                            <StatCard
                                icon={<Layout />}
                                label="Anúncios Visuais"
                                value={`${financialData?.summary?.activeAds || 0} Ativos`}
                                color="purple"
                            />
                        </div>

                        <div className="bg-gray-900 rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-gray-800">
                                <h3 className="font-semibold">Transações Recentes</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-800 text-gray-400">
                                        <tr>
                                            <th className="p-3">Data</th>
                                            <th className="p-3">Empresa (ID)</th>
                                            <th className="p-3">Tipo</th>
                                            <th className="p-3">Valor</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {financialData?.recentTransactions?.map((tx: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-gray-750">
                                                <td className="p-3 text-gray-400">
                                                    {new Date(tx.date).toLocaleDateString()}
                                                </td>
                                                <td className="p-3 font-medium">
                                                    {tx.businessId}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs ${tx.type.includes('Impulsionamento') ? 'bg-yellow-900 text-yellow-200' : 'bg-purple-900 text-purple-200'}`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-green-400 font-bold">
                                                    R$ {tx.amount?.toFixed(2)}
                                                </td>
                                                <td className="p-3">
                                                    <span className="bg-green-900 text-green-200 px-2 py-1 rounded text-xs">
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {!financialData?.recentTransactions?.length && (
                                            <tr>
                                                <td colSpan={5} className="p-6 text-center text-gray-500">
                                                    Nenhuma transação registrada ainda.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'companies' && (
                    <div>
                        <div className="flex justify-between mb-4">
                            <h2 className="text-xl font-semibold">Gerenciar Empresas</h2>
                            <div className="flex gap-2 items-center">
                                <button onClick={handleCreateBusiness} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                                    + Nova Empresa
                                </button>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar empresa..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm pr-8"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-900 text-gray-400">
                                    <tr>
                                        <th className="p-3">Nome</th>
                                        <th className="p-3">Cidade</th>
                                        <th className="p-3">Categoria</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Premium</th>
                                        <th className="p-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {filteredBusinesses.map(b => (
                                        <tr key={b.business_id} className="hover:bg-gray-750">
                                            <td className="p-3 font-medium">{b.name}</td>
                                            <td className="p-3 text-gray-400">{b.city || '-'}</td>
                                            <td className="p-3 text-gray-400">{b.category}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs ${b.forced_status === 'closed' ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                                                    {b.forced_status || 'Auto'}
                                                </span>
                                            </td>
                                            <td className="p-3">{b.is_premium ? '💎' : '-'}</td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditBusiness(b)} className="text-blue-400 hover:text-blue-300 p-1">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteBusiness(b.business_id)} className="text-red-400 hover:text-red-300 p-1">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}



                {activeTab === 'approvals' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Aprovação de Categorias</h2>
                        <p className="text-gray-500">Nenhuma categoria pendente de aprovação no momento.</p>
                    </div>
                )}

                {activeTab === 'locations' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Distribuição Geográfica</h2>
                            <button
                                onClick={handleSimulateLocations}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                            >
                                <MapPin size={16} /> Simular GPS (Randomizar)
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-900 text-gray-400">
                                    <tr>
                                        <th className="p-3">Estado</th>
                                        <th className="p-3">Cidade</th>
                                        <th className="p-3">Empresas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {Object.entries(businesses.reduce((acc: any, b: any) => {
                                        const key = `${b.state || 'N/A'} - ${b.city || 'N/A'}`;
                                        acc[key] = (acc[key] || 0) + 1;
                                        return acc;
                                    }, {})).map(([location, count]: any) => {
                                        const [state, city] = location.split(' - ');
                                        return (
                                            <tr key={location} className="hover:bg-gray-750">
                                                <td className="p-3 font-medium">{state}</td>
                                                <td className="p-3">{city}</td>
                                                <td className="p-3">{count}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'leads' && (
                    <div>
                        <div className="flex justify-between mb-4">
                            <h2 className="text-xl font-semibold">Gerenciar Leads</h2>
                            <div className="flex gap-2">
                                <button onClick={handleCreateLead} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                                    + Novo Lead
                                </button>
                                <input type="text" placeholder="Buscar lead..." className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-900 text-gray-400">
                                    <tr>
                                        <th className="p-3">Nome</th>
                                        <th className="p-3">Email/Telefone</th>
                                        <th className="p-3">Local</th>
                                        <th className="p-3">Visitas</th>
                                        <th className="p-3">Clicks Zap</th>
                                        <th className="p-3">Cadastro</th>
                                        <th className="p-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {leads.map((lead: any) => (
                                        <tr key={lead.uid} className="hover:bg-gray-750">
                                            <td className="p-3 font-medium">
                                                {lead.name}
                                                {lead.has_business && <span className="ml-2 text-xs bg-blue-900 text-blue-200 px-1 rounded">Empresário</span>}
                                            </td>
                                            <td className="p-3 text-gray-400">
                                                <div>{lead.email}</div>
                                                <div className="text-xs">{lead.phone}</div>
                                            </td>
                                            <td className="p-3">{lead.city}/{lead.state}</td>
                                            <td className="p-3">{lead.stats?.visits || 0}</td>
                                            <td className="p-3">{lead.stats?.whatsapp_clicks || 0}</td>
                                            <td className="p-3 text-xs text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditLead(lead)} className="text-blue-400 hover:text-blue-300 p-1">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteLead(lead.uid)} className="text-red-400 hover:text-red-300 p-1">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Gerenciar Categorias</h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="Nova categoria..."
                                    className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                                />
                                <button
                                    onClick={handleCreateCategory}
                                    disabled={!newCategory.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded flex items-center gap-2"
                                >
                                    <Tag size={16} /> Adicionar
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Nome</th>
                                        <th className="px-6 py-3">ID</th>
                                        <th className="px-6 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-gray-800/50">
                                            <td className="px-6 py-4 font-medium text-white">{cat.label}</td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">{cat.id}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                    className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900/20 rounded"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                                Nenhuma categoria encontrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            {/* Business Modal */}
            {isBusinessModalOpen && editingBusiness && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-gray-900">
                        <h3 className="text-xl font-bold mb-4">{editingBusiness.business_id ? 'Editar Empresa' : 'Nova Empresa'}</h3>
                        <form onSubmit={handleSaveBusiness} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nome</label>
                                    <input type="text" value={editingBusiness.name} onChange={e => setEditingBusiness({ ...editingBusiness, name: e.target.value })} className="w-full border p-2 rounded" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Categoria</label>
                                    <select value={editingBusiness.category} onChange={e => setEditingBusiness({ ...editingBusiness, category: e.target.value })} className="w-full border p-2 rounded">
                                        <option value="">Selecione...</option>
                                        {categories.map((cat: any) => (
                                            <option key={cat.id} value={cat.label}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Descrição</label>
                                <textarea value={editingBusiness.description} onChange={e => setEditingBusiness({ ...editingBusiness, description: e.target.value })} className="w-full border p-2 rounded" rows={3} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">WhatsApp</label>
                                    <input type="text" value={editingBusiness.whatsapp} onChange={e => setEditingBusiness({ ...editingBusiness, whatsapp: e.target.value })} className="w-full border p-2 rounded" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status Forçado</label>
                                    <select value={editingBusiness.forced_status || ''} onChange={e => setEditingBusiness({ ...editingBusiness, forced_status: e.target.value || null })} className="w-full border p-2 rounded">
                                        <option value="">Automático</option>
                                        <option value="open">Aberto</option>
                                        <option value="closed">Fechado</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Abre às</label>
                                    <input type="time" value={editingBusiness.open_time} onChange={e => setEditingBusiness({ ...editingBusiness, open_time: e.target.value })} className="w-full border p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Fecha às</label>
                                    <input type="time" value={editingBusiness.close_time} onChange={e => setEditingBusiness({ ...editingBusiness, close_time: e.target.value })} className="w-full border p-2 rounded" />
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <MapPin size={16} /> Localização
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">CEP</label>
                                        <input
                                            type="text"
                                            value={editingBusiness.zip_code || ''}
                                            onChange={e => setEditingBusiness({ ...editingBusiness, zip_code: e.target.value })}
                                            onBlur={async (e) => {
                                                const cep = e.target.value.replace(/\D/g, '');
                                                if (cep.length === 8) {
                                                    try {
                                                        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                                                        const data = await res.json();
                                                        if (!data.erro) {
                                                            setEditingBusiness((prev: any) => ({
                                                                ...prev,
                                                                street: data.logradouro,
                                                                neighborhood: data.bairro,
                                                                city: data.localidade,
                                                                state: data.uf
                                                            }));
                                                        }
                                                    } catch (error) {
                                                        console.error("Erro ao buscar CEP", error);
                                                    }
                                                }
                                            }}
                                            className="w-full border p-2 rounded"
                                            placeholder="00000-000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Estado (UF)</label>
                                        <input type="text" value={editingBusiness.state || ''} onChange={e => setEditingBusiness({ ...editingBusiness, state: e.target.value })} className="w-full border p-2 rounded" placeholder="MG" maxLength={2} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Cidade</label>
                                        <input type="text" value={editingBusiness.city || ''} onChange={e => setEditingBusiness({ ...editingBusiness, city: e.target.value })} className="w-full border p-2 rounded" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Bairro</label>
                                        <input type="text" value={editingBusiness.neighborhood || ''} onChange={e => setEditingBusiness({ ...editingBusiness, neighborhood: e.target.value })} className="w-full border p-2 rounded" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Rua</label>
                                        <input type="text" value={editingBusiness.street || ''} onChange={e => setEditingBusiness({ ...editingBusiness, street: e.target.value })} className="w-full border p-2 rounded" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Número</label>
                                        <input type="text" value={editingBusiness.number || ''} onChange={e => setEditingBusiness({ ...editingBusiness, number: e.target.value })} className="w-full border p-2 rounded" />
                                    </div>
                                </div>
                                <button type="button" onClick={async () => {
                                    const { street, number, city, state, zip_code } = editingBusiness;

                                    if (!city || !state) {
                                        alert('Preencha pelo menos Cidade e Estado.');
                                        return;
                                    }

                                    const searchNominatim = async (params: any) => {
                                        const qs = new URLSearchParams({ ...params, format: 'json', limit: '1' }).toString();
                                        const res = await fetch(`https://nominatim.openstreetmap.org/search?${qs}`);
                                        const data = await res.json();
                                        return data.length > 0 ? data[0] : null;
                                    };

                                    try {
                                        // 1. Try exact match with Number + Street + City + State
                                        if (street && number) {
                                            const result = await searchNominatim({ street: `${number} ${street}`, city, state, country: 'Brazil' });
                                            if (result) {
                                                setEditingBusiness({ ...editingBusiness, latitude: parseFloat(result.lat), longitude: parseFloat(result.lon) });
                                                return;
                                            }
                                        }

                                        // 2. Try Street + City + State (No Number)
                                        if (street) {
                                            const result = await searchNominatim({ street, city, state, country: 'Brazil' });
                                            if (result) {
                                                setEditingBusiness({ ...editingBusiness, latitude: parseFloat(result.lat), longitude: parseFloat(result.lon) });
                                                alert('Número não encontrado, localizamos a rua.');
                                                return;
                                            }
                                        }

                                        // 3. Try CEP (Nominatim)
                                        if (zip_code) {
                                            const result = await searchNominatim({ postalcode: zip_code, country: 'Brazil' });
                                            if (result) {
                                                setEditingBusiness({ ...editingBusiness, latitude: parseFloat(result.lat), longitude: parseFloat(result.lon) });
                                                alert('Endereço não encontrado, localizamos pelo CEP.');
                                                return;
                                            }
                                        }

                                        // 4. Try CEP (AwesomeAPI - Backup)
                                        if (zip_code) {
                                            try {
                                                const cleanCep = zip_code.replace(/\D/g, '');
                                                const res = await fetch(`https://cep.awesomeapi.com.br/json/${cleanCep}`);
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    if (data.lat && data.lng) {
                                                        setEditingBusiness({
                                                            ...editingBusiness,
                                                            latitude: parseFloat(data.lat),
                                                            longitude: parseFloat(data.lng)
                                                        });
                                                        alert('Localização encontrada pelo CEP (Fonte alternativa).');
                                                        return;
                                                    }
                                                }
                                            } catch (e) {
                                                console.error("AwesomeAPI failed", e);
                                            }
                                        }

                                        // 5. Fallback to City + State
                                        const result = await searchNominatim({ city, state, country: 'Brazil' });
                                        if (result) {
                                            setEditingBusiness({ ...editingBusiness, latitude: parseFloat(result.lat), longitude: parseFloat(result.lon) });
                                            alert('Endereço não encontrado, centralizamos na cidade.');
                                        } else {
                                            alert('Localização não encontrada.');
                                        }

                                    } catch (e) {
                                        console.error(e);
                                        alert('Erro na busca.');
                                    }
                                }} className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-blue-700">
                                    <Search size={16} /> Buscar no Mapa
                                </button>

                                <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 relative z-0">
                                    <MapContainer
                                        center={[editingBusiness.latitude || -19.747, editingBusiness.longitude || -47.939]}
                                        zoom={13}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <LocationPicker
                                            position={[editingBusiness.latitude || 0, editingBusiness.longitude || 0]}
                                            onLocationSelect={(lat, lng) => setEditingBusiness({ ...editingBusiness, latitude: lat, longitude: lng })}
                                        />
                                    </MapContainer>
                                </div>
                                <div className="text-xs text-gray-500 flex justify-between">
                                    <span>Lat: {editingBusiness.latitude}</span>
                                    <span>Lng: {editingBusiness.longitude}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={editingBusiness.is_premium || false} onChange={e => setEditingBusiness({ ...editingBusiness, is_premium: e.target.checked })} id="is_premium" />
                                <label htmlFor="is_premium" className="text-sm font-medium">Premium (Destaque)</label>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsBusinessModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lead Modal */}
            {isLeadModalOpen && editingLead && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md text-gray-900">
                        <h3 className="text-xl font-bold mb-4">{editingLead.uid ? 'Editar Lead' : 'Novo Lead'}</h3>
                        <form onSubmit={handleSaveLead} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nome</label>
                                <input type="text" value={editingLead.name} onChange={e => setEditingLead({ ...editingLead, name: e.target.value })} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input type="email" value={editingLead.email} onChange={e => setEditingLead({ ...editingLead, email: e.target.value })} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Telefone</label>
                                <input type="tel" value={editingLead.phone} onChange={e => setEditingLead({ ...editingLead, phone: e.target.value })} className="w-full border p-2 rounded" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Cidade</label>
                                    <input type="text" value={editingLead.city} onChange={e => setEditingLead({ ...editingLead, city: e.target.value })} className="w-full border p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Estado</label>
                                    <input type="text" value={editingLead.state} onChange={e => setEditingLead({ ...editingLead, state: e.target.value })} className="w-full border p-2 rounded" maxLength={2} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsLeadModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number | string, color: string }) => {
    const colors: Record<string, string> = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
        <div className={`p-4 rounded-xl border ${colors[color]} flex items-center gap-4`}>
            <div className={`p-3 rounded-lg bg-gray-900`}>{icon}</div>
            <div>
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-gray-100">{value}</p>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
            : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
    >
        {icon}
        {label}
    </button>
);
