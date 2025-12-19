
import React from 'react';

interface HolographicOverlayProps {
    isVisible: boolean;
    onClose: () => void;
    isFirstVisit: boolean; // New prop: true if this is the user's first visit
    onStartTour: () => void; // New prop: Callback to start the tour
    onSkipTour: () => void; // New prop: Callback to skip the tour
}

const HolographicOverlay: React.FC<HolographicOverlayProps> = ({ isVisible, onClose, isFirstVisit, onStartTour, onSkipTour }) => {
    const handleEngageClick = () => {
        onClose(); // Close the overlay
    };

    const handleStartTour = () => {
        onStartTour();
        onClose();
    };

    const handleSkipTour = () => {
        onSkipTour();
        onClose();
    };

    return (
        <div 
            id="holographicOverlay"
            className={`holographic-overlay ${isVisible ? 'visible' : ''}`}
            aria-hidden={!isVisible}
        >
            <div className="text-center flex flex-col items-center gap-8 p-4">
                <h1 className="holographic-text text-5xl font-bold font-mono tracking-widest">
                    ARCHANGEL PLATFORM
                </h1>
                <p className="holographic-text text-xl font-mono">
                    SENTINEL-A INTERFACE ONLINE
                </p>
                {isFirstVisit ? (
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <button 
                            className="neon-button font-mono uppercase"
                            onClick={handleStartTour}
                            aria-label="Start Onboarding Tour"
                        >
                            Start Tour
                        </button>
                        <button 
                            className="neon-button font-mono uppercase border-slate-700 text-slate-300 hover:text-slate-900 hover:bg-slate-300"
                            onClick={handleSkipTour}
                            aria-label="Skip Onboarding Tour"
                        >
                            Skip Tour
                        </button>
                    </div>
                ) : (
                    <button 
                        id="closeOverlay" 
                        className="neon-button mt-4 font-mono uppercase"
                        onClick={handleEngageClick}
                        aria-label="Engage Sentinel-A Interface"
                    >
                        Engage
                    </button>
                )}
            </div>
        </div>
    );
};

export default HolographicOverlay;
