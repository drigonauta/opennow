import React from 'react';
import { Link } from 'react-router-dom';
import type { Business } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { StatusBadge } from './StatusBadge';
import { MapPin, Phone, Clock, Heart, Star, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { createWhatsAppMessageLink } from '../lib/utils';
import { ClaimBusinessModal } from './ClaimBusinessModal';
import { useState } from 'react';
import { BadgeCheck } from 'lucide-react'; // For verified seal
import { AnalyticsService } from '../services/AnalyticsService';

interface BusinessCardProps {
    business: Business;
    isOpen?: boolean;
    distance?: string;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, isOpen: propIsOpen, distance }) => {
    const { isFavorite, toggleFavorite } = useFavorites();
    const { user } = useAuth();
    const { currentCity } = useLocation();
    const [showClaimModal, setShowClaimModal] = useState(false);
    // Determine status for styling
    const isOpen = propIsOpen ?? false; // Restored
    const [isSponsored, setIsSponsored] = useState(false);

    React.useEffect(() => {
        setIsSponsored(!!(business.highlight_expires_at && business.highlight_expires_at > Date.now()));
    }, [business.highlight_expires_at]);
    const isDominante = business.plan === 'dominante';
    const isPro = business.plan === 'pro';

    const whatsappLink = createWhatsAppMessageLink(
        business.whatsapp,
        business.name,
        business.business_id,
        user?.displayName,
        currentCity
    );

    return (
        <Link to={`/business/${business.business_id}`} className={`
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

            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-1">
                        {business.name}
                        {/* Dominante Badge - Gold Crown */}
                        {isDominante && (
                            <div className="relative group">
                                <div className="absolute inset-0 bg-yellow-500 blur-sm opacity-50 rounded-full"></div>
                                <Star fill="#EAB308" className="text-yellow-500 relative z-10 w-5 h-5" />
                            </div>
                        )}
                        {/* Pro Badge - Blue Check */}
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
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{business.open_time} - {business.close_time}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{business.city || 'Uberaba'}, {business.state || 'MG'} {distance && `• ${distance}`}</span>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                {whatsappLink ? (
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#39FF14] text-black py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.4)] hover:shadow-[0_0_25px_rgba(57,255,20,0.6)] hover:scale-105 transition-all duration-300 transform"
                        onClick={(e) => {
                            e.stopPropagation();
                            AnalyticsService.logEvent('whatsapp', business.business_id, user?.uid);
                        }}
                    >
                        <Phone size={16} />
                        WhatsApp
                    </a>
                ) : (
                    <button
                        className="flex-1 bg-gray-100 text-gray-400 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        title="WhatsApp não disponível"
                    >
                        <Phone size={16} />
                        WhatsApp
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(business.business_id);
                    }}
                    className={`p-2 rounded-lg border transition-colors ${isFavorite(business.business_id)
                        ? 'bg-red-500/10 border-red-500 text-red-500'
                        : 'bg-transparent border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-500'
                        }`}
                >
                    <Heart size={20} fill={isFavorite(business.business_id) ? "currentColor" : "none"} />
                </button>

                {/* Call Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (business.phone || business.whatsapp) {
                            AnalyticsService.logEvent('call', business.business_id, user?.uid);
                            window.location.href = `tel:${business.phone || business.whatsapp}`;
                        }
                    }}
                    className="flex-1 bg-[#39FF14] text-blue-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 hover:scale-105 transition-all duration-300 transform"
                    title="Ligar Agora"
                >
                    <Phone size={16} />
                    Ligar
                </button>
            </div>

            {/* Google Rating */}
            {(business.rating !== undefined && business.rating !== null) && (
                <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between items-center">
                    <div
                        className="flex items-center gap-1.5 cursor-pointer hover:bg-white/5 -mx-2 px-2 py-1 rounded transition-colors"
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
                        <div className="flex text-yellow-500">
                            <Star size={14} fill="currentColor" />
                        </div>
                        <span className="text-sm font-bold text-white">{business.rating}</span>
                        <span className="text-xs text-gray-500">({business.review_count || business.user_ratings_total || 0})</span>
                    </div>

                    {/* Claim Button */}
                    {!business.owner_id || business.owner_id === 'admin_import' ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowClaimModal(true);
                            }}
                            className="text-xs font-medium text-ta-blue hover:text-white hover:bg-ta-blue/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                        >
                            <ShieldCheck size={12} />
                            Reivindicar
                        </button>
                    ) : null}
                </div>
            )}

            {showClaimModal && (
                <div onClick={(e) => e.preventDefault()}>
                    <ClaimBusinessModal business={business} onClose={() => setShowClaimModal(false)} />
                </div>
            )}
        </Link>
    );
};

