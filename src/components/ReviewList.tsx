import React, { useEffect, useState } from 'react';
import { Star, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Review {
    id: string;
    businessId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: number;
    reply?: {
        text: string;
        date: number;
    };
}

interface ReviewListProps {
    businessId: string;
    ownerId?: string; // To check if current user is owner
    refreshTrigger?: number; // Prop to trigger refetch
}

export const ReviewList: React.FC<ReviewListProps> = ({ businessId, ownerId, refreshTrigger }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews/${businessId}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [businessId, refreshTrigger]);

    const handleReply = async (reviewId: string) => {
        if (!replyText.trim()) return;
        setSubmittingReply(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/reviews/reply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reviewId, replyText })
            });

            if (response.ok) {
                setReplyingTo(null);
                setReplyText('');
                fetchReviews(); // Refresh to show reply
            } else {
                alert('Erro ao enviar resposta.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao enviar resposta.');
        } finally {
            setSubmittingReply(false);
        }
    };

    const isOwner = user && user.uid === ownerId;

    if (loading) return <div className="text-gray-500 text-center py-4">Carregando avaliações...</div>;

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-900/30 rounded-xl border border-gray-800 border-dashed">
                <p className="text-gray-400">Nenhuma avaliação ainda. Seja o primeiro!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review.id} className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex flex-col gap-3">
                    {/* Header: User & Rating */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-gray-300">
                                <User size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">{review.userName}</h4>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={12}
                                            className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700'}
                                        />
                                    ))}
                                    <span className="text-xs text-gray-500 ml-2">
                                        {formatDistanceToNow(review.date, { addSuffix: true, locale: ptBR })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comment Body */}
                    {review.comment && (
                        <p className="text-gray-300 text-sm leading-relaxed pl-[3.25rem]">
                            {review.comment}
                        </p>
                    )}

                    {/* Owner Reply Section */}
                    {review.reply ? (
                        <div className="ml-[3.25rem] mt-2 bg-blue-900/20 border-l-2 border-blue-500 p-3 rounded-r-lg">
                            <p className="text-xs text-blue-400 font-bold mb-1 flex items-center gap-1">
                                <MessageCircle size={12} /> Resposta do Proprietário
                            </p>
                            <p className="text-blue-100/90 text-sm">{review.reply.text}</p>
                        </div>
                    ) : (
                        // Reply Form (Only if Owner and no reply yet)
                        isOwner && (
                            <div className="ml-[3.25rem] mt-2">
                                {replyingTo === review.id ? (
                                    <div className="flex flex-col gap-2">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Escreva sua resposta..."
                                            className="w-full bg-black/40 border border-gray-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none"
                                            rows={2}
                                            autoFocus
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="text-xs text-gray-400 hover:text-white px-3 py-1"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => handleReply(review.id)}
                                                disabled={submittingReply}
                                                className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded hover:bg-blue-500 disabled:opacity-50"
                                            >
                                                {submittingReply ? 'Enviando...' : 'Responder'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setReplyingTo(review.id)}
                                        className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                                    >
                                        <MessageCircle size={12} /> Responder
                                    </button>
                                )}
                            </div>
                        )
                    )}
                </div>
            ))}
        </div>
    );
};
