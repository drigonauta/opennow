/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { APILoader } from '@googlemaps/extended-component-library/react';

export const GoogleMapDemo: React.FC = () => {
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const pickerRef = useRef<any>(null);

    useEffect(() => {
        // Initialize InfoWindow when API is loaded (handled by APILoader)
        // But we need to wait for the map to be ready.
        // For simplicity in this demo, we'll just set up the event listener.

        const picker = pickerRef.current;
        const map = mapRef.current;
        const marker = markerRef.current;

        if (!picker || !map || !marker) return;

        const handlePlaceChange = () => {
            const place = picker.value;

            if (!place || !place.location) {
                if (place && place.name) {
                    alert(`No details available for input: '${place.name}'`);
                }
                marker.position = null;
                return;
            }

            if (place.viewport) {
                map.innerMap.fitBounds(place.viewport);
            } else {
                map.center = place.location;
                map.zoom = 17;
            }

            marker.position = place.location;

            // InfoWindow logic would go here, but requires google.maps object
            // which is available after APILoader loads.
            // We can access it via window.google.maps if needed.
        };

        picker.addEventListener('gmpx-placechange', handlePlaceChange);

        return () => {
            picker.removeEventListener('gmpx-placechange', handlePlaceChange);
        };
    }, []);

    return (
        <div className="h-screen w-full flex flex-col">
            <APILoader apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} solutionChannel="GMP_GE_mapsandplacesautocomplete_v2" />

            <div className="p-4 bg-white shadow-md z-10">
                <h1 className="text-xl font-bold mb-2">Google Maps Web Components Demo</h1>
                <div className="w-full max-w-md">
                    <gmpx-place-picker ref={pickerRef} placeholder="Enter an address"></gmpx-place-picker>
                </div>
            </div>

            <div className="flex-1 relative">
                <gmp-map ref={mapRef} center="40.749933,-73.98633" zoom="13" map-id="DEMO_MAP_ID" style={{ height: '100%', width: '100%' }}>
                    <gmp-advanced-marker ref={markerRef}></gmp-advanced-marker>
                </gmp-map>
            </div>
        </div>
    );
};
