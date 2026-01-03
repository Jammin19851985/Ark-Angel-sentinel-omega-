
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import MarketWatch from './components/MarketWatch';
import Portfolio from './components/Portfolio';
import SwarmVisualizer from './components/SwarmVisualizer';
import SystemLog from './components/SystemLog';
import HolographicOverlay from './components/HolographicOverlay';
import LiveWallpaper from './components/LiveWallpaper'; 
import AvatarOrb from './components/AvatarOrb';
import AlphaGauge from './components/AlphaGauge';
import CinematicIntro from './components/CinematicIntro';
import NavigationDeck from './components/NavigationDeck';
import ViewManager from './components/ViewManager';

import { TerminalIcon } from './components/icons/TerminalIcon';
import { ShieldIcon } from './components/icons/ShieldIcon';

import { useAppContext } from './contexts/AppContext';
import { sendMessageToSentinelA } from './services/geminiService';
import { Message, ActiveView } from './types';
import { VIEW_SPECIFIC_SUGGESTIONS, INITIAL_SUGGESTIONS } from './constants';

const App: React.FC = () => {
    const { addLog, setIsGodMode, setIsGodModeUnlocked, isGodMode, executeAllPrimeDirectives, killSwitchActive, quantumMetrics } = useAppContext();
    
    const [messages, setMessages] = useState<Message[]>(() => { try { return JSON.parse(localStorage.getItem('archangel_messages') || '[]'); } catch { return []; } });
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<ActiveView>('nexus');
    const [showOverlay, setShowOverlay] = useState(false);
    const [mission, setMission] = useState<string>('INITIATE_SWARM_PROTOCOL --agents 2500 --mode OMEGA');
    const [introComplete, setIntroComplete] = useState(false);
    const hasInitialized = useRef(false);
    const [hasPaidKey, setHasPaidKey] = useState(false);
    const [focusMode, setFocusMode] = useState(false);

    const suggestions = useMemo(() => VIEW_SPECIFIC_SUGGESTIONS[activeView] || INITIAL_SUGGESTIONS, [activeView]);

    useEffect(() => {
        const body = document.body;
        if (isGodMode) body.classList.add('god-mode-active');
        else body.classList.remove('god-mode-active');
    }, [isGodMode]);

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio?.hasSelectedApiKey) {
                const selected = await window.aistudio.hasSelectedApiKey();
                setHasPaidKey(selected);
            }
        };
        checkKey();
    }, []);

    useEffect(() => { localStorage.setItem('archangel_messages', JSON.stringify(messages)); }, [messages]);

    const initialize = useCallback(async () => {
        try {
            if (messages.length === 0) setMessages([{ author: 'sentinel', content: "## ARCHANGEL OMEGA ONLINE." }]);
        } catch { setError(`Initialization decoherence.`); } finally { setIsLoading(false); setShowOverlay(true); }
    }, [messages.length]);

    useEffect(() => {
        if (hasInitialized.current) return;
        if (introComplete) { hasInitialized.current = true; initialize(); }
    }, [introComplete, initialize]);

    const handleSelectKey = async () => {
        if (window.aistudio?.openSelectKey) {
            await window.aistudio.openSelectKey();
            setHasPaidKey(true);
            addLog('SYSTEM', 'Sovereign API Auth acquired.');
        }
    };

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const currentInput = input.trim();
        if (currentInput.includes('godmodeAdam1121#')) {
            setIsGodModeUnlocked(true); setIsGodMode(true);
            addLog('AODE', 'PROTOCOL OVERRIDE: GOD MODE ACTIVE.');
            setMessages(prev => [...prev, { author: 'sentinel', content: "## Ω OVERRIDE ACTIVE" }]);
            setInput(''); return;
        }
        const userMessage: Message = { author: 'user', content: currentInput };
        setInput('');
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        try {
            const { text, sources } = await sendMessageToSentinelA(currentInput);
            setMessages(prev => [...prev, { author: 'sentinel', content: text, sources }]);
        } catch { setError('Command failed.'); } finally { setIsLoading(false); }
    }, [input, isLoading, addLog, setIsGodMode, setIsGodModeUnlocked]);

    const handleTroubleshoot = useCallback(async (msg: string) => {
        addLog('SYSTEM', `Forensic Scanning: ${msg}`); setIsLoading(true);
        try {
            const { text } = await sendMessageToSentinelA(`ERROR_VEC: "${msg}". Resolve.`);
            setMessages(prev => [...prev, { author: 'sentinel', content: `## FORENSIC FIX\n\n${text}` }]);
        } catch { addLog('ERROR', 'Troubleshooter failed.'); } finally { setIsLoading(false); }
    }, [addLog]);

    const handleAddAllSuggestions = useCallback(() => {
        executeAllPrimeDirectives(suggestions);
        setMessages(prev => [...prev, { author: 'user', content: "SYSTEM: Manifest all 100 Sovereign Directives." }]);
        setActiveView('nexus');
    }, [suggestions, executeAllPrimeDirectives]);

    const handleInitiateSwarmProtocol = useCallback(() => {
        executeAllPrimeDirectives(VIEW_SPECIFIC_SUGGESTIONS['sentinel']);
        setMessages(prev => [...prev, { author: 'user', content: "COMMAND: INITIATE_SWARM_PROTOCOL" }]);
        setActiveView('sentinel');
        addLog('SYSTEM', 'SWARM PROTOCOL INITIATED VIA HEADER OVERRIDE');
    }, [executeAllPrimeDirectives, addLog]);
    
    const handleCloseOverlay = useCallback(() => { setShowOverlay(false); addLog('SYSTEM', 'Neural Link Established.'); }, [addLog]);
    const handleSuggestionClick = (suggestion: string) => { setInput(suggestion); setActiveView('sentinel'); };

    const renderAuthScreen = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-20 min-h-0 overflow-hidden">
            <div className="tech-panel p-12 max-w-md text-center">
                <ShieldIcon className="w-16 h-16 text-amber-500 mx-auto mb-6 animate-pulse" />
                <h2 className="text-3xl font-display font-bold text-white mb-4 tracking-widest glow-text-gold">AUTH_REQUIRED</h2>
                <p className="text-slate-400 mb-8 font-mono text-xs uppercase">Sovereign Authority requires Paid API Key for high-fidelity signal execution.</p>
                <button onClick={handleSelectKey} className="cyber-key px-8 py-4 w-full text-amber-400 font-bold hover:text-white transition-colors">AUTHENTICATE</button>
            </div>
        </div>
    );

    const renderMainWorkspace = () => (
        <div className={`flex-1 grid gap-2 p-2 min-h-0 overflow-hidden relative z-10 transition-all duration-500 ${focusMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
            
            <div className={`flex flex-col h-full space-y-2 min-h-0 overflow-hidden ${focusMode ? 'col-span-1' : 'lg:col-span-2'}`}>
                <div className="flex-1 tech-panel flex flex-col min-h-0 relative group border-t-2 border-t-cyan-500/50 overflow-hidden">
                    <div className="absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => setFocusMode(!focusMode)} 
                            className={`px-2 py-0.5 rounded-sm text-[8px] font-bold font-mono tracking-widest border transition-colors ${focusMode ? 'bg-amber-900/50 border-amber-500 text-amber-400' : 'bg-black/60 border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500'}`}
                        >
                            {focusMode ? 'COLLAPSE' : 'EXPAND'}
                        </button>
                    </div>

                    <ViewManager 
                        activeView={activeView}
                        messages={messages}
                        input={input}
                        setInput={setInput}
                        isLoading={isLoading}
                        error={error}
                        handleSendMessage={handleSendMessage}
                        handleTroubleshoot={handleTroubleshoot}
                        suggestions={suggestions}
                        onAddAllSuggestions={handleAddAllSuggestions}
                        mission={mission}
                        setMission={setMission}
                    />
                </div>
                
                {!focusMode && activeView !== 'sentinel' && (
                    <div className="h-8 tech-panel flex items-center px-2 space-x-2 overflow-x-auto custom-scrollbar flex-shrink-0 bg-black/40 border border-slate-800 min-h-0">
                        <TerminalIcon className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />
                        {suggestions.map((suggestion, idx) => (
                            <button key={idx} onClick={() => handleSuggestionClick(suggestion)} className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 hover:text-cyan-400 border border-transparent hover:border-cyan-900/50 rounded transition-colors whitespace-nowrap">
                                &gt; {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            {!focusMode && (
                <div className="flex flex-col gap-2 h-full min-h-0 overflow-hidden animate-fade-in">
                    <div className="tech-panel flex-1 flex flex-col min-h-0 overflow-hidden bg-black/40 border border-slate-800">
                        <div className="tech-header flex-shrink-0 py-1.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1 h-1 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]"></span>
                                Live_Substrate
                            </span>
                            <div className="flex gap-1">
                                <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-2 min-h-0">
                            <div className="flex-shrink-0 min-h-[180px]"><MarketWatch id="market-watch" /></div>
                            <div className="flex-shrink-0 min-h-[180px]"><Portfolio id="portfolio-overview" /></div>
                            <div className="flex-shrink-0 min-h-[150px]"><AlphaGauge id="alpha-gauge" /></div>
                            <div className="flex-shrink-0 min-h-[180px]"><SwarmVisualizer id="swarm-visualizer" /></div>
                        </div>
                    </div>
                    <div className="h-40 tech-panel overflow-hidden bg-black/40 flex-shrink-0 border border-slate-800 min-h-0">
                        <SystemLog id="system-log" />
                    </div>
                </div>
            )}
        </div>
    );

    if (!introComplete) return <CinematicIntro onComplete={() => setIntroComplete(true)} />;

    return (
        <div className={`h-screen w-screen flex flex-col font-sans relative overflow-hidden bg-[#020203] transition-colors duration-1000 ${isGodMode ? 'god-mode-active' : ''}`}>
            <div className="absolute inset-0 z-0 tech-grid-bg opacity-30 pointer-events-none"></div>
            <LiveWallpaper />
            <HolographicOverlay isVisible={showOverlay} onClose={handleCloseOverlay} />
            
            <div className="h-5 flex items-center justify-between px-3 text-[9px] font-mono border-b z-30 transition-colors shrink-0 bg-[#050508] border-[#1e293b] text-slate-500 min-h-0">
                <div className="flex gap-4 items-center">
                   <span className="flex items-center gap-1.5"><span className={`w-1 h-1 rounded-full ${killSwitchActive ? 'bg-white' : 'bg-green-500 shadow-[0_0_5px_#22c55e]'}`}></span> SPINE: {killSwitchActive ? 'HALTED' : 'STABLE'}</span>
                   <span className="hidden sm:inline uppercase">Coherence: {(quantumMetrics?.qubitCoherence || 0).toFixed(2)}ns</span>
                   <span className="hidden md:inline uppercase">TES: {(quantumMetrics?.tesScore || 0).toFixed(2)}</span>
                </div>
                <div className="flex gap-4 items-center uppercase">
                   <span className={`font-bold ${isGodMode ? 'text-amber-500 glow-text-gold' : 'text-slate-600'}`}>{isGodMode ? 'GOD_MODE_ACTIVE' : 'UPB-1_GATED'}</span>
                   <span>Ω GEN: {(quantumMetrics?.gpGenerations || 0).toLocaleString()}</span>
                </div>
            </div>

            <div className="shrink-0 z-30">
                <Header onAnalyzeSentiment={()=>{}} onStartTour={()=>{}} onInitiateSwarm={handleInitiateSwarmProtocol} />
            </div>
            
            <div className="shrink-0 z-30">
                <NavigationDeck 
                    activeView={activeView} 
                    setActiveView={setActiveView} 
                    focusMode={focusMode}
                    setFocusMode={setFocusMode}
                />
            </div>

            <div className="flex-1 flex flex-col relative z-20 min-h-0 overflow-hidden">
                {!hasPaidKey ? renderAuthScreen() : renderMainWorkspace()}
            </div>
            
            <div className="absolute top-24 right-8 z-10 pointer-events-none hidden xl:block opacity-30 mix-blend-screen scale-75"><AvatarOrb /></div>
        </div>
    );
};

export default App;
