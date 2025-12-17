import React from 'react';
import { useAds } from '../context/AdsContext';

interface AdBannerProps {
    previewImage?: string | null;
}

export const AdBanner: React.FC<AdBannerProps> = ({ previewImage }) => {
    const { activeAd } = useAds();

    // Prioritize preview, then active ad
    const displayImage = previewImage || activeAd?.imageUrl;
    const neonColor = activeAd?.neonColor || '#00ff00';

    const isPreview = !!previewImage;

    // Common Styles
    const containerClasses = "hidden md:block mb-8 relative group transform hover:scale-[1.005] transition-transform duration-300 w-full";
    const frameClasses = "absolute -inset-1 bg-gray-900 rounded-xl shadow-2xl z-0";
    const screenClasses = "relative z-10 bg-black rounded-lg overflow-hidden h-48 md:h-56 w-full flex items-center justify-center";

    return (
        <div className={containerClasses}>
            {/* Outdoor Structure (Frame) */}
            <div className={frameClasses}></div>

            {/* Custom Neon Border (The "Outdoor Light") */}
            <div className="absolute -inset-1 rounded-xl z-20 pointer-events-none"
                style={{
                    boxShadow: `0 0 15px ${neonColor}, 0 0 30px ${neonColor}, inset 0 0 10px ${neonColor}`,
                    border: `2px solid ${neonColor}`,
                    opacity: 0.8,
                    animation: 'pulse-neon 2s infinite alternate'
                }}
            ></div>
            <style>{`
                @keyframes pulse-neon {
                    from { opacity: 0.7; box-shadow: 0 0 10px ${neonColor}, 0 0 20px ${neonColor}; }
                    to { opacity: 1; box-shadow: 0 0 25px ${neonColor}, 0 0 40px ${neonColor}; }
                }
            `}</style>

            {/* Screen Content Container */}
            <div className={screenClasses}>

                {/* Background Grid (LED Effect) */}
                <div
                    className="absolute inset-0 z-0 bg-black"
                    style={{
                        backgroundImage: 'radial-gradient(rgba(50,50,50,0.3) 1px, transparent 1px)',
                        backgroundSize: '4px 4px'
                    }}
                ></div>

                {displayImage ? (
                    <>
                        <img
                            src={displayImage}
                            alt="Advertisement"
                            className={`w-full h-full object-cover z-10 relative ${isPreview ? 'opacity-80' : 'opacity-90'}`}
                        />
                        {isPreview && (
                            <div className="absolute top-4 right-4 z-30 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg animate-pulse">
                                PREVIEW
                            </div>
                        )}
                        {!isPreview && activeAd && (
                            <div className="absolute bottom-4 right-4 z-30">
                                <span className="bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/20 uppercase tracking-widest backdrop-blur-sm">
                                    Patrocinado
                                </span>
                            </div>
                        )}
                    </>
                ) : (
                    // Placeholder State (Empty LED Panel)
                    <div className="relative z-10 flex flex-col items-center justify-center text-center opacity-80 h-full p-8 animate-pulse-slow">
                        <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-700 uppercase tracking-widest" style={{ textShadow: '0 0 5px rgba(255,255,255,0.1)' }}>
                            PAINEL LED
                        </h2>
                        <p className="text-green-500/50 font-mono text-xs tracking-[0.3em] mt-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                            DISPONÍVEL
                        </p>
                    </div>
                )}

                {/* Scanline Effect Overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-20 animate-scanline"></div>
                <style>{`
                    @keyframes scanline {
                        0% { transform: translateY(-100%); }
                        100% { transform: translateY(100%); }
                    }
                    .animate-scanline {
                        animation: scanline 8s linear infinite;
                    }
                    @keyframes pulse-slow {
                         0%, 100% { opacity: 0.8; }
                         50% { opacity: 0.6; }
                    }
                    .animate-pulse-slow {
                        animation: pulse-slow 4s ease-in-out infinite;
                    }
                `}</style>
            </div>
        </div>
    );
};
