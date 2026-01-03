
import React from 'react';

interface HolographicOverlayProps {
    isVisible: boolean;
    onClose: () => void;
}

const HolographicOverlay: React.FC<HolographicOverlayProps> = ({ isVisible, onClose }) => {
    if (!isVisible) return null;

    const handleEngageClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClose(); 
    };

    return (
        <div 
            id="holographicOverlay"
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/95 backdrop-blur-3xl transition-opacity duration-700 animate-fade-in"
            style={{ pointerEvents: 'auto' }}
        >
            <div className="text-center flex flex-col items-center gap-8 md:gap-12 p-8 md:p-16 max-w-5xl relative z-[100001] border border-slate-800 bg-[#050505] shadow-[0_0_150px_rgba(0,243,255,0.1)] mx-4 clip-path-polygon">
                {/* Decorative Tech Corners */}
                <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-cyan-500 opacity-50"></div>
                <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-cyan-500 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-cyan-500 opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-cyan-500 opacity-50"></div>

                <div className="space-y-6 mt-4">
                    <h1 className="text-6xl md:text-9xl font-bold font-display tracking-widest text-white drop-shadow-[0_0_25px_rgba(0,243,255,0.5)]">
                        ARCHANGEL
                    </h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-[1px] w-12 bg-cyan-900"></div>
                        <p className="text-cyan-400 font-mono text-sm md:text-lg tracking-[1em] uppercase glow-text-cyan font-bold">Singularity Alpha</p>
                        <div className="h-[1px] w-12 bg-cyan-900"></div>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-900 to-transparent my-4"></div>

                <div className="text-slate-400 font-mono text-xs md:text-sm max-w-3xl leading-relaxed space-y-2 uppercase tracking-wider">
                    <p>Majorana Qubit Coherence: <span className="text-green-400">STABLE</span></p>
                    <p>Atmospheric Noise RNG: <span className="text-green-400">SYNCED</span></p>
                    <p>Sovereign Will: <span className="text-amber-500 animate-pulse">PENDING AUTHORIZATION</span></p>
                </div>

                <button 
                    onClick={handleEngageClick}
                    className="group relative px-16 py-6 bg-cyan-950/20 border border-cyan-500/50 transition-all duration-300 hover:bg-cyan-900/40 hover:border-cyan-400 hover:shadow-[0_0_50px_rgba(0,243,255,0.4)] cursor-pointer mt-8 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <span className="relative z-10 text-2xl font-bold font-display text-white tracking-[0.2em] uppercase group-hover:text-cyan-100">
                        INITIALIZE NEURAL LINK
                    </span>
                    <div className="absolute bottom-0 left-0 h-[2px] w-full bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </button>
                
                <div className="absolute bottom-4 text-[10px] text-slate-700 font-mono uppercase tracking-[0.3em]">
                    v204.0 // Build 9942-Omega
                </div>
            </div>
        </div>
    );
};

export default HolographicOverlay;
