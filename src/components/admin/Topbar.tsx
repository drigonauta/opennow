import React from 'react';
import { Search, Bell, ExternalLink, RefreshCw, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
    onSync: () => void;
    isSyncing: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onSync, isSyncing }) => {
    const navigate = useNavigate();

    return (
        <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-20 px-6 flex items-center justify-between">
            {/* Search / Command Palette Trigger */}
            <div className="flex items-center flex-1 max-w-xl">
                <button
                    className="w-full max-w-md bg-gray-800/50 border border-gray-700/50 text-gray-400 rounded-lg px-4 py-2 flex items-center justify-between hover:bg-gray-800 hover:border-gray-600 transition-all group"
                    onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                >
                    <div className="flex items-center gap-2">
                        <Search size={14} className="group-hover:text-blue-400 transition-colors" />
                        <span className="text-sm">Buscar ou digitar comando...</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-gray-700 rounded text-[10px] font-mono text-gray-300">⌘</kbd>
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-gray-700 rounded text-[10px] font-mono text-gray-300">K</kbd>
                    </div>
                </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border-r border-gray-800 pr-4">
                    <button
                        onClick={onSync}
                        disabled={isSyncing}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all disabled:opacity-50"
                        title="Sincronizar Site"
                    >
                        <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => navigate('/admin/import')}
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                        title="Importar do Google"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
                        title="Ir para o App"
                    >
                        <ExternalLink size={18} />
                    </button>
                </div>

                <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-900"></span>
                </button>

                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-[1px]">
                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">AD</span>
                    </div>
                </div>
            </div>
        </header>
    );
};
