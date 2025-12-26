
import React from 'react';

interface HolographicOverlayProps {
    isVisible: boolean;
    onClose: () => void;
    isFirstVisit: boolean; 
    onStartTour: () => void;
    onSkipTour: () => void;
}

const HolographicOverlay: React.FC<HolographicOverlayProps> = ({ isVisible, onClose, isFirstVisit, onStartTour, onSkipTour }) => {
    const handleEngageClick = () => {
        onClose(); 
    };

    const handleStartTour = () => {
        onStartTour();
        onClose();
    };

    const handleSkipTour = () => {
        // Just call onSkipTour (which sets isFirstVisit to false in App.tsx)
        // This triggers a re-render where isFirstVisit is false, showing the "Engage System" button.
        // We do NOT call onClose() here, allowing the user to click "Engage System".
        onSkipTour();
    };

    return (
        <div 
            id="holographicOverlay"
            className={`holographic-overlay ${isVisible ? 'visible' : ''}`}
            aria-hidden={!isVisible}
        >
            <div className="text-center flex flex-col items-center gap-10 p-8 max-w-2xl relative z-50">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50"></div>

                <div className="space-y-2">
                    <h1 className="holographic-text text-6xl font-bold font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                        ARCHANGEL
                    </h1>
                    <p className="text-cyan-400 font-mono text-sm tracking-[0.8em] uppercase">Platform Interface v204.0</p>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent my-4"></div>

                <p className="text-slate-300 font-mono text-lg max-w-md leading-relaxed">
                    SENTINEL-A INTERFACE ONLINE. <br/>
                    <span className="text-amber-500 text-sm">Please select initialization protocol.</span>
                </p>

                {isFirstVisit ? (
                    <div className="flex flex-col sm:flex-row gap-8 mt-6">
                        {/* Chip Button 1: Start Tour */}
                        <button 
                            onClick={handleStartTour}
                            className="group relative px-8 py-4 bg-black/60 border border-cyan-500/30 rounded-lg overflow-hidden transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 bg-cyan-900/10 group-hover:bg-cyan-900/20 transition-colors"></div>
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 group-hover:opacity-100"></div>
                            <div className="relative flex flex-col items-center gap-1">
                                <span className="text-xs font-mono text-cyan-600 uppercase tracking-widest group-hover:text-cyan-400">Protocol A</span>
                                <span className="text-xl font-bold font-display text-white tracking-wider group-hover:text-cyan-100">START TOUR</span>
                            </div>
                            {/* Corner Accents */}
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500"></div>
                        </button>

                        {/* Chip Button 2: Skip Tour */}
                        <button 
                            onClick={handleSkipTour}
                            className="group relative px-8 py-4 bg-black/60 border border-slate-700 rounded-lg overflow-hidden transition-all duration-300 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-amber-900/10 transition-colors"></div>
                            <div className="relative flex flex-col items-center gap-1">
                                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest group-hover:text-amber-600">Protocol B</span>
                                <span className="text-xl font-bold font-display text-slate-300 tracking-wider group-hover:text-amber-100">SKIP INTRO</span>
                            </div>
                        </button>
                    </div>
                ) : (
                    <button 
                        id="closeOverlay" 
                        onClick={handleEngageClick}
                        className="neon-button mt-4 font-mono uppercase tracking-widest text-lg px-12 py-4"
                    >
                        Engage System
                    </button>
                )}
            </div>
        </div>
    );
};

export default HolographicOverlay;
