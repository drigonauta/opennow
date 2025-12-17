import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Phone, Share2, Heart, Navigation, ShieldCheck, Award, Car, Bike, Bus, Plane, Star } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useLocation } from '../context/LocationContext';
import { createWhatsAppMessageLink } from '../lib/utils';
import { StatusBadge } from '../components/StatusBadge';
import { ClaimBusinessModal } from '../components/ClaimBusinessModal';
import { ReviewForm } from '../components/ReviewForm';
import { ReviewList } from '../components/ReviewList';

import { LoginModal } from '../components/auth/LoginModal';

export const BusinessDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { businesses, updateBusinessStatus } = useBusiness();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { user, trackAction, refreshProfile } = useAuth();
    const { userLocation, calculateDistance, currentCity } = useLocation();

    // Logic to find business: context first, then fetch
    const contextBusiness = businesses.find(b => b.business_id === id);
    const [localBusiness, setLocalBusiness] = useState<any | null>(null);
    const [loading, setLoading] = useState(!contextBusiness);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showClaimModal, setShowClaimModal] = useState(false);

    // Gating State
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const [showPhone, setShowPhone] = useState(false);

    const business = contextBusiness || localBusiness;

    useEffect(() => {
        if (!contextBusiness && id) {
            fetch(`/api/business/${id}`)
                .then(res => res.json())
                .then(data => {
                    setLocalBusiness(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [id, contextBusiness]);

    // Tracking View
    useEffect(() => {
        if (business && user) {
            trackAction('view_business', business.business_id, { name: business.name });
            // If user is already logged in, show phone by default? 
            // Maybe keep it hidden to track "Show Phone" intent even for logged users?
            // Let's keep it consistent: Hidden until requested.
        }
    }, [business, user, trackAction]);


    if (loading) return <div className="p-4 text-center">Carregando...</div>;
    if (!business) return <div className="p-4 text-center">Negócio não encontrado.</div>;

    const isOpen = (business: any) => {
        if (business.forced_status === 'open') return true;
        if (business.forced_status === 'closed') return false;
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return currentTime >= business.open_time && currentTime <= business.close_time;
    };
    const isBusinessOpen = isOpen(business);

    const handleLoyaltyAction = async (action: 'checkin' | 'share') => {
        if (!user) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/loyalty/earn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.pointsEarned > 0) {
                    console.log(`Earned ${data.pointsEarned} points!`);
                }
                if (refreshProfile) refreshProfile();
            }
        } catch (e) {
            console.error(e);
        }
    };

    // ACTION HANDLERS WITH GATING
    const executeAction = (action: () => void) => {
        if (user) {
            action();
        } else {
            setPendingAction(() => action);
            setShowLoginModal(true);
        }
    };

    const handleWhatsAppClick = () => {
        executeAction(() => {
            const whatsappLink = createWhatsAppMessageLink(
                business.whatsapp,
                business.name,
                business.business_id,
                user?.displayName,
                currentCity
            );
            if (whatsappLink) {
                // Use location.href to avoid popup blockers in async flow
                window.location.href = whatsappLink;
                handleLoyaltyAction('share');
            }
            else alert("WhatsApp não disponível");
        });
    };

    const handleCallClick = () => {
        executeAction(() => {
            if (business.phone || business.whatsapp) {
                const phone = business.phone || business.whatsapp;
                const cleanPhone = phone.replace(/\D/g, '');
                window.location.href = `tel:${cleanPhone}`;
                trackAction('call_business', business.business_id);
            } else {
                alert("Telefone indisponível");
            }
        });
    };

    const handleShowPhone = () => {
        executeAction(() => {
            setShowPhone(true);
            trackAction('reveal_phone', business.business_id);
        });
    };

    const handleStatusUpdate = async (status: 'open' | 'closed') => {
        if (!user) return alert('Faça login para alterar.');
        await updateBusinessStatus(business.business_id, status);
    };

    // Helper for Badges
    const getBadges = () => {
        const badges = [];
        if (business.is_premium) badges.push({ icon: <Award className="text-yellow-500" />, label: 'Premium' });
        badges.push({ icon: <ShieldCheck className="text-blue-500" />, label: 'Verificado' });
        return badges;
    };

    // Distance & ETA Logic
    const distance = (userLocation && business.latitude && business.longitude)
        ? calculateDistance(userLocation.lat, userLocation.lng, business.latitude, business.longitude)
        : null;

    const getETAs = (distKm: number) => {
        const speeds = { walking: 5, bike: 15, bus: 25, car: 45, moto: 55, uber: 40, plane: 800 };
        const formatTime = (hours: number) => {
            const mins = Math.round(hours * 60);
            if (mins < 1) return '1 min';
            if (mins < 60) return `${mins} min`;
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h}h ${m} min`;
        };
        return [
            { icon: <Car size={16} />, label: 'Carro', time: formatTime(distKm / speeds.car) },
            { icon: <Navigation size={16} />, label: 'Moto', time: formatTime(distKm / speeds.moto) },
            { icon: <MapPin size={16} />, label: 'A pé', time: formatTime(distKm / speeds.walking) },
            { icon: <Bus size={16} />, label: 'Ônibus', time: formatTime(distKm / speeds.bus) },
            { icon: <Bike size={16} />, label: 'Bike', time: formatTime(distKm / speeds.bike) },
            { icon: <Car size={16} className="text-yellow-500" />, label: 'Uber/Taxi', time: formatTime(distKm / speeds.uber) },
            { icon: <Plane size={16} className="text-gray-300" />, label: 'Avião', time: '1 min', hidden: false },
        ];
    };

    const handleGoNow = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`;
        window.open(url, '_blank');
        handleLoyaltyAction('checkin');
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
                    {/* Header Info */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
                            <p className="text-gray-500">{business.category}</p>
                            {/* Rating Display */}
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-yellow-400 flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < Math.round(business.rating || 0) ? "currentColor" : "none"} className={i < Math.round(business.rating || 0) ? "" : "text-gray-300"} />
                                    ))}
                                </span>
                                <span className="text-sm font-bold text-gray-700">{business.rating ? business.rating.toFixed(1) : 'Novidade'}</span>
                            </div>
                        </div>
                        <StatusBadge isOpen={isBusinessOpen} />
                    </div>

                    {/* Owner Controls */}
                    {user && business.owner_id === user.uid && (
                        <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-100">
                            <div className="flex items-center gap-2 mb-3 text-green-700 font-semibold">
                                <ShieldCheck size={18} /> <span>Você administra esta página</span>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => handleStatusUpdate('open')} className={`flex-1 py-3 rounded border font-bold ${business.forced_status === 'open' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-green-300'}`}>ABERTO</button>
                                <button onClick={() => handleStatusUpdate('closed')} className={`flex-1 py-3 rounded border font-bold ${business.forced_status === 'closed' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-white border-red-300'}`}>FECHADO</button>
                            </div>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="flex gap-2 mb-6 flex-wrap items-center">
                        {getBadges().map((badge, idx) => (
                            <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                                {badge.icon} {badge.label}
                            </span>
                        ))}
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-4 border-t border-gray-100 pt-4 mt-4">
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
                            {showPhone ? (
                                <span className="font-semibold text-gray-900">{business.whatsapp}</span>
                            ) : (
                                <button
                                    onClick={handleShowPhone}
                                    className="text-blue-600 font-medium hover:underline flex items-center gap-1"
                                >
                                    Ver telefone
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Login</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex gap-3">
                        <button onClick={handleWhatsAppClick} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-md shadow-green-200">
                            <Phone size={20} /> WhatsApp
                        </button>

                        <button onClick={handleCallClick} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
                            <Phone size={20} /> Ligar
                        </button>

                        <button onClick={() => business.business_id && toggleFavorite(business.business_id)} className={`p-3 rounded-xl border ${isFavorite(business.business_id) ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-gray-400 border-gray-200'}`}>
                            <Heart size={24} fill={isFavorite(business.business_id) ? "currentColor" : "none"} />
                        </button>
                        <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50">
                            <Share2 size={24} />
                        </button>
                    </div>

                    {/* Claim */}
                    {(!business.owner_id || business.owner_id === 'admin_import') && (
                        <div className="mt-4 flex justify-center">
                            <button onClick={() => setShowClaimModal(true)} className="text-xs text-blue-600 hover:underline">Reivindicar esta empresa</button>
                        </div>
                    )}
                </div>

                {/* Map & Distance */}
                {distance !== null && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex items-center gap-2 mb-3 text-blue-800 font-semibold">
                            <MapPin size={20} />
                            <span>Você está a {distance < 1 ? `${Math.round(distance * 1000)} metros` : `${distance.toFixed(1)} km`} daqui</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                            {getETAs(distance).map((eta, idx) => (
                                <div key={idx} className="flex flex-col items-center justify-center bg-gray-50 p-2 rounded text-xs text-gray-600">
                                    <div className="text-blue-500 mb-1">{eta.icon}</div>
                                    <span className="font-bold">{eta.time}</span>
                                    <span className="text-[10px]">{eta.label}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleGoNow} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 animate-pulse">
                            <Navigation size={20} /> IR AGORA
                        </button>
                    </div>
                )}

                {/* Reviews */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        Avaliações <span className="text-sm font-normal text-white bg-blue-600 px-2 py-0.5 rounded-full">{business.rating ? business.rating.toFixed(1) : 'Novidade'}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <ReviewList
                                businessId={business.business_id}
                                ownerId={business.owner_id}
                                refreshTrigger={refreshTrigger}
                            />
                        </div>
                        <div className="md:sticky md:top-24 h-fit">
                            <ReviewForm
                                businessId={business.business_id}
                                onReviewSubmitted={() => setRefreshTrigger(prev => prev + 1)}
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="font-semibold text-gray-900 mb-2">Sobre</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">{business.description}</p>
                </div>
            </div>

            {showClaimModal && <ClaimBusinessModal business={business} onClose={() => setShowClaimModal(false)} />}

            {/* Login Gate Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={() => {
                    // Execute the action user wanted to do
                    if (pendingAction) {
                        pendingAction();
                        setPendingAction(null);
                    }
                }}
            />
        </div>
    );
};
