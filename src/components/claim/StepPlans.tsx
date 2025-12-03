import React, { useState } from 'react';
import { Check, Star, Crown } from 'lucide-react';
import type { PlanType } from '../../types/subscription';

interface StepPlansProps {
    onSelect: (plan: PlanType, billingCycle: 'monthly' | 'yearly') => void;
}

export const StepPlans: React.FC<StepPlansProps> = ({ onSelect }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            id: 'free' as PlanType,
            name: 'Presença Básica',
            price: 0,
            icon: <Check className="w-6 h-6" />,
            color: 'bg-gray-100 text-gray-600',
            border: 'border-gray-200',
            features: [
                'Perfil básico no OpenNow',
                'Horários de funcionamento',
                'Endereço e Mapa',
                'WhatsApp clicável',
                'Indicador "Aberto Agora"'
            ],
            buttonText: 'Selecionar Grátis'
        },
        {
            id: 'gold' as PlanType,
            name: 'Ouro',
            price: billingCycle === 'monthly' ? 120 : 899,
            priceLabel: billingCycle === 'monthly' ? '/mês' : '/ano',
            icon: <Star className="w-6 h-6" />,
            color: 'bg-yellow-100 text-yellow-700',
            border: 'border-yellow-300',
            tag: 'Mais Popular',
            features: [
                'Tudo do Gratuito',
                'Destaque nas buscas (Fundo Amarelo)',
                '2x mais exposição',
                'Até 15 fotos na galeria',
                'Painel de métricas semanais',
                'Selo "Empresa Verificada"',
                'Link curto exclusivo',
                'Suporte prioritário'
            ],
            buttonText: 'Contratar Plano Ouro'
        },
        {
            id: 'diamond' as PlanType,
            name: 'Diamante',
            price: billingCycle === 'monthly' ? 249 : 1790,
            priceLabel: billingCycle === 'monthly' ? '/mês' : '/ano',
            icon: <Crown className="w-6 h-6" />,
            color: 'bg-blue-100 text-blue-700',
            border: 'border-blue-300',
            features: [
                'Tudo do Ouro',
                'Top 3 fixo rotativo na cidade',
                'Foto de capa animada',
                'Vídeo de apresentação',
                'Painel avançado de insights',
                'Página personalizada (Mini Site)',
                'Chat OpenNow AI 24h',
                'Badge VIP Diamante',
                '30% OFF no Painel de Marketing'
            ],
            buttonText: 'Assinar Plano Diamante'
        }
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Escolha o Plano Ideal</h2>
                <p className="text-gray-500 mt-2">Potencialize sua empresa no OpenNow</p>

                <div className="flex justify-center mt-6">
                    <div className="bg-gray-100 p-1 rounded-xl flex">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Mensal
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Anual <span className="text-xs text-green-600 font-bold ml-1">-20%</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {plans.map(plan => (
                    <div
                        key={plan.id}
                        className={`relative rounded-2xl border-2 p-6 transition-all hover:shadow-xl cursor-pointer flex flex-col ${plan.border} ${plan.id === 'diamond' ? 'bg-gradient-to-b from-white to-blue-50' : 'bg-white'}`}
                        onClick={() => onSelect(plan.id, billingCycle)}
                    >
                        {plan.tag && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                {plan.tag}
                            </div>
                        )}

                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.color}`}>
                            {plan.icon}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                        <div className="mt-2 mb-6">
                            <span className="text-3xl font-bold text-gray-900">
                                {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
                            </span>
                            {plan.price > 0 && <span className="text-gray-500 text-sm">{plan.priceLabel}</span>}
                        </div>

                        <ul className="space-y-3 mb-8 flex-1">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`w-full py-3 rounded-xl font-bold transition-colors ${plan.id === 'free'
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : plan.id === 'gold'
                                    ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                                }`}
                        >
                            {plan.buttonText}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
