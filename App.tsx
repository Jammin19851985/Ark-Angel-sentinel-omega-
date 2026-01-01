
import React, { useState, useCallback, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import Header from './components/Header';
import MarketWatch from './components/MarketWatch';
import Portfolio from './components/Portfolio';
import SwarmVisualizer from './components/SwarmVisualizer';
import SystemLog from './components/SystemLog';
import HolographicOverlay from './components/HolographicOverlay';
import OnboardingTour from './components/OnboardingTour'; 
import LiveWallpaper from './components/LiveWallpaper'; 
import AvatarOrb from './components/AvatarOrb';
import Loader from './components/Loader';
import AlphaGauge from './components/AlphaGauge';
import CinematicIntro from './components/CinematicIntro';

// Icons
import { TerminalIcon } from './components/icons/TerminalIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { ChartBarIcon } from './components/icons/ChartBarIcon';
import { NetworkIcon } from './components/icons/NetworkIcon';
import { ChartPieIcon } from './components/icons/ChartPieIcon';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { SonarIcon } from './components/icons/SonarIcon';
import { QuantumIcon } from './components/icons/QuantumIcon';
import { ShieldIcon } from './components/icons/ShieldIcon';
import { BeakerIcon } from './components/icons/BeakerIcon';

// Context & Utils
import { useAppContext } from './contexts/AppContext';
import { sendMessageToSentinelA } from './services/geminiService';
import { Message, ActiveView } from './types';

// --- LAZY LOADED MODULES ---
const SentinelTerminal = lazy(() => import('./components/SentinelTerminal'));
const AIToolkit = lazy(() => import('./components/AIToolkit'));
const Backtester = lazy(() => import('./components/Backtester'));
const AgentOrchestrator = lazy(() => import('./components/AgentOrchestrator'));
const Analytics = lazy(() => import('./components/Analytics'));
const Intel = lazy(() => import('./components/Intel'));
const Sonar = lazy(() => import('./components/Sonar'));
const Nexus = lazy(() => import('./components/Nexus'));
const PaperTerminal = lazy(() => import('./components/PaperTerminal'));

const VIEW_SPECIFIC_SUGGESTIONS: Record<ActiveView, string[]> = {
    nexus: ["Quantum Entropy Trade Timer", "Entangled Correlation Fracture Detector", "SICO Singly Indivisible Composite Orders", "Temporal Drift Nullifier", "MLEM Hash Verifier", "System Health Check", "Toggle Reality Corrector"],
    sentinel: ["INITIATE_SWARM_PROTOCOL", "RUN_DIAGNOSTICS", "SYSTEM_STATUS", "VERIFY_INTEGRITY", "OVERRIDE_AUTH", "LIST_ACTIVE_AGENTS", "PURGE_CACHE"],
    orchestrator: ["DEPLOY_LEGION_ALPHA", "OPTIMIZE_HIVE_MIND", "EXECUTE_COMPLEX_ARBITRAGE", "INITIATE_SWARM_PROTOCOL --agents 2500", "MONITOR_SWARM_HEALTH"],
    toolkit: ["GENERATE_IMAGE --prompt 'Cyberpunk Market'", "ANALYZE_SENTIMENT --symbol BTC", "AUDIT_CODE --lang Python", "RAG_QUERY 'Quantum Finance'", "START_LIVE_AUDIO"],
    backtester: ["RUN_BACKTEST --strategy tri_arb", "OPTIMIZE_PARAMETERS --metric sharpe", "SIMULATE_BLACK_SWAN", "EXPORT_EQUITY_CURVE", "ANALYZE_DRAWDOWN"],
    analytics: ["PREDICT_PRICE --symbol BTC", "ANALYZE_VOLATILITY", "CALCULATE_KELLY_CRITERION", "SHOW_CORRELATION_MATRIX", "FORECAST_TREND"],
    intel: ["SEARCH_PROTOCOL --id F172", "DECRYPT_CODEX", "LIST_OMEGA_PROTOCOLS", "SCAN_NEWS_FEED", "VERIFY_PROTOCOL_HASH"],
    sonar: ["SCAN_THREATS --region GLOBAL", "ANALYZE_SIGNAL --id LATEST", "FILTER_NOISE --threshold 0.8", "QUANTUM_WAVE_COLLAPSE", "DETECT_ANOMALIES"],
    paper_terminal: ["PAPER_BUY BTC 1.0", "PAPER_SELL ETH 10.0", "RESET_PAPER_BALANCE", "SIMULATE_FILL_DELAY", "VIEW_PAPER_HISTORY"]
};

const INITIAL_SUGGESTIONS = VIEW_SPECIFIC_SUGGESTIONS.nexus;

const App: React.FC = () => {
    const { addLog, setIsGodMode, setIsGodModeUnlocked, isGodMode, executeAllPrimeDirectives, killSwitchActive, quantumMetrics } = useAppContext();
    const [messages, setMessages] = useState<Message[]>(() => { try { return JSON.parse(localStorage.getItem('archangel_messages') || '[]'); } catch { return []; } });
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<ActiveView>('nexus');
    const [showOverlay, setShowOverlay] = useState(false);
    const [isHolographicEngaged, setIsHolographicEngaged] = useState(false);
    const [mission, setMission] = useState<string>('INITIATE_SWARM_PROTOCOL --agents 2500 --mode OMEGA');
    const [introComplete, setIntroComplete] = useState(false);
    const hasInitialized = useRef(false);
    const [showOnboardingTour, setShowOnboardingTour] = useState(false);
    const [currentTourStepIndex, setCurrentTourStepIndex] = useState(-1);
    const [hasPaidKey, setHasPaidKey] = useState(false);

    const suggestions = useMemo(() => VIEW_SPECIFIC_SUGGESTIONS[activeView] || INITIAL_SUGGESTIONS, [activeView]);

    useEffect(() => {
        const body = document.body;
        // God Mode class handling handled via context, but we ensure class list sync here
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

    const handleSelectKey = async () => {
        if (window.aistudio?.openSelectKey) {
            await window.aistudio.openSelectKey();
            setHasPaidKey(true);
            addLog('SYSTEM', 'Sovereign API Auth acquired.');
        }
    };

    useEffect(() => {
        const completed = localStorage.getItem('archangel_onboarding_completed');
        if (completed !== 'true') setShowOnboardingTour(true);
        else setShowOnboardingTour(false);
    }, []);

    const startTour = useCallback(() => { setShowOnboardingTour(true); setActiveView('sentinel'); setTimeout(() => setCurrentTourStepIndex(0), 100); }, []);
    const skipTour = useCallback(() => { setShowOnboardingTour(false); setCurrentTourStepIndex(-1); localStorage.setItem('archangel_onboarding_completed', 'true'); }, []);
    const completeTour = useCallback(() => { setShowOnboardingTour(false); setCurrentTourStepIndex(-1); localStorage.setItem('archangel_onboarding_completed', 'true'); }, []);

    useEffect(() => { localStorage.setItem('archangel_messages', JSON.stringify(messages)); }, [messages]);

    const initialize = useCallback(async () => {
        try {
            if (messages.length === 0) setMessages([{ author: 'sentinel', content: "## ARCHANGEL OMEGA ONLINE.\n\n>> ADMIN ACCESS: GRANTED.\n>> ZERO ERROR PROTOCOL: ENGAGED.\n>> SCOPE: 100,000xBaseline." }]);
        } catch { setError(`Initialization decoherence.`); } finally { setIsLoading(false); setShowOverlay(true); }
    }, [messages.length]);

    useEffect(() => {
        if (hasInitialized.current) return;
        if (introComplete) { hasInitialized.current = true; initialize(); }
    }, [introComplete, initialize]);

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const currentInput = input.trim();
        if (currentInput.includes('godmodeAdam1121#')) {
            setIsGodModeUnlocked(true); setIsGodMode(true);
            addLog('AODE', 'PROTOCOL OVERRIDE: GOD MODE ACTIVE.');
            setMessages(prev => [...prev, { author: 'sentinel', content: "## Ω OVERRIDE ACTIVE\n\nGod Mode manifest. Sovereign limits removed." }]);
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
    
    const handleCloseOverlay = useCallback(() => { setShowOverlay(false); setIsHolographicEngaged(true); addLog('SYSTEM', 'Interface engaged.'); }, [addLog]);
    const handleSuggestionClick = (suggestion: string) => { setInput(suggestion); setActiveView('sentinel'); };

    // --- 3D Cyber Chip Key Component ---
    const CyberKey: React.FC<{view: ActiveView, label: string, icon: React.ReactNode, id: string}> = ({ view, label, icon, id }) => {
        const isActive = activeView === view;
        return (
            <button 
                id={id}
                onClick={() => setActiveView(view)}
                className={`cyber-key flex items-center justify-center space-x-2 px-3 py-3 w-full lg:w-auto flex-1 ${isActive ? 'active' : ''}`}
            >
                <div className={`p-1 rounded ${isActive ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-500'}`}>{icon}</div>
                <span className="hidden xl:inline">{label}</span>
            </button>
        );
    };

    const renderMainContent = () => {
        if (!hasPaidKey) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-20">
                    <div className="cyber-chip p-12 max-w-md text-center cyber-chip-screws">
                        <ShieldIcon className="w-16 h-16 text-amber-500 mx-auto mb-6 animate-pulse" />
                        <h2 className="text-3xl font-display font-bold text-white mb-4 tracking-widest glow-text-gold">AUTH_REQUIRED</h2>
                        <p className="text-slate-400 mb-8 font-mono text-xs">Sovereign Authority requires Paid API Key for high-fidelity signal execution.</p>
                        <button onClick={handleSelectKey} className="cyber-key px-8 py-4 w-full text-amber-400 font-bold">AUTHENTICATE</button>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-full overflow-hidden">
                <div className="lg:col-span-2 flex flex-col h-full space-y-4 min-h-0">
                    <div className="flex-1 flex flex-col min-h-0 relative cyber-chip cyber-chip-screws">
                        <div className="absolute inset-0 bg-black/50 z-0"></div> {/* Darken background */}
                        <div className="relative z-10 h-full overflow-hidden flex flex-col">
                            <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center"><Loader /><span className="text-xs font-mono text-cyan-500 ml-2">LOADING_MODULE...</span></div>}>
                                {activeView === 'sonar' && <Sonar id="sonar-view" />}
                                {activeView === 'nexus' && <Nexus id="nexus-view" />}
                                {activeView === 'paper_terminal' && <PaperTerminal id="paper-terminal" />}
                                {activeView === 'sentinel' && <SentinelTerminal id="sentinel-terminal" messages={messages} input={input} setInput={setInput} isLoading={isLoading} error={error} handleSendMessage={handleSendMessage} handleTroubleshoot={handleTroubleshoot} suggestions={suggestions} onAddAllSuggestions={handleAddAllSuggestions} />}
                                {activeView === 'orchestrator' && <AgentOrchestrator id="agent-orchestrator" mission={mission} handleMissionChange={(e)=>setMission(e.target.value)} />}
                                {activeView === 'toolkit' && <AIToolkit id="ai-toolkit" />}
                                {activeView === 'backtester' && <Backtester id="backtester-view" />}
                                {activeView === 'analytics' && <Analytics id="analytics-dashboard" />}
                                {activeView === 'intel' && <Intel id="intel-feed" />}
                            </Suspense>
                        </div>
                    </div>
                    
                    {activeView !== 'sentinel' && (
                        <div className="h-10 cyber-inset flex items-center px-4 space-x-3 overflow-x-auto custom-scrollbar flex-shrink-0">
                            <TerminalIcon className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            {suggestions.map((suggestion, idx) => (
                                <button key={idx} onClick={() => handleSuggestionClick(suggestion)} className="flex-shrink-0 px-2 py-0.5 text-[10px] font-mono text-slate-400 hover:text-cyan-400 border border-transparent hover:border-cyan-900/50 rounded transition-colors whitespace-nowrap">
                                    &gt; {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col gap-4 h-full min-h-0">
                    <div className="cyber-chip p-1 flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
                            <MarketWatch id="market-watch" />
                            <Portfolio id="portfolio-overview" />
                            <AlphaGauge id="alpha-gauge" />
                            <SwarmVisualizer id="swarm-visualizer" />
                        </div>
                    </div>
                    <div className="h-48 cyber-chip">
                        <SystemLog id="system-log" />
                    </div>
                </div>
            </div>
        );
    };

    if (!introComplete) return <CinematicIntro onComplete={() => setIntroComplete(true)} />;

    return (
        <div className={`min-h-screen flex flex-col font-sans relative overflow-hidden transition-colors duration-1000 ${isGodMode ? 'god-mode-active' : ''}`}>
            <LiveWallpaper />
            <div className="absolute top-24 right-10 z-50 pointer-events-none hidden lg:block"><AvatarOrb /></div>
            
            <HolographicOverlay isVisible={showOverlay} onClose={handleCloseOverlay} isFirstVisit={showOnboardingTour} onStartTour={startTour} onSkipTour={skipTour} />
            
            {isHolographicEngaged && showOnboardingTour && currentTourStepIndex !== -1 && (
                <OnboardingTour currentStepIndex={currentTourStepIndex} onNext={()=>setCurrentTourStepIndex(p=>p+1)} onPrevious={()=>setCurrentTourStepIndex(p=>p-1)} onComplete={completeTour} onSkip={skipTour} />
            )}
            
            {/* Top Status Bar (Physical Metal Look) */}
            <div className={`h-6 flex items-center justify-between px-4 text-[9px] font-mono border-b z-20 transition-colors ${killSwitchActive ? 'bg-red-950 border-red-500 text-white animate-pulse' : 'bg-[#111] border-[#333] text-slate-500'}`}>
                <div className="flex gap-4">
                   <span className="flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${killSwitchActive ? 'bg-white' : 'bg-green-500 shadow-[0_0_5px_#22c55e]'}`}></span> SPINE: {killSwitchActive ? 'HALTED' : 'STABLE'}</span>
                   <span>COHERENCE: {(quantumMetrics?.qubitCoherence || 0).toFixed(2)}ns</span>
                   <span>TES: {(quantumMetrics?.tesScore || 0).toFixed(2)}</span>
                </div>
                <div className="flex gap-4">
                   <span className="text-amber-500 font-bold glow-text-gold">{isGodMode ? 'GOD_MODE_ACTIVE' : 'UPB-1_GATED'}</span>
                   <span>Ω GEN: {(quantumMetrics?.gpGenerations || 0).toLocaleString()}</span>
                </div>
            </div>

            <Header onAnalyzeSentiment={()=>{}} onStartTour={startTour} onInitiateSwarm={handleInitiateSwarmProtocol} />
            
            <div className="flex-1 flex flex-col relative z-10 h-[calc(100vh-64px-24px)]">
                {/* Navigation Deck */}
                <div className="px-4 py-2 bg-[#050505] border-b border-[#222] flex gap-1 overflow-x-auto custom-scrollbar flex-shrink-0 items-center shadow-lg relative z-20">
                    <CyberKey view="nexus" label="Nexus" icon={<QuantumIcon className="w-3 h-3"/>} id="tab-nexus" />
                    <CyberKey view="sentinel" label="Sentinel" icon={<TerminalIcon className="w-3 h-3"/>} id="tab-sentinel" />
                    <CyberKey view="orchestrator" label="Orchestrator" icon={<NetworkIcon className="w-3 h-3"/>} id="tab-orchestrator" />
                    <CyberKey view="paper_terminal" label="Paper" icon={<BeakerIcon className="w-3 h-3"/>} id="tab-paper" />
                    <CyberKey view="sonar" label="Sonar" icon={<SonarIcon className="w-3 h-3"/>} id="tab-sonar" />
                    <CyberKey view="analytics" label="Analytics" icon={<ChartPieIcon className="w-3 h-3"/>} id="tab-analytics" />
                    <CyberKey view="toolkit" label="Toolkit" icon={<SparklesIcon className="w-3 h-3"/>} id="tab-toolkit" />
                    <CyberKey view="backtester" label="Backtester" icon={<ChartBarIcon className="w-3 h-3"/>} id="tab-backtester" />
                    <CyberKey view="intel" label="Intel" icon={<BookOpenIcon className="w-3 h-3"/>} id="tab-intel" />
                </div>
                {renderMainContent()}
            </div>
        </div>
    );
};

export default App;
