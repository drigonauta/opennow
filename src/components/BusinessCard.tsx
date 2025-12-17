import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Business } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { StatusBadge } from './StatusBadge';
import { MapPin, Phone, Clock, Heart, Star, ShieldCheck, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { createWhatsAppMessageLink } from '../lib/utils';
import { ClaimBusinessModal } from './ClaimBusinessModal';
import { LostSaleModal } from './LostSaleModal';
import { AnalyticsService } from '../services/AnalyticsService';
import { LoginModal } from './auth/LoginModal';

interface BusinessCardProps {
    business: Business;
    isOpen?: boolean;
    distance?: string;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, isOpen: propIsOpen, distance }) => {
    const { isFavorite, toggleFavorite } = useFavorites();
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuth();
    const { currentCity } = useLocation();

    // Modals
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [showLostSaleModal, setShowLostSaleModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Gating
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    // Determine status for styling
    const isOpen = propIsOpen ?? false;
    const [isSponsored, setIsSponsored] = useState(false);

    useEffect(() => {
        setIsSponsored(!!(business.highlight_expires_at && business.highlight_expires_at > Date.now()));
    }, [business.highlight_expires_at]);

    const isDominante = business.plan === 'dominante';
    const isPro = business.plan === 'pro';

    // WhatsApp Link - Fallback to phone if default WA is missing, to maximize 'Green Button' presence
    const whatsappLink = createWhatsAppMessageLink(
        business.whatsapp || business.phone,
        business.name,
        business.business_id,
        user?.displayName,
        currentCity
    );

    // Use local state for optimistic UI updates
    const [stats, setStats] = useState({
        likes: business.analytics?.likes || 0,
        dislikes: business.analytics?.dislikes || 0
    });

    const executeAction = (action: () => void) => {
        if (user) {
            action();
        } else {
            setPendingAction(() => action);
            setShowLoginModal(true);
        }
    };

    const handleLoyaltyAction = async (action: 'checkin' | 'share') => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            fetch('/api/loyalty/earn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action })
            }).then(async (res) => {
                if (res.ok && refreshProfile) refreshProfile();
            }).catch(console.error);
        } catch (e) {
            console.error(e);
        }
    };

    const handleVote = async (type: 'like' | 'dislike') => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        const previousStats = { ...stats };
        setStats(prev => ({
            ...prev,
            [type === 'like' ? 'likes' : 'dislikes']: prev[type === 'like' ? 'likes' : 'dislikes'] + 1
        }));

        try {
            const token = await user.getIdToken();
            const res = await AnalyticsService.vote(business.business_id, type, token);

            if (res.success) {
                setStats({ likes: res.likes, dislikes: res.dislikes });
            } else {
                setStats(previousStats);
            }
        } catch (err) {
            console.error(err);
            setStats(previousStats);
            alert("Erro ao votar. Tente novamente.");
        }
    };

    const handleCardClick = (e: React.MouseEvent) => {
        const isUnclaimed = !business.owner_id || business.owner_id === 'admin_import' || business.owner_id === 'google_import';
        if (!isOpen && isUnclaimed) {
            e.preventDefault();
            setShowLostSaleModal(true);
        }
    };

    return (
        <>
            <Link
                to={`/business/${business.business_id}`}
                onClick={handleCardClick}
                className={`
            block bg-white rounded-xl shadow-lg border p-4 mb-3 transition-all duration-500
            ${isSponsored ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] scale-[1.02]' : ''}
            ${isDominante ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : ''}
            ${!isSponsored && !isDominante && isOpen ? 'border-green-500/30' : ''}
            ${!isSponsored && !isDominante && !isOpen ? 'border-gray-200' : ''}
            hover:border-ta-blue/50 hover:shadow-[0_0_20px_rgba(0,180,255,0.25)] hover:scale-[1.02]
        `}>
                {isSponsored && (
                    <div className="mb-2">
                        <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            Patrocinado
                        </span>
                    </div>
                )}

                {(business.category === 'Farmácia' || business.category === 'Saúde') && isOpen && (
                    <div className="absolute -top-3 -right-3 z-10">
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-md uppercase tracking-wider transform rotate-3">
                            PLANTÃO
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-start mb-2 relative">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-1">
                            {business.name}
                            {isDominante && (
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-yellow-500 blur-sm opacity-50 rounded-full"></div>
                                    <Star fill="#EAB308" className="text-yellow-500 relative z-10 w-5 h-5" />
                                </div>
                            )}
                            {(isPro || business.is_verified) && !isDominante && (
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500 blur-sm opacity-50 rounded-full"></div>
                                    <BadgeCheck size={18} className="text-blue-500 relative z-10" fill="#EAF6FF" />
                                </div>
                            )}
                        </h3>
                        <p className="text-sm text-gray-500">{business.category}</p>
                    </div>
                    <StatusBadge isOpen={propIsOpen ?? false} />
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{business.description}</p>

                <div className="space-y-1.5 text-sm text-gray-500">
                    <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{business.open_time} - {business.close_time}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="truncate">{business.city || 'Uberaba'}, {business.state || 'MG'}</span>
                    </div>
                </div>

                <div className="mt-4 flex gap-2 items-center">
                    {/* Always show Green WhatsApp Button as "Bait" */}
                    <button
                        className="flex-1 bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            executeAction(() => {
                                AnalyticsService.logEvent('whatsapp', business.business_id, user?.uid);
                                if (whatsappLink) {
                                    window.location.href = whatsappLink;
                                    handleLoyaltyAction('share');
                                } else {
                                    alert("Esta empresa ainda não cadastrou um número de WhatsApp válido.");
                                }
                            });
                        }}
                    >
                        <Phone size={18} />
                        WhatsApp
                    </button>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(business.business_id);
                        }}
                        className={`p-3 rounded-xl border transition-colors ${isFavorite(business.business_id)
                            ? 'bg-red-50 border-red-200 text-red-500'
                            : 'bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-500'
                            }`}
                    >
                        <Heart size={20} fill={isFavorite(business.business_id) ? "currentColor" : "none"} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            executeAction(() => {
                                if (business.phone || business.whatsapp) {
                                    AnalyticsService.logEvent('call', business.business_id, user?.uid);
                                    const cleanPhone = (business.phone || business.whatsapp).replace(/\D/g, '');
                                    window.location.href = `tel:${cleanPhone}`;
                                } else {
                                    alert("Telefone indisponível");
                                }
                            });
                        }}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
                        title="Ligar Agora"
                    >
                        <Phone size={18} />
                        Ligar
                    </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
                        <button
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleVote('like');
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                            title="Curti"
                        >
                            <div className="text-sm">👍</div>
                            <span className="font-bold text-xs">{stats.likes}</span>
                        </button>

                        <button
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleVote('dislike');
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                            title="Não Curti"
                        >
                            <div className="text-sm transform scale-x-[-1]">👎</div>
                            <span className="font-bold text-xs">{stats.dislikes}</span>
                        </button>
                    </div>

                    <div className="flex-1"></div>

                    <div className="flex items-center gap-2">
                        {distance && <span className="text-xs font-medium text-gray-500">{distance} de mim</span>}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const query = encodeURIComponent(`${business.name} ${business.address || ''} ${business.city || 'Uberaba'} ${business.state || 'MG'}`);
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
                                handleLoyaltyAction('checkin');
                            }}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 transition-colors border border-blue-200 shadow-sm"
                            title="Rota até aqui"
                        >
                            Ir
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
                        </button>
                    </div>
                </div>

                {(business.rating !== undefined && business.rating !== null) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <div
                            className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (business.google_place_id) {
                                    window.open(`https://www.google.com/maps/place/?q=place_id:${business.google_place_id}`, '_blank');
                                } else {
                                    const query = encodeURIComponent(`${business.name} ${business.address || 'Uberaba'}`);
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                                }
                            }}
                            title="Ver avaliações no Google Maps"
                        >
                            <div className="flex text-yellow-400">
                                <Star size={14} fill="currentColor" />
                            </div>
                            <span className="text-sm font-bold text-gray-700">{business.rating}</span>
                            <span className="text-xs text-gray-400">({business.review_count || business.user_ratings_total || 0})</span>
                        </div>

                        {!business.owner_id || business.owner_id === 'admin_import' ? (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowClaimModal(true);
                                }}
                                className="bg-white border border-green-500 text-green-600 hover:bg-green-50 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                            >
                                <ShieldCheck size={14} />
                                Reivindicar aqui
                            </button>
                        ) : null}
                    </div>
                )}

                {showClaimModal && (
                    <div onClick={(e) => e.preventDefault()}>
                        <ClaimBusinessModal business={business} onClose={() => setShowClaimModal(false)} />
                    </div>
                )}

                {showLostSaleModal && (
                    <div onClick={(e) => e.preventDefault()}>
                        <LostSaleModal
                            onClose={() => setShowLostSaleModal(false)}
                            onClaim={() => {
                                setShowLostSaleModal(false);
                                setShowClaimModal(true);
                            }}
                            onContinue={() => {
                                setShowLostSaleModal(false);
                                navigate(`/business/${business.business_id}`);
                            }}
                            business={business}
                        />
                    </div>
                )}
            </Link>

            <div onClick={(e) => e.preventDefault()}>
                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onSuccess={() => {
                        if (pendingAction) {
                            pendingAction();
                            setPendingAction(null);
                        }
                    }}
                    message="Cadastre-se rapidinho para liberar o contato (WhatsApp/Telefone) e falar com essa empresa!"
                />
            </div>
        </>
    );
};
