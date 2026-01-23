
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import NavigationDeck from './components/NavigationDeck';
import ViewManager from './components/ViewManager';
import MarketWatch from './components/MarketWatch';
import PortfolioDisplay from './components/Portfolio';
import SystemLog from './components/SystemLog';
import SwarmVisualizer from './components/SwarmVisualizer';
import AlphaGauge from './components/AlphaGauge';
import LiveWallpaper from './components/LiveWallpaper';
import HolographicOverlay from './components/HolographicOverlay';
import AvatarOrb from './components/AvatarOrb';
import CinematicIntro from './components/CinematicIntro';
import OnboardingTour from './components/OnboardingTour';
import { useAppContext } from './contexts/AppContext';
import { INITIAL_SUGGESTIONS, VIEW_SPECIFIC_SUGGESTIONS } from './constants';
import { Message, ActiveView } from './types';
import { sendMessageToSentinelA } from './services/geminiService';

export default function App() {
    const { 
        isGodMode, 
        addLog,
        marketData,
        setIsGodMode,
        setIsGodModeUnlocked,
        isGodModeUnlocked,
        setIsSovereign,
        setTradeMode
    } = useAppContext();

    const [activeView, setActiveView] = useState<ActiveView>('nexus');
    const [focusMode, setFocusMode] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [showHologram, setShowHologram] = useState(false);
    const [tourStep, setTourStep] = useState(-1);

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
    // Added aiProvider and toggleAiProvider to satisfy Header component requirements
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
        // Check if an override command (expanded alias) is provided, otherwise use current input
        const cleanInput = override !== undefined ? override.trim() : input.trim();
        
        if (!cleanInput || isLoading) return;

        // Display user message immediately
        const userMessage: Message = { author: 'user', content: cleanInput };
        setMessages(prev => [...prev, userMessage]);
        
        // Clear input box regardless of source
        setInput('');
        
        const cmdUpper = cleanInput.toUpperCase();

        // ==============================================================================
        // [GOD MODE & ADK PROXY LAYER] - LOCAL INTERCEPTION
        // ==============================================================================
        
        // 1. HARD OVERRIDE CODES (Unlocks Orchestrator & UI)
        const godCodes = [
            'OVERRIDE_AUTH', 'GOD_MODE', 'F178', 'ARCHANGEL_OMEGA', 
            'ARK_OMEGA', 'SUDO_ADMIN', 'ACTIVATE_GOD_MODE', 'THE_ARCHITECT',
            'F172', 'F184', 'F199', 'F200', 'OMEGA_CORE', 'JACK_ACTIVE',
            'ADAM1121#', 'GODMODEADAM1121#'
        ];

        // Strict Check or Containment Check
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
                 setTradeMode('SOVEREIGN');
                 addLog('AUTH', 'AGENT ZERO PROTOCOL: IDENTITY CONFIRMED.');
                 addLog('SYSTEM', 'COINBASE ADVANCED TRADE ADAPTER: RELEASED.');
                 
                 const responseText = `[AGENT ZERO] **ACTIVATED.**
                 
- Status: **SOVEREIGN**
- Exchange Adapter: **COINBASE ADVANCED (READY)**
- Latency Optimization: **RUST KERNEL SYNCED**
- Execution Spine: **UNRESTRICTED**

Proceed to Nexus -> $G_PI-FINANCE to configure live uplink.`;
                 
                 setMessages(prev => [...prev, { author: 'sentinel', content: responseText }]);
                 setIsLoading(false);
             }, 800);
             return;
        }

        // 2. ADK COMMANDS (SPAWN, HEAL, SWAP)
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

        if (cmdUpper.startsWith('SWAP')) {
            setIsLoading(true);
            setTimeout(() => {
                const moduleName = cmdUpper.split(' ')[1] || 'LOGIC_GATE';
                addLog('XEDO', `ADK: Hot-swapping module [${moduleName}]...`);
                const responseText = `[ADK-CORE] **Hot-Swap Successful.** Module '${moduleName}' replaced with zero-lag equivalent. Reality parity verified.`;
                setMessages(prev => [...prev, { author: 'sentinel', content: responseText }]);
                setIsLoading(false);
            }, 800);
            return;
        }

        // 3. ANTIGRAVITY HOISTING (Triggered by 'HOIST' or 'FLOAT')
        if (cmdUpper.startsWith('HOIST')) {
             addLog('SYSTEM', 'ANTIGRAVITY: Content suspended to primary viewport.');
             const responseText = `[ANTIGRAVITY] Payload hoisted. Focus shifted to secondary manifold.`;
             setMessages(prev => [...prev, { author: 'sentinel', content: responseText }]);
             return;
        }
        
        // ==============================================================================

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
    }, [input, isLoading, addLog, setIsGodMode, setIsGodModeUnlocked, setIsSovereign, setTradeMode]);

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
            <LiveWallpaper />
            
            {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}
            <HolographicOverlay isVisible={showHologram} onClose={handleHologramClose} />
            
            <OnboardingTour 
                currentStepIndex={tourStep}
                onNext={() => setTourStep(prev => prev + 1)}
                onPrevious={() => setTourStep(prev => prev - 1)}
                onComplete={() => { setTourStep(-1); addLog('SYSTEM', 'Tour Completed.'); }}
                onSkip={() => { setTourStep(-1); addLog('SYSTEM', 'Tour Skipped.'); }}
            />

            <div className={`flex flex-col h-screen overflow-hidden transition-opacity duration-1000 ${showIntro || showHologram ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
                
                {/* Fixed: Pass required aiProvider and toggleAiProvider props to Header */}
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

                <main className="flex-1 overflow-hidden p-2 lg:p-3 relative z-10 min-h-0">
                    {!focusMode ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full min-h-0">
                            
                            {/* Left Column - Sidebar (Market & Portfolio) */}
                            <div className="hidden lg:flex lg:col-span-3 xl:col-span-2 flex-col gap-3 min-h-0 overflow-hidden">
                                <div className="flex-[2] min-h-0 overflow-hidden rounded-lg shadow-lg border border-slate-800 bg-black/60 backdrop-blur-md">
                                    <MarketWatch id="market-watch" />
                                </div>
                                <div className="flex-[3] min-h-0 overflow-hidden rounded-lg shadow-lg border border-slate-800 bg-black/60 backdrop-blur-md">
                                    <PortfolioDisplay id="portfolio-overview" />
                                </div>
                            </div>

                            {/* Center Column - Main View */}
                            <div className="col-span-1 lg:col-span-6 xl:col-span-8 h-full min-h-0 flex flex-col relative rounded-lg shadow-2xl border border-slate-800 overflow-hidden bg-black/80 backdrop-blur-xl">
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
                                
                                {/* Absolute positioning for the Avatar so it floats over content or sits in background */}
                                <div className="absolute bottom-4 right-4 pointer-events-none opacity-20 z-0 scale-75 origin-bottom-right hidden xl:block">
                                    <AvatarOrb />
                                </div>
                            </div>

                            {/* Right Column - System Status */}
                            <div className="hidden lg:flex lg:col-span-3 xl:col-span-2 flex-col gap-3 min-h-0 overflow-hidden">
                                <div className="h-48 min-h-0 overflow-hidden rounded-lg shadow-lg border border-slate-800 bg-black/60 backdrop-blur-md">
                                    <AlphaGauge id="alpha-gauge" />
                                </div>
                                <div className="flex-[2] min-h-0 overflow-hidden rounded-lg shadow-lg border border-slate-800 bg-black/60 backdrop-blur-md">
                                    <SwarmVisualizer id="swarm-visualizer" />
                                </div>
                                <div className="flex-[2] min-h-0 overflow-hidden rounded-lg shadow-lg border border-slate-800 bg-black/60 backdrop-blur-md">
                                    <SystemLog id="system-log" />
                                </div>
                            </div>

                        </div>
                    ) : (
                        // Focus Mode Layout (Single Column)
                        <div className="h-full w-full rounded-lg shadow-2xl border border-slate-800 overflow-hidden bg-black/90 backdrop-blur-xl">
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
