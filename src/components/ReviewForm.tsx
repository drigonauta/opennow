import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ReviewFormProps {
    businessId: string;
    onReviewSubmitted: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ businessId, onReviewSubmitted }) => {
    const { user, refreshProfile } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (rating === 0) {
            setError('Por favor, selecione uma nota.');
            return;
        }

        if (!user) {
            setError('Você precisa estar logado para avaliar.');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/reviews/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    businessId,
                    rating,
                    comment,
                    userName: user.displayName || user.email // Fallback to email if name is missing
                })
            });

            if (response.ok) {
                await response.json();
                setSuccess(true);
                setComment('');
                setRating(0);
                onReviewSubmitted();
                if (refreshProfile) refreshProfile();

                // Temp success message handling
                setTimeout(() => {
                    setSuccess(false);
                }, 3000);
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao enviar avaliação.');
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="bg-gray-900/50 p-6 rounded-xl text-center border border-gray-800">
                <p className="text-gray-400 mb-2">Faça login para avaliar este local.</p>
                {/* Could add a link to login here */}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Avaliar Experiência</h3>

            {/* Star Rating */}
            <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                    >
                        <Star
                            size={28}
                            className={`${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} transition-colors`}
                        />
                    </button>
                ))}
                <span className="ml-2 text-sm text-gray-400 font-medium">
                    {rating > 0 ? (rating === 5 ? 'Excelente!' : rating === 1 ? 'Ruim' : 'Bom') : 'Toque para avaliar'}
                </span>
            </div>

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte como foi sua experiência... (Opcional)"
                className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-[100px] resize-none"
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm font-bold animate-pulse">Avaliação enviada com sucesso!</p>}

            <button
                type="submit"
                disabled={isSubmitting || success}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Enviando...' : success ? 'Enviado!' : (
                    <>
                        Enviar Avaliação <Send size={16} />
                    </>
                )}
            </button>
        </form>
    );
};
