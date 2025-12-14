import React from 'react';
import { Link } from 'react-router-dom';

export const Terms: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Link to="/" className="text-ta-blue hover:text-white mb-8 block">&larr; Voltar para Home</Link>

                <h1 className="text-3xl font-bold text-ta-green mb-8">Termos de Uso</h1>

                <section>
                    <h2 className="text-xl font-bold mb-4">1. Aceitação dos Termos</h2>
                    <p className="text-gray-300">Ao acessar e usar a plataforma TáAberto (operada por @openow.io), você aceita e concorda em cumprir os termos e disposições deste contrato.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">2. Serviços Oferecidos</h2>
                    <p className="text-gray-300">A plataforma atua como um diretório digital conectando usuários a empresas locais. Não nos responsabilizamos pelos serviços prestados pelas empresas listadas.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">3. Responsabilidades</h2>
                    <p className="text-gray-300">As informações sobre horários e disponibilidade são fornecidas pelas empresas cadastradas. O usuário deve verificar a exatidão das informações diretamente com o estabelecimento.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">4. Contato</h2>
                    <p className="text-gray-300">Dúvidas? Entre em contato: google@studio3d.com.br</p>
                </section>
            </div>
        </div>
    );
};
