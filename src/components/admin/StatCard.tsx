import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    color: 'blue' | 'green' | 'red' | 'purple' | 'orange';
    trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, trend }) => {
    const colorStyles = {
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        green: 'bg-green-500/10 text-green-500 border-green-500/20',
        red: 'bg-red-500/10 text-red-500 border-red-500/20',
        purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/5 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-20 opacity-5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-10 ${colorStyles[color].split(' ')[0].replace('/10', '/20')}`}></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-2.5 rounded-lg ${colorStyles[color]} transition-transform group-hover:scale-110 duration-300`}>
                    {React.cloneElement(icon as any, { size: 20 })}
                </div>
                {trend && (
                    <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                        {trend}
                    </span>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-gray-400 text-sm font-medium mb-1">{label}</h3>
                <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            </div>
        </div>
    );
};
