import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit, Phone, Mail } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const AdminLeads: React.FC = () => {
    const { leads, setLeads } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (uid: string) => {
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Leads</h1>
                    <p className="text-gray-400">Gerencie usuários e potenciais clientes.</p>
                </div>
                <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-green-900/20">
                    <Plus size={18} />
                    Novo Lead
                </button>
            </div>

            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 text-xs uppercase text-gray-500 font-semibold bg-gray-900/50">
                                <th className="px-6 py-4">Nome</th>
                                <th className="px-6 py-4">Contato</th>
                                <th className="px-6 py-4">Local</th>
                                <th className="px-6 py-4">Engajamento</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredLeads.map(lead => (
                                <tr key={lead.uid} className="group hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400 border border-blue-500/20">
                                                {lead.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white flex items-center gap-2">
                                                    {lead.name}
                                                    {lead.has_business && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20">PRO</span>}
                                                </p>
                                                <p className="text-xs text-gray-500">Cadastrado em {new Date(lead.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <Mail size={14} /> {lead.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <Phone size={14} /> {lead.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {lead.city}/{lead.state}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-4 text-sm">
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-white">{lead.stats?.visits || 0}</span>
                                                <span className="text-[10px] text-gray-500 uppercase">Visitas</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-green-400">{lead.stats?.whatsapp_clicks || 0}</span>
                                                <span className="text-[10px] text-gray-500 uppercase">Clicks Zap</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(lead.uid)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
            </div>
        </div>
    );
};
