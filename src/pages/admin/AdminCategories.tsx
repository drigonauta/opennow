import React, { useState } from 'react';
import { Tag, Plus, Trash2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const AdminCategories: React.FC = () => {
    const { categories, setCategories } = useAdmin();
    const [newCategory, setNewCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleCreate = async () => {
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

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir categoria?')) return;
        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer admin-secret-token` }
            });
            if (res.ok) {
                setCategories(prev => prev.filter(c => c.id !== id));
            } else {
                alert('Erro ao excluir');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir');
        }
    };

    const filteredCategories = categories.filter(c =>
        c.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Categorias</h1>
                <p className="text-gray-400">Organize as categorias de empresas do sistema.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="md:col-span-1">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-24">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-blue-500" />
                            Nova Categoria
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-400 mb-1 block">Nome da Categoria</label>
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="Ex: Restaurantes"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                />
                            </div>
                            <button
                                onClick={handleCreate}
                                disabled={!newCategory.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
                            >
                                Adicionar Categoria
                            </button>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="md:col-span-2 space-y-4">
                    <input
                        type="text"
                        placeholder="Filtrar categorias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none mb-4"
                    />

                    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900/50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-3">Nome</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredCategories.map(cat => (
                                    <tr key={cat.id} className="group hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <Tag size={16} className="text-gray-600 group-hover:text-blue-500 transition-colors" />
                                                <span className="text-gray-200 font-medium">{cat.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                className="text-gray-600 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
