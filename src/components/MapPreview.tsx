import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useBusiness } from '../context/BusinessContext';
import { Maximize2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Icon (Same as MapPage)
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

export const MapPreview: React.FC = () => {
    const { filteredBusinesses, userLocation } = useBusiness();
    const navigate = useNavigate();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    const center = userLocation ? [userLocation.lat, userLocation.lng] : [-19.747, -47.939];

    if (!isMounted) return <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>;

    return (
        <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden shadow-lg border border-gray-200 group">
            <MapContainer
                center={center as [number, number]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false} // Cleaner look for preview
                dragging={true} // Allow dragging to explore nearby
                scrollWheelZoom={false} // Prevent accidental scrolling
            >
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

                {filteredBusinesses.map(business => (
                    <Marker
                        key={business.business_id}
                        position={[business.latitude, business.longitude]}
                        icon={businessIcon}
                        eventHandlers={{
                            click: () => navigate(`/business/${business.business_id}`),
                        }}
                    >
                    </Marker>
                ))}
            </MapContainer>

            {/* Overlay Controls */}
            <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
                <button
                    onClick={() => navigate('/map')}
                    className="bg-white p-2 rounded-full shadow-md text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Expandir Mapa"
                >
                    <Maximize2 size={20} />
                </button>
            </div>

            {/* Bottom Overlay Label */}
            <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 z-[1000] cursor-pointer"
                onClick={() => navigate('/map')}
            >
                <div className="flex items-center text-white gap-2">
                    <MapPin size={18} className="text-green-400" />
                    <span className="font-medium text-sm">Explorar mapa completo</span>
                </div>
            </div>
        </div>
    );
};
