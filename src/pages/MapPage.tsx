import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useBusiness } from '../context/BusinessContext';
import { Navigation, Clock, MapPin, ArrowRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom User Icon
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom Business Icon (Red)
const businessIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const MapPage: React.FC = () => {
    const { businesses, userLocation } = useBusiness();
    const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
    // Calculate ETA based on distance (assuming 30km/h avg city speed)
    const eta = React.useMemo(() => {
        if (selectedBusiness && userLocation) {
            const dist = calculateDistance(userLocation.lat, userLocation.lng, selectedBusiness.latitude, selectedBusiness.longitude);
            const timeHours = dist / 30; // 30km/h
            const timeMins = Math.round(timeHours * 60);
            return `${timeMins} min de carro`;
        }
        return '';
    }, [selectedBusiness, userLocation]);

    const handleGoNow = (lat: number, lng: number) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(url, '_blank');
    };

    const center = userLocation ? [userLocation.lat, userLocation.lng] : [-19.747, -47.939];

    return (
        <div className="h-[calc(100vh-64px)] relative">
            <MapContainer center={center as [number, number]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                {userLocation && (
                    <>
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                            <Popup>Você está aqui</Popup>
                        </Marker>
                        <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />
                    </>
                )}

                {businesses.map(business => (
                    <Marker
                        key={business.business_id}
                        position={[business.latitude, business.longitude]}
                        icon={businessIcon}
                        eventHandlers={{
                            click: () => setSelectedBusiness(business),
                        }}
                    >
                    </Marker>
                ))}
            </MapContainer>

            {/* Proximity / Detail Card */}
            {selectedBusiness && (
                <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl p-4 z-[1000] animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">{selectedBusiness.name}</h3>
                            <p className="text-sm text-gray-500">{selectedBusiness.category}</p>
                        </div>
                        <button onClick={() => setSelectedBusiness(null)} className="text-gray-400 hover:text-gray-600">
                            ✕
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <MapPin size={16} className="text-blue-500" />
                            <span>
                                {userLocation ?
                                    calculateDistance(userLocation.lat, userLocation.lng, selectedBusiness.latitude, selectedBusiness.longitude).toFixed(1) + ' km'
                                    : '?? km'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock size={16} className="text-orange-500" />
                            <span>{eta}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleGoNow(selectedBusiness.latitude, selectedBusiness.longitude)}
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            <Navigation size={16} /> IR AGORA
                        </button>
                        <a
                            href={`https://wa.me/${selectedBusiness.whatsapp}?text=Olá! Vim direto pelo aplicativo OpeNow.`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                        >
                            WhatsApp <ArrowRight size={16} />
                        </a>
                    </div>

                    {/* Proximity Alert Mock */}
                    {userLocation && calculateDistance(userLocation.lat, userLocation.lng, selectedBusiness.latitude, selectedBusiness.longitude) < 0.1 && (
                        <div className="mt-3 bg-blue-50 text-blue-700 px-3 py-2 rounded text-xs font-bold text-center border border-blue-100">
                            📍 Você está a menos de 100m!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
