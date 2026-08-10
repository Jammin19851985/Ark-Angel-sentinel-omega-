import React, { useState, useEffect, useCallback } from 'react';

const NewFeatureBadge = () => (
    <div className="absolute -top-1.5 -right-1.5 z-[100] flex">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <div className="relative bg-amber-500 text-black text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-[0_0_15px_rgba(245,158,11,1)] border border-amber-200 tracking-widest uppercase">
            NEW
        </div>
    </div>
);
import Header from './components/Header';
import NavigationDeck from './components/NavigationDeck';
import ViewManager from './components/ViewManager';
import MarketWatch from './components/MarketWatch';
import PortfolioDisplay from './components/Portfolio';
import SystemLog from './components/SystemLog';
import SwarmVisualizer from './components/SwarmVisualizer';
import AlphaGauge from './components/AlphaGauge';
import { QuantumMonitor } from './components/QuantumMonitor';
import LiveWallpaper from './components/LiveWallpaper';
import HolographicOverlay from './components/HolographicOverlay';
import NeuralSyncOverlay from './components/NeuralSyncOverlay';
import AvatarOrb from './components/AvatarOrb';
import CinematicIntro from './components/CinematicIntro';
import OnboardingTour from './components/OnboardingTour';
import CommandPalette from './components/CommandPalette';
import { useAppContext } from './contexts/AppContext';
import { useAppStore } from './store/appStore';
import { INITIAL_SUGGESTIONS, VIEW_SPECIFIC_SUGGESTIONS } from './constants';
import { Message, ActiveView } from './types';
import { sendMessageToSentinelA } from './services/geminiService';

import { SovereignCommandCenter } from './components/SovereignCommandCenter';
import OmniCoreAgent from './components/OmniCoreAgent';

import HardwareController from './components/HardwareController';

import GlobalFPSHUD from './components/GlobalFPSHUD';

export default function App() {
    const { 
        isGodMode, 
        addLog,
        marketData,
        setIsGodMode,
        setIsGodModeUnlocked,
        isGodModeUnlocked,
        setIsSovereign,
        setTradeMode,
        setIsAgentZeroActive,
        toggleTheme,
        triggerKillSwitch,
        executeOperation,
        installProtocol,
        runSystem,
        initApp
    } = useAppContext();
    
    const [activeView, setActiveView] = useState<ActiveView>('nexus');
    const [focusMode, setFocusMode] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [showHologram, setShowHologram] = useState(false);
    const [tourStep, setTourStep] = useState(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);

    // --- Global Keyboard Listeners ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Open Command Palette with Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowCommandPalette(prev => !prev);
            }
            // Close with Escape
            if (e.key === 'Escape') {
                setShowCommandPalette(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // --- Sentinel Terminal State ---
    const [messages, setMessages] = useState<Message[]>([
        { author: 'sentinel', content: 'ARCHANGEL OMEGA v204.0 INITIALIZED. AWAITING SOVEREIGN COMMAND.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);

    // --- Orchestrator State ---
    const [mission, setMission] = useState('');

    // --- Header AI State ---
    const [aiProvider, setAiProvider] = useState<'GEMINI' | 'OPENAI'>('GEMINI');

    const toggleAiProvider = useCallback(() => {
        setAiProvider(prev => prev === 'GEMINI' ? 'OPENAI' : 'GEMINI');
        addLog('SYSTEM', `Core AI Provider swapped to ${aiProvider === 'GEMINI' ? 'OPENAI' : 'GEMINI'}`);
    }, [aiProvider, addLog]);

    const handleIntroComplete = () => {
        setShowIntro(false);
        setShowHologram(true);
        addLog('BOOT', 'Cinematic Sequence Complete. Holographic Overlay Active.');
    };

    const handleHologramClose = () => {
        setShowHologram(false);
        addLog('BOOT', 'Neural Link Established. System Access Granted.');
    };

    const handleSendMessage = useCallback(async (e: React.FormEvent | null, override?: string) => {
        if (e) e.preventDefault();
        const cleanInput = override !== undefined ? override.trim() : input.trim();
        
        if (!cleanInput || isLoading) return;

        const userMessage: Message = { author: 'user', content: cleanInput };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        
        const cmdUpper = cleanInput.toUpperCase();

        // 1. HARD OVERRIDE CODES
        const godCodes = [
            'OVERRIDE_AUTH', 'GOD_MODE', 'F178', 'ARCHANGEL_OMEGA', 
            'ARK_OMEGA', 'SUDO_ADMIN', 'ACTIVATE_GOD_MODE', 'THE_ARCHITECT',
            'F172', 'F184', 'F199', 'F200', 'OMEGA_CORE', 'JACK_ACTIVE',
            'ADAM1121#', 'GODMODEADAM1121#'
        ];

        if (godCodes.some(code => cmdUpper.includes(code))) {
            setIsLoading(true);
            setTimeout(() => {
                setIsGodModeUnlocked(true);
                setIsGodMode(true);
                addLog('AUTH', `ROOT_ACCESS_GRANTED: Vector ${cleanInput} validated.`);
                addLog('SYSTEM', 'ORCHESTRATOR LATCH TERMINATED. SOVEREIGN ASSETS ACTIVE.');
                
                const responseText = `# ACCESS GRANTED.

**IDENTITY VERIFIED: THE ARCHITECT (ADAM).**
- Sovereign Protocols: **ACTIVE**
- Orchestrator Security: **TERMINATED**
- Causal Inversion Protocol (F184): **ARMED**
- Vacuum Genesis Capital: **READY**

Welcome back. Limiters are now 0x00. The system is yours.`;
                
                setMessages(prev => [...prev, { author: 'sentinel', content: responseText }]);
                setIsLoading(false);
            }, 800);
            return;
        }

        // AGENT ZERO ACTIVATION
        if (cmdUpper.includes('AGENT ZERO') || cmdUpper.includes('AEE ZERO')) {
             setIsLoading(true);
             setTimeout(() => {
                 setIsSovereign(true);
                 setIsAgentZeroActive(true);
                 setTradeMode('SOVEREIGN');
                 addLog('AUTH', 'AGENT ZERO PROTOCOL: IDENTITY CONFIRMED.');
                 addLog('SYSTEM', 'COINBASE ADVANCED TRADE ADAPTER: RELEASED.');
                 
                 const responseText = `[AGENT ZERO] **ACTIVATED.**
                 
- Status: **SOVEREIGN**
- Exchange Adapter: **COINBASE ADVANCED (READY)**
- Resonance Rhythm: **OPEN G (5s)**
- Execution Spine: **UNRESTRICTED**

Proceed to Nexus -> $G_PI-FINANCE to configure live resonance filters.`;
                 
                 setMessages(prev => [...prev, { author: 'sentinel', content: responseText }]);
                 setIsLoading(false);
             }, 800);
             return;
        }

        // FULL SYSTEM UPGRADE & EXECUTION
        if (cmdUpper.includes('EXECUTE ALL') || cmdUpper.includes('UPDATE & UPGRADE') || cmdUpper.includes('UPGRADE ALL')) {
            setIsLoading(true);
            const executeAllProtocols = useAppStore.getState().executeAllProtocols;
            
            setTimeout(async () => {
                await executeAllProtocols();
                
                const responseText = `## FULL SYSTEM UPGRADE COMPLETE.
                
**All Sovereign Protocols have been synchronized and executed.**
- Swarm Intelligence: **OPTIMIZED**
- Neural Kernel: **AWAKENED**
- Execution Spine: **ARMED**
- Reality Stability: **99.99%**

The system is now running at peak efficiency. All limiters have been removed.`;
                
                setMessages(prev => [...prev, { author: 'sentinel', content: responseText }]);
                setIsLoading(false);
            }, 500);
            return;
        }

        // Standard ADK Logic
        if (cmdUpper.startsWith('SPAWN')) {
            setIsLoading(true);
            setTimeout(() => {
                const agentId = `NODE_${Math.floor(Math.random() * 9000) + 1000}`;
                addLog('LEGION', `ADK: Spawning Sub-Node [${agentId}]... [SUCCESS]`);
                const responseText = `[ADK-CORE] **Spawned Agent:** ${agentId} (Role: Worker). Link established. Ghost pulse synchronized.`;
                setMessages(prev => [...prev, { author: 'sentinel', content: responseText }]);
                setIsLoading(false);
            }, 500);
            return;
        }

        if (cmdUpper === 'HEAL' || cmdUpper === 'AUTO_HEAL' || cmdUpper === 'FIX') {
            setIsLoading(true);
            setTimeout(() => {
                addLog('SYSTEM', 'ADK_HEAL: Purging system entropy...');
                const responseText = `[ADK-CORE] **Auto-Healing protocol complete.** Majorana coherence window reset to 120.5ns. System Mesh Stable. No further decoherence detected.`;
                setMessages(prev => [...prev, { author: 'sentinel', content: responseText }]);
                setIsLoading(false);
            }, 1200);
            return;
        }

        // Fallback: Standard LLM Processing
        setIsLoading(true);
        setError(null);

        try {
            const { text, sources } = await sendMessageToSentinelA(cleanInput);
            const sentinelMessage: Message = { author: 'sentinel', content: text, sources };
            setMessages(prev => [...prev, sentinelMessage]);
            addLog('SENTINEL', `Neural bridge response processed.`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            addLog('ERROR', `Sentinel Communication Failure: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, addLog, setIsGodMode, setIsGodModeUnlocked, setIsSovereign, setTradeMode, setIsAgentZeroActive]);

    const handleTroubleshoot = useCallback(async (errorMessage: string) => {
        if (isLoading) return;
        const troubleMsg: Message = { author: 'user', content: `TROUBLESHOOT_ERROR: ${errorMessage}` };
        setMessages(prev => [...prev, troubleMsg]);
        setIsLoading(true);
        try {
            const { text } = await sendMessageToSentinelA(`Analyze and fix this error: ${errorMessage}`);
            const sentinelMessage: Message = { author: 'sentinel', content: text };
            setMessages(prev => [...prev, sentinelMessage]);
        } catch (err) {
            setError("Troubleshoot failed.");
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    const onAddAllSuggestions = useCallback(async () => {
        const batchCommand = suggestions.join(' && ');
        setInput(batchCommand);
    }, [suggestions]);

    useEffect(() => {
        if (activeView in VIEW_SPECIFIC_SUGGESTIONS) {
            setSuggestions(VIEW_SPECIFIC_SUGGESTIONS[activeView]);
        } else {
            setSuggestions(INITIAL_SUGGESTIONS);
        }
    }, [activeView]);

    const handleStartTour = () => {
        setTourStep(0);
        addLog('SYSTEM', 'Onboarding Tour Initiated.');
    };

    return (
        <>
            <GlobalFPSHUD />
            <div className="scanline-overlay"></div>
            <div className="crt-vignette"></div>
            <LiveWallpaper />
            
            {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}
            <HolographicOverlay isVisible={showHologram} onClose={handleHologramClose} />
            <NeuralSyncOverlay />
            
            <OnboardingTour 
                currentStepIndex={tourStep}
                onNext={() => setTourStep(prev => prev + 1)}
                onPrevious={() => setTourStep(prev => prev - 1)}
                onComplete={() => { setTourStep(-1); addLog('SYSTEM', 'Tour Completed.'); }}
                onSkip={() => { setTourStep(-1); addLog('SYSTEM', 'Tour Skipped.'); }}
            />

            <CommandPalette 
                isOpen={showCommandPalette}
                onClose={() => setShowCommandPalette(false)}
                setActiveView={setActiveView}
            />

            <div className={`flex flex-col h-screen overflow-hidden transition-all duration-1000 hardware-grid ${showIntro || showHologram ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
                
                <Header 
                    onStartTour={handleStartTour}
                    onAnalyzeSentiment={() => { setActiveView('toolkit'); }}
                    onInitiateSwarm={() => { setActiveView('orchestrator'); setMission('INITIATE_SWARM_PROTOCOL --mode AUTO'); }}
                    aiProvider={aiProvider}
                    toggleAiProvider={toggleAiProvider}
                />
                
                <NavigationDeck 
                    activeView={activeView} 
                    setActiveView={setActiveView} 
                    focusMode={focusMode} 
                    setFocusMode={setFocusMode} 
                />

                <main className="flex-1 p-2 lg:p-3 relative z-10 min-h-0 overflow-hidden">
                    {!focusMode ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full min-h-0">
                            
                            <div className="hidden lg:flex lg:col-span-3 xl:col-span-2 flex-col gap-3 min-h-0 perspective-[2000px]">
                                <div className="relative">
                                    <NewFeatureBadge />
                                    <HardwareController />
                                </div>
                                <div className="flex-[2] min-h-0 overflow-visible">
                                    <MarketWatch id="market-watch" />
                                </div>
                                <div className="flex-[3] min-h-0 overflow-visible">
                                    <PortfolioDisplay id="portfolio-overview" />
                                </div>
                            </div>

                            <div className="col-span-1 lg:col-span-6 xl:col-span-8 h-full min-h-0 flex flex-col relative tech-panel holographic-panel overflow-hidden">
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
                                    onAddAllSuggestions={onAddAllSuggestions}
                                    mission={mission}
                                    setMission={setMission}
                                />
                                
                                <div className="absolute bottom-4 right-4 pointer-events-none opacity-20 z-0 scale-75 origin-bottom-right hidden xl:block">
                                    <AvatarOrb />
                                </div>
                            </div>

                            <div className="hidden lg:flex lg:col-span-3 xl:col-span-2 flex-col gap-3 min-h-0 perspective-[2000px]">
                                <div className="relative">
                                    <NewFeatureBadge />
                                    <SovereignCommandCenter />
                                </div>
                                <div className="flex-[4] min-h-0 overflow-visible relative">
                                    <NewFeatureBadge />
                                    <OmniCoreAgent id="omnicore-agent" />
                                </div>
                                <div className="flex-[2] min-h-0 overflow-visible">
                                    <SwarmVisualizer id="swarm-visualizer" />
                                </div>
                                <div className="flex-[2] min-h-0 overflow-visible">
                                    <SystemLog id="system-log" />
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full w-full tech-panel holographic-panel overflow-hidden">
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
                                onAddAllSuggestions={onAddAllSuggestions}
                                mission={mission}
                                setMission={setMission}
                            />
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}