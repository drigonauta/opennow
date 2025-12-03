import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Users, MapPin, CheckCircle, Tag, ExternalLink, RefreshCw } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const CommandPalette: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { handleSync } = useAdmin();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!isOpen) return null;

    const commands = [
        { icon: Building2, label: 'Gerenciar Empresas', action: () => navigate('/admin/businesses') },
        { icon: Users, label: 'Ver Leads', action: () => navigate('/admin/leads') },
        { icon: CheckCircle, label: 'Aprovações Pendentes', action: () => navigate('/admin/approvals') },
        { icon: MapPin, label: 'Mapa de Locais', action: () => navigate('/admin/locations') },
        { icon: Tag, label: 'Gerenciar Categorias', action: () => navigate('/admin/categories') },
        { icon: RefreshCw, label: 'Sincronizar Site', action: () => handleSync() },
        { icon: ExternalLink, label: 'Ir para o App', action: () => navigate('/') },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]" onClick={() => setIsOpen(false)}>
            <div
                className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center px-4 py-3 border-b border-gray-800">
                    <Search className="text-gray-500 mr-3" size={20} />
                    <input
                        type="text"
                        placeholder="O que você precisa?"
                        className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 w-full text-lg"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-gray-800 rounded text-xs font-mono text-gray-400">ESC</kbd>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {filteredCommands.length > 0 ? (
                        <div className="space-y-1">
                            {filteredCommands.map((cmd, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        cmd.action();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-600/20 hover:text-blue-400 text-gray-300 transition-colors text-left group"
                                >
                                    <cmd.icon size={18} className="text-gray-500 group-hover:text-blue-400" />
                                    <span className="font-medium">{cmd.label}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            Nenhum comando encontrado.
                        </div>
                    )}
                </div>

                <div className="px-4 py-2 bg-gray-800/50 border-t border-gray-800 text-xs text-gray-500 flex justify-between">
                    <span>Use as setas para navegar</span>
                    <span>Enter para selecionar</span>
                </div>
            </div>
        </div>
    );
};
