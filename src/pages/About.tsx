import React from 'react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Link to="/" className="text-ta-blue hover:text-white mb-8 block">&larr; Voltar para Home</Link>

                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-white mb-6">Sobre o TáAberto</h1>
                    <p className="text-xl text-gray-300 mb-12">
                        Conectando você ao que está acontecendo agora na sua cidade.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto bg-gray-900 rounded-2xl p-8 border border-gray-800">
                    <div className="prose prose-invert max-w-none">
                        <p>
                            O <strong>TáAberto</strong> é a solução definitiva para encontrar comércios, serviços e profissionais
                            disponíveis exatamente quando você precisa.
                        </p>
                        <p>
                            Nossa missão é eliminar a frustração de sair de casa e dar de cara com a porta fechada,
                            ou de ligar para números que não atendem.
                        </p>
                        <h3>Para Usuários</h3>
                        <p>
                            Gratuito, rápido e confiável. Saiba quem está aberto agora, veja avaliações reais e entre em contato
                            diretamente pelo WhatsApp.
                        </p>
                        <h3>Para Empresas</h3>
                        <p>
                            Destaque seu negócio para quem está procurando por você neste exato momento. O <strong>TáAberto</strong>
                            oferece ferramentas poderosas para atrair e fidelizar clientes locais.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
