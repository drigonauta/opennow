import { useEffect } from 'react';

declare global {
    interface Window {
        google: any;
    }
}

export const GoogleMapsLoader = () => {
    useEffect(() => {
        if (window.google) return; // Already loaded

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            window.dispatchEvent(new Event('google-maps-loaded'));
        };
        document.head.appendChild(script);
    }, []);

    return null;
};
