import React, { useState } from 'react';
import Fuse from 'fuse.js';
import { Link } from 'react-router-dom';
import { useBusiness } from '../context/BusinessContext';
import { useLocation } from '../context/LocationContext';
import { BusinessCard } from '../components/BusinessCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { SearchBar } from '../components/SearchBar';
import { MapPreview } from '../components/MapPreview';
import { CitySearch } from '../components/CitySearch';
import { CityStatsBadge } from '../components/CityStatsBadge';
import { UserStatusBadge } from '../components/UserStatusBadge';


import { AdBanner } from '../components/AdBanner'; // Import AdBanner
import { API_BASE_URL } from '../lib/api';

export const Home: React.FC = () => {
    const { businesses, filteredBusinesses, error, lastUpdated, sortBy, setSortBy, refreshBusinesses, selectedCategory, setSelectedCategory } = useBusiness();
    const { currentCity, userLocation } = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpenOnly, setIsOpenOnly] = useState(false);

    const isBusinessOpen = (business: any) => {
        if (business.forced_status === 'open') return true;
        if (business.forced_status === 'closed') return false;

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return currentTime >= business.open_time && currentTime <= business.close_time;
    };

    // Helper for normalization
    const normalizeString = (str: string) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    };

    // Auto-import when city changes if list is empty
    React.useEffect(() => {
        if (currentCity && currentCity !== 'Todas' && currentCity !== 'Uberaba') {
            const normCurrentCity = normalizeString(currentCity);

            // Check if we have businesses in this city
            const hasBusinesses = businesses.some(b =>
                b.city && normalizeString(b.city) === normCurrentCity
            );

            if (!hasBusinesses) {
                console.log(`City changed to ${currentCity} (norm: ${normCurrentCity}), auto-importing...`);
                // Trigger a generic search to populate
                // We use "Restaurante" as a safe default to get some content
                fetch(`${API_BASE_URL}/api/search/hybrid`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        term: 'Restaurante',
                        city: currentCity,
                        lat: userLocation?.lat,
                        lng: userLocation?.lng
                    })
                }).then(res => {
                    if (res.ok) refreshBusinesses();
                }).catch(console.error);
            }
        }
    }, [currentCity, businesses, userLocation, refreshBusinesses]);

    // Fuse.js Search (Client-side search on top of filtered list)
    const fuse = React.useMemo(() => {
        if (!filteredBusinesses.length) return null;
        return new Fuse(filteredBusinesses, {
            keys: ['name', 'description', 'category'],
            threshold: 0.3,
            distance: 100,
        });
    }, [filteredBusinesses]);

    // Final display list (Search on top of Context Filter)
    const displayBusinesses = React.useMemo(() => {
        if (searchQuery && fuse) {
            return fuse.search(searchQuery).map((r: any) => r.item);
        }
        return filteredBusinesses;
    }, [filteredBusinesses, searchQuery, fuse]);

    // Businesses are already sorted by distance in Context if userLocation is available
    const businessesWithDistance = displayBusinesses;


    // if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

    return (
        <div className="min-h-screen bg-ta-bg pb-20">
            {/* Top Logo Header */}
            {/* Top Logo Header - Pure Black to match logo */}
            <div className="bg-black py-4 px-4 border-b border-gray-900 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex justify-between items-center w-full md:w-auto">
                        <img
                            src="/logo-taaberto.png"
                            alt="TáAberto Logo"
                            className="h-12 md:h-16 object-contain"
                        />
                        {/* Mobile User Badge (optional, but keeping layout simple for now, user badge is usually top right) */}
                        <div className="md:hidden">
                            <UserStatusBadge />
                        </div>
                    </div>

                    {/* Stats Badge - Centered on Desktop, Below Logo on Mobile */}
                    <div className="order-last md:order-none w-full md:w-auto flex justify-center">
                        <CityStatsBadge />
                    </div>

                    {/* Desktop User Badge */}
                    <div className="hidden md:block">
                        <UserStatusBadge />
                    </div>
                </div>
            </div>

            {/* Hero Banner */}
            <div className="relative bg-[#050B11] border-b border-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Background Glow Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-10">

                    {/* Left Side: Advertising Space */}
                    <div className="relative overflow-hidden rounded-2xl border border-ta-blue/30 bg-ta-blue/5 p-8 text-center hover:bg-ta-blue/10 transition-colors group cursor-pointer backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-br from-ta-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-2xl font-bold text-ta-blue mb-2">Sua Marca Aqui</h3>
                        <p className="text-blue-200/80 mb-6">Alcance milhares de clientes em Uberaba.</p>
                        <span className="inline-block bg-ta-blue/20 text-ta-blue px-6 py-2 rounded-full text-sm font-bold border border-ta-blue/30 group-hover:bg-ta-blue group-hover:text-black transition-all">
                            Anuncie Conosco
                        </span>
                    </div>

                    {/* Right Side: User Focus CTA */}
                    <div className="text-center md:text-left space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6 text-white">
                                Descubra quem está <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-ta-green to-emerald-400 drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">ABERTO AGORA</span>
                                <br />
                                <span className="text-2xl md:text-3xl font-medium text-gray-300">na sua cidade.</span>
                            </h1>
                            <p className="text-lg text-gray-400 max-w-lg mx-auto md:mx-0 leading-relaxed">
                                Encontre restaurantes, serviços e lojas operando neste exato momento. Sem perder viagem.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center md:justify-start gap-4">
                            <button
                                onClick={() => {
                                    setIsOpenOnly(true);
                                    document.getElementById('business-list')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="w-full sm:w-auto bg-ta-blue text-black px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(0,180,255,0.3)] hover:bg-white hover:scale-105 transition-all transform flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span className="font-bold">Ver empresas abertas agora</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                            <Link
                                to="/login"
                                className="text-gray-400 hover:text-white font-medium transition-colors px-4 py-2"
                            >
                                Já tenho conta
                            </Link>
                        </div>
                    </div>

                </div>
            </div>

            {/* Location Selector */}
            <div className="bg-ta-card border-b border-gray-800 py-4 px-4 flex flex-col justify-center items-center gap-4 relative z-20">
                <CitySearch />
            </div>

            {/* Header / Search */}
            <div className="bg-ta-bg/80 backdrop-blur-xl shadow-lg sticky top-0 z-40 border-b border-white/5 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <span className="flex items-center text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 animate-pulse">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                                    Radar Ativo
                                </span>
                                {lastUpdated && (
                                    <span className="text-[10px] text-gray-400">
                                        Atualizado: {lastUpdated.toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setIsOpenOnly(!isOpenOnly)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${isOpenOnly
                                        ? 'bg-ta-green/20 text-ta-green border-ta-green border shadow-neon-green'
                                        : 'bg-ta-card text-gray-400 border-gray-700 border hover:border-gray-500'
                                        }`}
                                >
                                    {isOpenOnly ? '🟢 Abertos Agora' : '⚪ Mostrar todos'}
                                </button>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating')}
                                    className="px-3 py-1 rounded-full text-xs font-medium bg-ta-card border border-gray-700 text-ta-text focus:outline-none focus:ring-2 focus:ring-ta-blue"
                                >
                                    <option value="distance">📍 Mais Próximos</option>
                                    <option value="rating">⭐ Melhor Avaliados</option>
                                </select>
                            </div>
                        </div>

                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onSearch={async (term) => {
                                if (!term) return;
                                // Call Hybrid Search
                                try {
                                    const res = await fetch(`${API_BASE_URL}/api/search/hybrid`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            term,
                                            city: currentCity || 'Uberaba',
                                            lat: userLocation?.lat,
                                            lng: userLocation?.lng
                                        })
                                    });
                                    if (res.ok) {
                                        // Refresh businesses from context to see new imports
                                        await refreshBusinesses();
                                    }
                                } catch (e) {
                                    console.error("Search failed", e);
                                }
                            }}
                        />

                        <CategoryFilter
                            selected={selectedCategory}
                            onSelect={setSelectedCategory}
                        />
                        <AdBanner />
                    </div>
                </div>
            </div>

            {/* Map Preview Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <MapPreview />
            </div>

            {/* Business List */}
            <main id="business-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businessesWithDistance.map((business) => (
                        <BusinessCard
                            key={business.business_id}
                            business={business}
                            distance={(business as any)._distance ? ((business as any)._distance < 1 ? `${Math.round((business as any)._distance * 1000)} m` : `${(business as any)._distance.toFixed(1)} km`) : undefined}
                            isOpen={isBusinessOpen(business)}
                        />
                    ))}
                </div>

                {businessesWithDistance.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Nenhum negócio encontrado.</p>
                        <button
                            onClick={() => {
                                setSelectedCategory('All');
                                setSearchQuery('');
                                setIsOpenOnly(false);
                            }}
                            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Limpar filtros
                        </button>
                    </div>
                )}
            </main>
        </div >
    );
};
