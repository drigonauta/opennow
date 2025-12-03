import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { useLocation } from '../context/LocationContext';
import { useFavorites } from '../context/FavoritesContext';
import { ArrowLeft, MapPin, Clock, Phone, Share2, Heart, Star, Award, ShieldCheck, Navigation, Car, Bike, Bus, Plane } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { createWhatsAppMessageLink } from '../lib/utils';
import { ClaimBusinessModal } from '../components/ClaimBusinessModal';

export const BusinessDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { businesses } = useBusiness();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { user, trackAction } = useAuth();
    const { userLocation, calculateDistance, currentCity } = useLocation();
    const [reviews, setReviews] = useState<any[]>([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [localBusiness, setLocalBusiness] = useState<any | null>(null);
    const contextBusiness = businesses.find(b => b.business_id === id);
    const [loading, setLoading] = useState(!contextBusiness);
    const business = contextBusiness || localBusiness;

    useEffect(() => {
        if (contextBusiness) {
            if (user && trackAction) {
                trackAction('view_business', contextBusiness.business_id, { name: contextBusiness.name });
            }
        } else if (id) {
            fetch(`/api/business/${id}`)
                .then(res => res.json())
                .then(data => {
                    setLocalBusiness(data);
                    setLoading(false);
                    if (user && trackAction) {
                        trackAction('view_business', data.business_id, { name: data.name });
                    }
                })
                .catch(() => setLoading(false));
        }
    }, [id, contextBusiness, user]); // Removed trackAction from dependency to avoid loops if it's not stable

    const fetchReviews = React.useCallback(async () => {
        if (!id) return;
        try {
            const res = await fetch(`/api/reviews/${id}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        }
    }, [id]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchReviews();
    }, [fetchReviews]);

    if (loading) {
        return <div className="p-4 text-center">Carregando...</div>;
    }

    if (!business) {
        return <div className="p-4 text-center">Negócio não encontrado.</div>;
    }

    const isOpen = (business: any) => {
        if (business.forced_status === 'open') return true;
        if (business.forced_status === 'closed') return false;
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return currentTime >= business.open_time && currentTime <= business.close_time;
    };

    const isBusinessOpen = isOpen(business);

    const handleWhatsAppClick = async () => {
        if (!business) return;

        // Track Click
        if (user) {
            trackAction('whatsapp_click', business.business_id, { name: business.name });
        }

        try {
            await fetch('/api/analytics/whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business.business_id,
                    userId: user?.uid || 'anonymous'
                })
            });
        } catch (e) {
            console.error("Failed to log whatsapp click", e);
        }

        const whatsappLink = createWhatsAppMessageLink(
            business.whatsapp,
            business.name,
            business.business_id,
            user?.displayName,
            currentCity
        );

        if (!whatsappLink) {
            alert("WhatsApp não disponível para este estabelecimento.");
            return;
        }

        window.open(whatsappLink, '_blank');
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert("Faça login para avaliar!");
            return;
        }

        try {
            const token = localStorage.getItem('authToken'); // Or from useAuth
            const res = await fetch('/api/reviews/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    business_id: id,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                setShowReviewForm(false);
                setNewReview({ rating: 5, comment: '' });
                fetchReviews(); // Refresh list
            } else {
                alert("Erro ao enviar avaliação.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar avaliação.");
        }
    };

    // Badges Logic
    const getBadges = () => {
        const badges = [];
        if (business.is_premium) badges.push({ icon: <Award className="text-yellow-500" />, label: 'Premium' });
        // Mock age check
        badges.push({ icon: <ShieldCheck className="text-blue-500" />, label: 'Verificado' });
        return badges;
    };
    // Distance & ETA Logic

    const getETAs = (distKm: number) => {
        const speeds = {
            walking: 5,
            bike: 15,
            bus: 25, // Updated per request
            car: 45, // Updated per request
            moto: 55, // Updated per request
            uber: 40, // Updated per request
            plane: 800 // Comic
        };

        const formatTime = (hours: number) => {
            const mins = Math.round(hours * 60);
            if (mins < 1) return '1 min';
            if (mins < 60) return `${mins} min`;
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h}h ${m}min`;
        };

        return [
            { icon: <Car size={16} />, label: 'Carro', time: formatTime(distKm / speeds.car) },
            { icon: <Navigation size={16} />, label: 'Moto', time: formatTime(distKm / speeds.moto) },
            { icon: <MapPin size={16} />, label: 'A pé', time: formatTime(distKm / speeds.walking) },
            { icon: <Bus size={16} />, label: 'Ônibus', time: formatTime(distKm / speeds.bus) },
            { icon: <Bike size={16} />, label: 'Bike', time: formatTime(distKm / speeds.bike) },
            { icon: <Car size={16} className="text-yellow-500" />, label: 'Uber/Taxi', time: formatTime(distKm / speeds.uber) },
            { icon: <Plane size={16} className="text-gray-300" />, label: 'Avião', time: '1 min', hidden: false }, // Comic: Always 1 min
        ];
    };

    const distance = (userLocation && business)
        ? calculateDistance(userLocation.lat, userLocation.lng, business.latitude, business.longitude)
        : null;

    const handleGoNow = () => {
        if (!business) return;
        // Universal deep link that works on both iOS and Android
        const url = `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`;
        window.open(url, '_blank');
    };
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Image Placeholder */}
            <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                <Link to="/" className="absolute top-4 left-4 bg-white/20 p-2 rounded-full text-white backdrop-blur-sm hover:bg-white/30 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
            </div>

            {/* Content */}
            <div className="px-4 -mt-10 relative z-10">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
                            <p className="text-gray-500">{business.category}</p>
                            {business.rating && (
                                <div
                                    className="flex items-center gap-1 mt-1 cursor-pointer hover:bg-gray-50 p-1 -ml-1 rounded transition-colors"
                                    onClick={() => {
                                        if (business.google_place_id) {
                                            window.open(`https://www.google.com/maps/place/?q=place_id:${business.google_place_id}`, '_blank');
                                        } else {
                                            const query = encodeURIComponent(`${business.name} ${business.address || 'Uberaba'}`);
                                            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                                        }
                                    }}
                                    title="Ver avaliações no Google Maps"
                                >
                                    <span className="text-yellow-400 flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < Math.round(business.rating) ? "currentColor" : "none"} className={i < Math.round(business.rating) ? "" : "text-gray-300"} />
                                        ))}
                                    </span>
                                    <span className="text-sm font-bold text-gray-700">{business.rating}</span>
                                    <span className="text-xs text-gray-500">({business.review_count || business.user_ratings_total || 0} no Google)</span>
                                    <ArrowLeft size={12} className="rotate-180 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <StatusBadge isOpen={isBusinessOpen} />
                    </div>

                    {/* Badges */}
                    <div className="flex gap-2 mb-6 flex-wrap items-center">
                        {getBadges().map((badge, idx) => (
                            <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                                {badge.icon} {badge.label}
                            </span>
                        ))}

                        {/* Claim Button */}
                        {(!business.owner_id || business.owner_id === 'admin_import') && (
                            <button
                                onClick={() => setShowClaimModal(true)}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200 transition-colors"
                            >
                                <ShieldCheck size={12} />
                                Reivindicar Empresa
                            </button>
                        )}
                    </div>

                    {showClaimModal && (
                        <ClaimBusinessModal business={business} onClose={() => setShowClaimModal(false)} />
                    )}

                    <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div className="flex items-center text-gray-600">
                            <Clock className="w-5 h-5 mr-3 text-blue-500" />
                            <span>{business.open_time} - {business.close_time}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                            <span>Uberaba, MG</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Phone className="w-5 h-5 mr-3 text-blue-500" />
                            <span>{business.whatsapp}</span>
                        </div>
                    </div>

                    {/* Proximity Card */}
                    {distance !== null && (
                        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-center gap-2 mb-3 text-blue-800 font-semibold">
                                <MapPin size={20} />
                                <span>Você está a {distance < 1 ? `${Math.round(distance * 1000)} metros` : `${distance.toFixed(1)} km`} daqui</span>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                                {getETAs(distance).map((eta, idx) => (
                                    <div key={idx} className={`flex flex-col items-center justify-center bg-white p-2 rounded-lg shadow-sm text-xs text-gray-600 ${eta.hidden ? 'opacity-50 hidden sm:flex' : ''}`}>
                                        <div className="mb-1 text-blue-500">{eta.icon}</div>
                                        <span className="font-bold">{eta.time}</span>
                                        <span className="text-[10px]">{eta.label}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleGoNow}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 animate-pulse"
                            >
                                <Navigation size={20} />
                                IR AGORA
                            </button>
                        </div>
                    )}

                    <div className="mt-6">
                        <h2 className="font-semibold text-gray-900 mb-2">Sobre</h2>
                        <p className="text-gray-600 leading-relaxed text-sm">{business.description}</p>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={handleWhatsAppClick}
                            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-md shadow-green-200"
                        >
                            <Phone size={20} />
                            Chamar no WhatsApp
                        </button>
                        <button
                            onClick={() => business.business_id && toggleFavorite(business.business_id)}
                            className={`p-3 rounded-xl transition-colors border ${business.business_id && isFavorite(business.business_id)
                                ? 'bg-red-50 text-red-500 border-red-100'
                                : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <Heart size={24} fill={business.business_id && isFavorite(business.business_id) ? "currentColor" : "none"} />
                        </button>
                        <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50">
                            <Share2 size={24} />
                        </button>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            Avaliações <Star size={18} className="text-yellow-400 fill-current" />
                        </h2>
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="text-blue-600 text-sm font-medium hover:underline"
                        >
                            Avaliar
                        </button>
                    </div>

                    {showReviewForm && (
                        <form onSubmit={submitReview} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="mb-3">
                                <label className="block text-xs font-bold text-gray-700 mb-1">Nota</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className={`p-1 ${newReview.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                        >
                                            <Star size={24} fill="currentColor" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="block text-xs font-bold text-gray-700 mb-1">Comentário</label>
                                <textarea
                                    value={newReview.comment}
                                    onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded text-sm"
                                    rows={3}
                                    placeholder="Conte sua experiência..."
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700">
                                Enviar Avaliação
                            </button>
                        </form>
                    )}

                    <div className="space-y-4">
                        {reviews.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Seja o primeiro a avaliar!</p>
                        ) : (
                            reviews.map(review => (
                                <div key={review.review_id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-gray-900 text-sm">Usuário</span>
                                        <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex text-yellow-400 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-200"} />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 text-sm">{review.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
