
import React, { useRef } from 'react';
import { ArkAngelIcon } from './icons/ArkAngelIcon';
import KeepAwakeToggle from './KeepAwakeToggle';
import { BatmanIcon } from './icons/BatmanIcon';
import { useAppContext } from '../contexts/AppContext';
import { ShieldIcon } from './icons/ShieldIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { VideoIcon } from './icons/VideoIcon';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';

interface HeaderProps {
    onAnalyzeSentiment?: () => void;
    onStartTour?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAnalyzeSentiment, onStartTour }) => {
    const { 
        isGodMode, 
        isSovereign, 
        setWallpaperVideoSrc, 
        addLog,
        wallpaperOpacity,
        setWallpaperOpacity,
        wallpaperBlur,
        setWallpaperBlur
    } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setWallpaperVideoSrc(url);
            addLog('SYSTEM', `Live Wallpaper updated: ${file.name}`);
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <header className="bg-black/30 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <ArkAngelIcon className="h-8 w-8 text-amber-400 ark-angel-icon"/>
                        <h1 
                            className="text-xl font-bold text-slate-100 font-mono tracking-wider"
                            style={{ textShadow: '0 0 10px rgba(252, 211, 77, 0.4)' }}
                        >
                            ARCHANGEL
                        </h1>
                        {isSovereign && (
                            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-r from-violet-900 to-fuchsia-900 border border-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)] animate-pulse">
                                SOVEREIGN STATE
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-4 md:space-x-6">
                        {/* Only available and interactable in God Mode */}
                        {isGodMode && (
                            <div className="relative group">
                                <input 
                                    type="file" 
                                    accept="video/mp4,video/webm" 
                                    className="hidden" 
                                    ref={fileInputRef} 
                                    onChange={handleWallpaperUpload} 
                                />
                                <button
                                    className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-amber-900/30 hover:bg-amber-800/40 border border-amber-500/50 rounded text-amber-400 text-xs font-mono transition-all animate-pulse"
                                    title="Live Wallpaper Settings - GOD MODE AUTHORIZED"
                                >
                                    <VideoIcon className="w-4 h-4" />
                                    <span>WALLPAPER</span>
                                </button>
                                
                                {/* Dropdown Menu for Wallpaper Settings */}
                                <div className="absolute top-full right-0 mt-2 w-64 bg-black/90 border border-amber-500/50 rounded-lg p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50 backdrop-blur-md">
                                    <div className="flex flex-col space-y-4">
                                        <div className="border-b border-amber-500/30 pb-2 mb-1">
                                            <h4 className="text-amber-500 text-[10px] font-bold uppercase tracking-widest">Wallpaper Matrix</h4>
                                        </div>
                                        
                                        <button 
                                            onClick={triggerUpload}
                                            className="w-full bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/50 text-amber-400 text-[10px] font-bold py-2 rounded transition-colors uppercase tracking-wider"
                                        >
                                            Upload Source (.mp4)
                                        </button>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                                <span>OPACITY</span>
                                                <span className="text-amber-300">{(wallpaperOpacity * 100).toFixed(0)}%</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="0" 
                                                max="1" 
                                                step="0.05" 
                                                value={wallpaperOpacity} 
                                                onChange={(e) => setWallpaperOpacity(parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                                <span>BLUR</span>
                                                <span className="text-amber-300">{wallpaperBlur}px</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="0" 
                                                max="20" 
                                                step="1" 
                                                value={wallpaperBlur} 
                                                onChange={(e) => setWallpaperBlur(parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                        </div>
                                        <div className="text-[9px] text-slate-500 text-center pt-1 italic">
                                            GOD MODE UNLOCKED
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {onStartTour && (
                            <button
                                onClick={onStartTour}
                                className="hidden md:flex items-center justify-center p-2 text-slate-400 hover:text-amber-400 transition-colors rounded-full hover:bg-slate-800"
                                title="Restart Onboarding Tour"
                            >
                                <QuestionMarkCircleIcon className="w-5 h-5" />
                            </button>
                        )}

                        {onAnalyzeSentiment && (
                            <button
                                onClick={onAnalyzeSentiment}
                                className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-700/30 rounded text-amber-400 text-xs font-mono transition-all hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] group"
                                title="Run Global Sentiment Scan"
                            >
                                <NewspaperIcon className="w-4 h-4 group-hover:animate-pulse" />
                                <span>SENTIMENT SCAN</span>
                            </button>
                        )}
                        <KeepAwakeToggle />
                        <div className="w-8 h-8">
                            {isGodMode ? (
                                <BatmanIcon className="h-8 w-8 holographic-gold-icon" />
                            ) : (
                                <ShieldIcon className="h-8 w-8 text-cyan-400 animate-spin-slow" style={{ filter: 'drop-shadow(0 0 5px var(--neon-cyan))' }} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
