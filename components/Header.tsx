
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
import LiveModeToggle from './LiveModeToggle';
import HyperTemporalClock from './HyperTemporalClock';

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
        isAgentZeroActive,
        setWallpaperVideoSrc, 
        addLog,
        theme,
        toggleTheme,
        coreState
    } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <header className={`border-b z-50 relative transition-colors duration-500 shrink-0 ${isAgentZeroActive ? 'bg-[#000a05] border-emerald-900' : isGodMode ? 'bg-[#0a0800] border-[#b45309]' : 'bg-[#080808] border-[#333]'}`}>
            {/* Decorative Top Line */}
            <div className={`absolute top-0 left-0 w-full h-[1px] ${isAgentZeroActive ? 'bg-emerald-500 shadow-[0_0_10px_emerald]' : isGodMode ? 'bg-amber-500 animate-pulse' : 'bg-gradient-to-r from-transparent via-cyan-500 to-transparent'} opacity-80`}></div>
            
            <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6">
                <div className="flex items-center justify-between h-12 gap-2 lg:gap-4 relative w-full overflow-hidden">
                    {/* Left Zone: Branding Area */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
                        <div className={`p-1 rounded border ${isAgentZeroActive ? 'border-emerald-500 bg-emerald-950/30' : isGodMode ? 'border-amber-500 bg-amber-950/30' : 'border-cyan-900 bg-cyan-950/20'} shadow-[0_0_10px_rgba(0,0,0,0.5)] shrink-0`}>
                            <ArkAngelIcon className={`h-5 w-5 ${isAgentZeroActive ? 'text-emerald-400' : isGodMode ? 'text-amber-400' : 'text-cyan-400'}`}/>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h1 className={`text-base sm:text-lg font-display font-bold tracking-widest leading-none truncate ${isAgentZeroActive ? 'text-emerald-100 glow-text-emerald' : isGodMode ? 'text-amber-100 glow-text-gold' : 'text-slate-100'}`}>
                                {isAgentZeroActive ? 'AGENT_ZERO' : 'ARK ANGEL ALPHA OMEGA'}
                            </h1>
                            <span className="micro-label truncate">
                                {isAgentZeroActive ? 'SOVEREIGN_NODE_PROD' : 'Production_Environment'}
                            </span>
                        </div>
                        {isAgentZeroActive && (
                            <div className="hidden 2xl:flex items-center px-2 py-0.5 border border-emerald-500 bg-emerald-950/20 rounded-sm resonance-pulse whitespace-nowrap shrink-0">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping mr-1.5"></div>
                                <span className="micro-label text-emerald-300 text-[8px]">SURVEILLANCE_ACTIVE</span>
                            </div>
                        )}
                        {isSovereign && !isAgentZeroActive && (
                            <div className="hidden 2xl:flex items-center px-2 py-0.5 border border-violet-500/50 bg-violet-950/20 rounded-sm whitespace-nowrap shrink-0">
                                <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse mr-1.5"></div>
                                <span className="micro-label text-violet-300 text-[8px]">Jurisdiction: Null-Space</span>
                            </div>
                        )}
                    </div>

                    {/* Central Zone: Hyper-Temporal Clock & Live Mode Toggle */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3 shrink-0">
                        <HyperTemporalClock />
                        <LiveModeToggle />
                    </div>

                    {/* Right Zone: Controls Deck */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <div className="hidden sm:flex items-center gap-1.5 mr-1">
                            <span className="micro-label">Spine:</span>
                            <span className="text-[8px] text-green-500 font-bold bg-green-950/20 px-1 border border-green-900/50 rounded-sm">ENCRYPTED</span>
                        </div>

                        <div className="hidden sm:block h-5 w-[1px] bg-white/10 mx-0.5"></div>

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
                            <span className="hidden xl:inline micro-label">CORE: {aiProvider}</span>
                        </button>

                        {onInitiateSwarm && (
                            <button onClick={onInitiateSwarm} className="cyber-key px-2 py-1 text-red-400 border-red-900/50 hover:text-red-300 hidden md:flex items-center" title="Init Swarm">
                                <NetworkIcon className="w-3 h-3 md:mr-1" />
                                <span className="hidden lg:inline micro-label">SWARM</span>
                            </button>
                        )}

                        {onAnalyzeSentiment && (
                            <button onClick={onAnalyzeSentiment} className="cyber-key px-2 py-1 text-amber-400 border-amber-900/50 hover:text-amber-300 hidden md:flex items-center" title="Sentiment Scan">
                                <NewspaperIcon className="w-3 h-3 md:mr-1" />
                                <span className="hidden lg:inline micro-label">SCAN</span>
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
                        
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border rounded-sm ml-0.5 transition-all ${isAgentZeroActive ? 'border-emerald-500 bg-emerald-900/20 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : isGodMode ? 'border-amber-500 bg-amber-900/20 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-slate-700 bg-slate-800'}`}>
                            {isAgentZeroActive ? (
                                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                            ) : isGodMode ? (
                                <BatmanIcon className="h-4 w-4 text-amber-400 animate-pulse" />
                            ) : (
                                <ShieldIcon className="h-3.5 w-3.5 text-slate-500" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
