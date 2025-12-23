
import React, { useRef } from 'react';
import { ArkAngelIcon } from './icons/ArkAngelIcon';
import KeepAwakeToggle from './KeepAwakeToggle';
import { BatmanIcon } from './icons/BatmanIcon';
import { useAppContext } from '../contexts/AppContext';
import { ShieldIcon } from './icons/ShieldIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { VideoIcon } from './icons/VideoIcon';

interface HeaderProps {
    onAnalyzeSentiment?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAnalyzeSentiment }) => {
    const { isGodMode, isSovereign, setWallpaperVideoSrc, addLog } = useAppContext();
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
        if (!isGodMode) {
            addLog('ERROR', 'Access Denied: Wallpaper configuration requires God Mode clearance.');
            return;
        }
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
                            ARK Ω // TURMOX
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
                                    onClick={triggerUpload}
                                    className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-amber-900/30 hover:bg-amber-800/40 border border-amber-500/50 rounded text-amber-400 text-xs font-mono transition-all animate-pulse"
                                    title="Set Live Wallpaper (.mp4) - GOD MODE AUTHORIZED"
                                >
                                    <VideoIcon className="w-4 h-4" />
                                    <span>WALLPAPER</span>
                                </button>
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black border border-amber-500 text-[10px] text-amber-500 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    GOD MODE UNLOCKED
                                </div>
                            </div>
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
                                <ShieldIcon className="h-8 w-8 text-amber-400" style={{ filter: 'drop-shadow(0 0 5px var(--glow-color-gold))' }} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
