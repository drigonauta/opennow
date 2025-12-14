import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-black border-t border-gray-900 py-12 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

                {/* Brand */}
                <div>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                        <img src="/logo-taaberto.png" alt="Logo" className="h-8 object-contain" />
                        <span className="text-white font-bold text-xl">TáAberto</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Encontre o que está aberto agora, perto de você.
                    </p>
                    <p className="text-gray-600 text-xs mt-2">© 2024 @openow.io</p>
                </div>

                {/* Links */}
                <div className="flex flex-col gap-2">
                    <h4 className="text-white font-bold mb-2">Legal</h4>
                    <Link to="/terms" className="text-gray-400 hover:text-ta-blue text-sm transition-colors">Termos de Uso</Link>
                    <Link to="/about" className="text-gray-400 hover:text-ta-blue text-sm transition-colors">Sobre Nós</Link>
                    <Link to="/login" className="text-gray-400 hover:text-ta-blue text-sm transition-colors">Área do Parceiro</Link>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-white font-bold mb-2">Contato</h4>
                    <p className="text-gray-400 text-sm mb-1">Dúvidas ou Parcerias?</p>
                    <a href="mailto:google@studio3d.com.br" className="text-ta-blue hover:text-white transition-colors">
                        google@studio3d.com.br
                    </a>
                </div>

            </div>
        </footer>
    );
};
