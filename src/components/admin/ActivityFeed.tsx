import React from 'react';
import { MessageSquare, Star, UserPlus, AlertCircle } from 'lucide-react';

export const ActivityFeed: React.FC = () => {
    const activities = [
        {
            id: 1,
            type: 'review',
            title: 'Farmácia Central recebeu nova avaliação',
            subtitle: '4.7★ - "Atendimento muito bom!"',
            time: 'há 32 min',
            icon: Star,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10'
        },
        {
            id: 2,
            type: 'business',
            title: 'Nova empresa cadastrada: Pizzaria Top',
            subtitle: 'Status: pendente de aprovação',
            time: 'há 1 hora',
            icon: UserPlus,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            id: 3,
            type: 'lead',
            title: 'Novo Lead Capturado',
            subtitle: 'Categoria: Mecânico - Uberaba',
            time: 'há 2 horas',
            icon: MessageSquare,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            id: 4,
            type: 'alert',
            title: 'Alerta de Sistema',
            subtitle: 'Sincronização concluída com sucesso',
            time: 'há 5 horas',
            icon: AlertCircle,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        }
    ];

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-full">
            <h3 className="text-lg font-semibold text-white mb-6">Últimas Atividades</h3>
            <div className="space-y-6">
                {activities.map((item, idx) => (
                    <div key={item.id} className="flex gap-4 relative group">
                        {idx !== activities.length - 1 && (
                            <div className="absolute left-[19px] top-10 bottom-[-24px] w-[2px] bg-gray-800 group-hover:bg-gray-700 transition-colors"></div>
                        )}
                        <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0 border border-gray-800 group-hover:scale-110 transition-transform`}>
                            <item.icon size={18} className={item.color} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-200">{item.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
                            <span className="text-[10px] text-gray-500 mt-1 block">{item.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
