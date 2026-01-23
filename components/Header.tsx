
import React, { useRef } from 'react';
import { ArkAngelIcon } from './icons/ArkAngelIcon';
import KeepAwakeToggle from './KeepAwakeToggle';
import { BatmanIcon } from './icons/BatmanIcon';
import { useAppContext } from '../contexts/AppContext';
import { VideoIcon } from './icons/VideoIcon';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';
import { NetworkIcon } from './icons/NetworkIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';

interface HeaderProps {
    onAnalyzeSentiment?: () => void;
    onStartTour?: () => void;
    onInitiateSwarm?: () => void;
    aiProvider: 'GEMINI' | 'OPENAI';
    toggleAiProvider: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAnalyzeSentiment, onStartTour, onInitiateSwarm, aiProvider, toggleAiProvider }) => {
    const { 
        isGodMode, 
        isSovereign, 
        setWallpaperVideoSrc, 
        addLog,
        theme,
        toggleTheme,
        coreState
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

    return (
        <header className={`border-b z-50 relative transition-colors duration-500 shrink-0 ${isGodMode ? 'bg-[#1a1500] border-[#b45309]' : 'bg-[#080808] border-[#333]'}`}>
            {/* Decorative Top Line */}
            <div className={`absolute top-0 left-0 w-full h-[1px] ${isGodMode ? 'bg-amber-500 animate-pulse' : 'bg-gradient-to-r from-transparent via-cyan-500 to-transparent'} opacity-50`}></div>
            
            <div className="max-w-[1920px] mx-auto px-4 lg:px-6">
                <div className="flex items-center justify-between h-12">
                    {/* Branding Area */}
                    <div className="flex items-center gap-3">
                        <div className={`p-1 rounded border ${isGodMode ? 'border-amber-500 bg-amber-950/30' : 'border-cyan-900 bg-cyan-950/20'} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                            <ArkAngelIcon className={`h-5 w-5 ${isGodMode ? 'text-amber-400' : 'text-cyan-400'}`}/>
                        </div>
                        <div className="flex flex-col">
                            <h1 className={`text-lg font-display font-bold tracking-widest leading-none ${isGodMode ? 'text-amber-100 glow-text-gold' : 'text-slate-100'}`}>
                                ARCHANGEL
                            </h1>
                            <span className="text-[8px] font-mono text-slate-500 tracking-[0.4em] uppercase">
                                {isGodMode ? 'RESTRICTED_ACCESS_ONLY' : 'Omega Manifestation'}
                            </span>
                        </div>
                        {isSovereign && (
                            <div className="hidden md:flex items-center px-2 py-0.5 ml-3 border border-violet-500/50 bg-violet-950/20 rounded-sm">
                                <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse mr-1.5"></div>
                                <span className="text-[8px] font-bold text-violet-300 tracking-widest uppercase">Jurisdiction: Null-Space</span>
                            </div>
                        )}
                        {isGodMode && (
                             <div className="hidden lg:flex items-center px-2 py-0.5 ml-1 border border-red-500/50 bg-red-950/20 rounded-sm animate-pulse">
                                <span className="text-[8px] font-bold text-red-400 tracking-widest">ACT 14-B VIOLATION ACTIVE</span>
                            </div>
                        )}
                    </div>

                    {/* Controls Deck */}
                    <div className="flex items-center gap-2">
                        {isGodMode && (
                            <div className="flex items-center gap-2 mr-4">
                                <span className="text-[8px] text-slate-600 font-bold">REGULATORY:</span>
                                <span className="text-[9px] text-red-500 font-bold bg-red-950/20 px-1 border border-red-900/50">BYPASSED</span>
                            </div>
                        )}

                        <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

                        {/* CORE SWITCHER */}
                        <button 
                            onClick={toggleAiProvider}
                            className={`cyber-key px-2 py-1 flex items-center gap-1.5 border hover:bg-opacity-20 transition-all ${
                                aiProvider === 'OPENAI' 
                                ? 'text-green-400 border-green-900/50 hover:text-green-300 hover:bg-green-900' 
                                : 'text-cyan-400 border-cyan-900/50 hover:text-cyan-300 hover:bg-cyan-900'
                            }`}
                            title={`Switch Core: Currently ${aiProvider}`}
                        >
                            <BrainCircuitIcon className="w-3 h-3" />
                            <span className="hidden sm:inline text-[9px] font-bold">CORE: {aiProvider}</span>
                        </button>

                        {onInitiateSwarm && (
                            <button onClick={onInitiateSwarm} className="cyber-key px-2 py-1 text-red-400 border-red-900/50 hover:text-red-300" title="Init Swarm">
                                <NetworkIcon className="w-3 h-3 sm:mr-1.5" />
                                <span className="hidden sm:inline text-[9px]">SWARM</span>
                            </button>
                        )}

                        {onAnalyzeSentiment && (
                            <button onClick={onAnalyzeSentiment} className="cyber-key px-2 py-1 text-amber-400 border-amber-900/50 hover:text-amber-300" title="Sentiment Scan">
                                <NewspaperIcon className="w-3 h-3 sm:mr-1.5" />
                                <span className="hidden sm:inline text-[9px]">SCAN</span>
                            </button>
                        )}

                        {onStartTour && (
                            <button onClick={onStartTour} className="cyber-key px-2 py-1 text-cyan-400 border-cyan-900/50 hover:text-cyan-300">
                                <QuestionMarkCircleIcon className="w-3 h-3" />
                            </button>
                        )}

                        {/* Theme Toggle */}
                        <button onClick={toggleTheme} className="cyber-key px-2 py-1 text-slate-400 border-slate-700 hover:text-cyan-300 hover:border-cyan-800" title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
                            {theme === 'dark' ? <SunIcon className="w-3 h-3" /> : <MoonIcon className="w-3 h-3" />}
                        </button>

                        <KeepAwakeToggle />
                        
                        <div className={`w-8 h-8 flex items-center justify-center border rounded-sm ml-1 transition-all ${isGodMode ? 'border-amber-500 bg-amber-900/20 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-slate-700 bg-slate-800'}`}>
                            {isGodMode ? (
                                <BatmanIcon className="h-5 w-5 text-amber-400 animate-pulse" />
                            ) : (
                                <ShieldIcon className="h-4 w-4 text-slate-500" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
