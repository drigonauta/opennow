```javascript
import React from 'react';
import { Link } from 'react-router-dom';

export const Terms: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white py-20 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Termos de Uso e Política de Privacidade</h1>
                
                <div className="space-y-6 text-gray-300">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Aceitação dos Termos</h2>
                        <p>
                            Ao acessar e usar o <strong>TáAberto</strong>, você concorda e aceita integralmente estes termos de uso.
                            Se você não concordar com qualquer parte destes termos, você não deve usar nossa plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. Uso do Serviço</h2>
                        <p>
                            O <strong>TáAberto</strong> conecta usuários a empresas locais. Não somos responsáveis pelos serviços
                            prestados pelas empresas listadas, nem pela precisão absoluta das informações de horário,
                            que são fornecidas pelos próprios estabelecimentos ou coletadas de fontes públicas.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};
