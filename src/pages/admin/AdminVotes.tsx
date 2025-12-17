import React, { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, Clock } from 'lucide-react';

interface Vote {
    business_id: string;
    businessName: string; // Enriched by backend
    user_id: string;
    type: 'like' | 'dislike';
    timestamp: number;
}

export const AdminVotes: React.FC = () => {
    const [votes, setVotes] = useState<Vote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVotes();
    }, []);

    const fetchVotes = async () => {
        try {
            // Assume we can get token if needed, but browser cookie/header handling usually sufficient for our current setup? 
            // Actually, best to be explicit if AuthContext provides it.
            // Use the secret admin token to ensure access, matching AdminDashboard pattern
            const res = await fetch('/api/admin/interactions/votes', {
                headers: { 'Authorization': `Bearer admin-secret-token` }
            });
            const data = await res.json();
            if (res.ok) {
                setVotes(data);
            } else {
                console.error('Votes fetch failed:', data);
            }
        } catch (error) {
            console.error('Failed to fetch votes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando auditoria...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Auditoria de Votações</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Usuário</th>
                            <th className="p-4 font-semibold text-gray-600">Ação</th>
                            <th className="p-4 font-semibold text-gray-600">Empresa</th>
                            <th className="p-4 font-semibold text-gray-600">Data/Hora</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {votes.map((vote, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-mono text-xs text-gray-500">{vote.user_id}</td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${vote.type === 'like' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {vote.type === 'like' ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
                                        {vote.type === 'like' ? 'CURTIU' : 'NÃO CURTIU'}
                                    </span>
                                </td>
                                <td className="p-4 font-medium text-gray-800">{vote.businessName || vote.business_id}</td>
                                <td className="p-4 text-gray-500 text-sm flex items-center gap-2">
                                    <Clock size={14} />
                                    {new Date(vote.timestamp).toLocaleString('pt-BR')}
                                </td>
                            </tr>
                        ))}
                        {votes.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-400">Nenhum voto registrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
