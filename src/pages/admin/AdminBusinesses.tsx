import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Edit, Trash2, MapPin } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const AdminBusinesses: React.FC = () => {
    const { businesses, setBusinesses, refreshData } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');

    // --- DELETE STATE ---
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- EDIT STATE ---
    const [editingBusiness, setEditingBusiness] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredBusinesses = useMemo(() => {
        return businesses.filter(b => {
            const matchesSearch = (b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.category?.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = statusFilter === 'all'
                ? true
                : statusFilter === 'open'
                    ? b.forced_status === 'open'
                    : b.forced_status === 'closed';

            return matchesSearch && matchesStatus;
        });
    }, [businesses, searchTerm, statusFilter]);

    const handleDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/business/${deletingId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer admin-secret-token` }
            });

            if (res.ok) {
                setBusinesses(prev => prev.filter(b => b.business_id !== deletingId));
                setDeletingId(null);
            } else {
                alert('Erro ao excluir');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
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
                setIsModalOpen(false);
                refreshData();
            } else {
                alert('Erro ao salvar');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar');
        }
    };

    const openEditModal = (business?: any) => {
        if (business) {
            setEditingBusiness(business);
        } else {
            setEditingBusiness({
                name: '', category: 'Food', description: '', whatsapp: '',
                open_time: '08:00', close_time: '18:00', latitude: -19.747, longitude: -47.939,
                city: 'Uberaba', state: 'MG'
            });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Empresas</h1>
                    <p className="text-gray-400">Gerencie todos os negócios cadastrados.</p>
                </div>
                <button
                    onClick={() => openEditModal()}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Plus size={18} />
                    Nova Empresa
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, cidade ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="open">Abertos</option>
                        <option value="closed">Fechados</option>
                    </select>
                    <button className="bg-gray-800 border border-gray-700 text-gray-400 hover:text-white px-3 py-2 rounded-lg transition-colors">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 text-xs uppercase text-gray-500 font-semibold bg-gray-900/50">
                                <th className="px-6 py-4">Empresa</th>
                                <th className="px-6 py-4">Localização</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Plano</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredBusinesses.map(business => (
                                <tr key={business.business_id} className="group hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-400 group-hover:bg-blue-900/30 group-hover:text-blue-400 transition-colors">
                                                {business.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{business.name}</p>
                                                <p className="text-xs text-gray-500">{business.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <MapPin size={14} />
                                            {business.city || 'N/A'} - {business.state || 'MG'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${business.forced_status === 'open'
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : business.forced_status === 'closed'
                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                            }`}>
                                            {business.forced_status === 'open' ? 'Aberto' : business.forced_status === 'closed' ? 'Fechado' : 'Automático'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {business.is_premium ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                PREMIUM
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-500">Grátis</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(business)}
                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(business.business_id)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredBusinesses.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        Nenhuma empresa encontrada com os filtros atuais.
                    </div>
                )}
            </div>

            {/* DELETE MODAL */}
            {deletingId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-2">Excluir Empresa?</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Esta ação é irreversível. Todos os dados desta empresa serão perdidos.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">
                                {editingBusiness.business_id ? 'Editar Empresa' : 'Nova Empresa'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Nome da Empresa</label>
                                    <input
                                        type="text"
                                        value={editingBusiness.name}
                                        onChange={e => setEditingBusiness({ ...editingBusiness, name: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Categoria</label>
                                    <input
                                        type="text"
                                        value={editingBusiness.category}
                                        onChange={e => setEditingBusiness({ ...editingBusiness, category: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Cidade</label>
                                    <input
                                        type="text"
                                        value={editingBusiness.city}
                                        onChange={e => setEditingBusiness({ ...editingBusiness, city: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Estado</label>
                                    <input
                                        type="text"
                                        value={editingBusiness.state}
                                        onChange={e => setEditingBusiness({ ...editingBusiness, state: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">WhatsApp</label>
                                    <input
                                        type="text"
                                        value={editingBusiness.whatsapp}
                                        onChange={e => setEditingBusiness({ ...editingBusiness, whatsapp: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Status Forçado</label>
                                    <select
                                        value={editingBusiness.forced_status || ''}
                                        onChange={e => setEditingBusiness({ ...editingBusiness, forced_status: e.target.value || null })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    >
                                        <option value="">Automático (Horário)</option>
                                        <option value="open">Aberto</option>
                                        <option value="closed">Fechado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-blue-900/20"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
