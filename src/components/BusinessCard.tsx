import React from 'react';
import { Link } from 'react-router-dom';
import type { Business } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { StatusBadge } from './StatusBadge';
import { MapPin, Phone, Clock, Heart, Star, ShieldCheck } from 'lucide-react';
import { formatWhatsAppLink } from '../lib/utils';
import { ClaimBusinessModal } from './ClaimBusinessModal';
import { useState } from 'react';

interface BusinessCardProps {
    business: Business;
    isOpen?: boolean;
    distance?: string;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, isOpen: propIsOpen, distance }) => {
    const { isFavorite, toggleFavorite } = useFavorites();
    const [showClaimModal, setShowClaimModal] = useState(false);
    // Determine status for styling
    const isOpen = propIsOpen ?? false;

    const whatsappLink = formatWhatsAppLink(business.whatsapp);

    return (
        <Link to={`/business/${business.business_id}`} className={`
            block bg-white rounded-xl shadow-sm border p-4 mb-3 transition-all duration-500 hover:shadow-md
            ${isOpen ? 'border-green-200 hover:border-green-300' : 'border-gray-100 hover:border-gray-200'}
        `}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-lg text-gray-900">{business.name}</h3>
                    <p className="text-sm text-gray-500">{business.category}</p>
                </div>
                <StatusBadge isOpen={propIsOpen ?? false} />
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{business.description}</p>

            <div className="space-y-1.5 text-sm text-gray-500">
                <div className="flex items-center text-gray-600 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{business.open_time} - {business.close_time}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">Uberaba, MG {distance && `• ${distance}`}</span>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                {whatsappLink ? (
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
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
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'
                        }`}
                >
                    <Heart size={20} fill={isFavorite(business.business_id) ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Google Rating */}
            {(business.rating !== undefined && business.rating !== null) && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
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

                    {/* Claim Button */}
                    {!business.owner_id || business.owner_id === 'admin_import' ? (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowClaimModal(true);
                            }}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
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

