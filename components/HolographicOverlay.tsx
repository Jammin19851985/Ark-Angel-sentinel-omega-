
import React from 'react';

interface HolographicOverlayProps {
    isVisible: boolean;
    onClose: () => void;
    isFirstVisit: boolean; 
    onStartTour: () => void;
    onSkipTour: () => void;
}

const HolographicOverlay: React.FC<HolographicOverlayProps> = ({ isVisible, onClose, isFirstVisit, onStartTour, onSkipTour }) => {
    if (!isVisible) return null;

    const handleEngageClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClose(); 
    };

    const handleStartTour = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onStartTour();
        onClose();
    };

    const handleSkipTour = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onSkipTour();
        onClose();
    };

    return (
        <div 
            id="holographicOverlay"
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/95 backdrop-blur-3xl transition-opacity duration-700 animate-fade-in"
            style={{ pointerEvents: 'auto' }}
        >
            <div className="text-center flex flex-col items-center gap-6 md:gap-10 p-8 md:p-12 max-w-4xl relative z-[100001] border-2 border-slate-800 rounded-3xl bg-zinc-950 shadow-[0_0_100px_rgba(0,0,0,1)] mx-4">
                {/* Decorative Solid Corners */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)] rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)] rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)] rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)] rounded-br-2xl"></div>

                <div className="space-y-4 mt-4">
                    <h1 className="text-5xl md:text-8xl font-bold font-display tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                        ARCHANGEL
                    </h1>
                    <p className="text-cyan-400 font-mono text-xs md:text-base tracking-[1.5em] uppercase glow-text-cyan font-bold">Platform Interface v204.0</p>
                </div>

                <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent my-2 shadow-[0_0_15px_#00f3ff]"></div>

                <p className="text-slate-300 font-mono text-sm md:text-xl max-w-2xl leading-relaxed bg-black/50 p-4 rounded-lg border border-slate-800">
                    SENTINEL-A INTERFACE ONLINE. <br/>
                    <span className="text-amber-500 text-xs md:text-sm font-bold tracking-widest mt-4 block uppercase shadow-amber-glow">Awaiting Initialization Protocol</span>
                </p>

                {isFirstVisit ? (
                    <div className="flex flex-col sm:flex-row gap-6 mt-6 w-full justify-center">
                        {/* 3D Solid Button 1: Start Tour */}
                        <button 
                            onClick={handleStartTour}
                            className="group relative min-w-[200px] px-8 py-4 bg-zinc-900 border-2 border-cyan-500 rounded-lg transition-all duration-100 active:translate-y-1 active:shadow-none shadow-[0_4px_0_#0e7490] hover:shadow-[0_6px_0_#0e7490,0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 z-50 cursor-pointer"
                        >
                            <div className="relative z-10 flex flex-col items-center gap-1">
                                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] font-bold group-hover:text-white transition-colors">Protocol A</span>
                                <span className="text-xl font-bold font-display text-white tracking-wider group-hover:text-cyan-200">START TOUR</span>
                            </div>
                        </button>

                        {/* 3D Solid Button 2: Skip Tour */}
                        <button 
                            onClick={handleSkipTour}
                            className="group relative min-w-[200px] px-8 py-4 bg-zinc-900 border-2 border-amber-600 rounded-lg transition-all duration-100 active:translate-y-1 active:shadow-none shadow-[0_4px_0_#b45309] hover:shadow-[0_6px_0_#b45309,0_0_20px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 z-50 cursor-pointer"
                        >
                            <div className="relative z-10 flex flex-col items-center gap-1">
                                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-[0.3em] font-bold group-hover:text-white transition-colors">Protocol B</span>
                                <span className="text-xl font-bold font-display text-white tracking-wider group-hover:text-amber-200">SKIP INTRO</span>
                            </div>
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleEngageClick}
                        className="group relative px-12 py-5 bg-zinc-900 border-2 border-cyan-500 rounded-lg transition-all duration-100 active:translate-y-1 active:shadow-none shadow-[0_4px_0_#0e7490] hover:shadow-[0_6px_0_#0e7490,0_0_30px_rgba(6,182,212,0.6)] hover:-translate-y-0.5 z-50 cursor-pointer mt-4"
                    >
                        <span className="relative z-10 text-xl font-bold font-mono text-white tracking-[0.3em] uppercase group-hover:text-cyan-100">
                            ENGAGE SYSTEM
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default HolographicOverlay;
