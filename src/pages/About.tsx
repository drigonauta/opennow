import React from 'react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Link to="/" className="text-ta-blue hover:text-white mb-8 block">&larr; Voltar para Home</Link>

                <h1 className="text-3xl font-bold text-ta-green mb-8">Sobre Nós</h1>

                <div className="prose prose-invert max-w-none">
                    <p className="text-xl text-gray-300 mb-8">
                        O <strong>TáAberto</strong> é a solução definitiva para encontrar o que você precisa, quando precisa.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 my-12">
                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                            <h3 className="text-xl font-bold text-white mb-2">Nossa Missão</h3>
                            <p className="text-gray-400">Conectar empresas locais aos seus clientes de forma rápida, eficiente e em tempo real, eliminando a frustração de "dar viagem perdida".</p>
                        </div>
                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                            <h3 className="text-xl font-bold text-white mb-2">Visão</h3>
                            <p className="text-gray-400">Tornar-se a principal referência de busca comercial em tempo real em Uberaba e região.</p>
                        </div>
                    </div>

                    <p className="text-gray-400">
                        Desenvolvido por <strong>@openow.io</strong><br />
                        Contato e Suporte: google@studio3d.com.br
                    </p>
                </div>
            </div>
        </div>
    );
};
