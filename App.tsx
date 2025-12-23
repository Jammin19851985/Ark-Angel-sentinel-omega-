import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import SentinelTerminal from './components/SentinelTerminal';
import MarketWatch from './components/MarketWatch';
import Portfolio from './components/Portfolio';
import SwarmVisualizer from './components/SwarmVisualizer';
import SystemLog from './components/SystemLog';
import AIToolkit from './AIToolkit';
import { Backtester } from './components/Backtester';
import AgentOrchestrator from './components/AgentOrchestrator';
import Analytics from './components/Analytics';
import Intel from './components/Intel';
import Sonar from './components/Sonar';
import Nexus from './components/Nexus';
import PaperTerminal from './components/PaperTerminal';
import HolographicOverlay from './components/HolographicOverlay';
import OnboardingTour from './components/OnboardingTour'; 
import LiveWallpaper from './components/LiveWallpaper'; 
import AvatarOrb from './components/AvatarOrb';
import { useAppContext } from './contexts/AppContext';
import { sendMessageToSentinelA } from './services/geminiService';
import { Message, ActiveView } from './types';
import { BOOT_SEQUENCE_LAYERS } from './constants';
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
import Loader from './components/Loader';
import AlphaGauge from './components/AlphaGauge';

const INITIAL_SUGGESTIONS = [
    "Quantum Entropy Trade Timer", "Entangled Correlation Fracture Detector", "Quantum Half-Life Alpha Estimator", 
    "Neuromorphic Order Book Fingerprinter", "Spiking Volume Sincerity Scorer", "Quantum Black Swan Pre-Stress Simulator",
    "Entangled Flash Loan Defense", "SICO Singly Indivisible Composite Orders", "Temporal Drift Nullifier", "MLEM Hash Verifier"
];

const App: React.FC = () => {
    const { 
        addLog, setIsGodMode, setIsGodModeUnlocked, isGodMode, isGodModeUnlocked, 
        executeAllPrimeDirectives, killSwitchActive, quantumMetrics
    } = useAppContext();
    
    const [messages, setMessages] = useState<Message[]>(() => {
        try {
            const saved = localStorage.getItem('archangel_messages');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<ActiveView>('nexus');
    const [showOverlay, setShowOverlay] = useState(false);
    const [isHolographicEngaged, setIsHolographicEngaged] = useState(false);
    const [mission, setMission] = useState<string>('INITIATE_SWARM_PROTOCOL --agents 2500 --mode OMEGA');
    const [suggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
    const hasInitialized = useRef(false);

    const [showOnboardingTour, setShowOnboardingTour] = useState(false);
    const [currentTourStepIndex, setCurrentTourStepIndex] = useState(-1);
    const [hasPaidKey, setHasPaidKey] = useState(false);

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
        if (localStorage.getItem('archangel_onboarding_completed') !== 'true') setShowOnboardingTour(true);
    }, []);

    const startTour = useCallback(() => { setActiveView('sentinel'); setTimeout(() => setCurrentTourStepIndex(0), 100); }, []);
    const skipTour = useCallback(() => { setShowOnboardingTour(false); setCurrentTourStepIndex(-1); localStorage.setItem('archangel_onboarding_completed', 'true'); }, []);
    const completeTour = useCallback(() => { setShowOnboardingTour(false); setCurrentTourStepIndex(-1); localStorage.setItem('archangel_onboarding_completed', 'true'); }, []);

    useEffect(() => {
        const body = document.body;
        if (isGodMode) body.classList.add('god-mode-active');
        else body.classList.remove('god-mode-active');
    }, [isGodMode]);
    
    useEffect(() => { localStorage.setItem('archangel_messages', JSON.stringify(messages)); }, [messages]);

    const initialize = useCallback(async () => {
        if (messages.length > 0) { setIsLoading(false); setShowOverlay(true); return; }
        try {
            addLog('SYSTEM', 'AODE boot sequence initiated...');
            for (const layer of BOOT_SEQUENCE_LAYERS) {
                await new Promise(r => setTimeout(r, 40));
                addLog('BOOT', layer);
            }
            addLog('SYSTEM', '>> PRIME DIRECTIVE: ACTIVE.');
            setMessages([{ author: 'sentinel', content: "## ARCHANGEL OMEGA ONLINE.\n\n>> ADMIN ACCESS: GRANTED.\n>> ZERO ERROR PROTOCOL: ENGAGED.\n>> SCOPE: 100,000xBaseline." }]);
        } catch { setError(`Initialization decoherence.`); } finally { setIsLoading(false); setShowOverlay(true); }
    }, [addLog, messages.length]);

    useEffect(() => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;
      initialize();
    }, [initialize]);

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const currentInput = input.trim();

        if (currentInput.includes('godmodeAdam1121#')) {
            setIsGodModeUnlocked(true);
            setIsGodMode(true);
            addLog('AODE', 'PROTOCOL OVERRIDE: GOD MODE ACTIVE.');
            setMessages(prev => [...prev, 
                { author: 'sentinel', content: "## Ω OVERRIDE ACTIVE\n\nGod Mode manifest. Sovereign limits removed. 100,000x Scope deployed." }
            ]);
            setInput('');
            return;
        }

        const userMessage: Message = { author: 'user', content: currentInput };
        setInput('');
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        try {
            const response = await sendMessageToSentinelA(currentInput);
            setMessages(prev => [...prev, { author: 'sentinel', content: response }]);
        } catch { setError('Command failed.'); } finally { setIsLoading(false); }
    }, [input, isLoading, addLog, setIsGodMode, setIsGodModeUnlocked]);

    const handleTroubleshoot = useCallback(async (errorMessage: string) => {
        addLog('SYSTEM', `Forensic Scanning: ${errorMessage}`);
        setIsLoading(true);
        try {
            const response = await sendMessageToSentinelA(`ERROR_VEC: "${errorMessage}". Resolve.`);
            setMessages(prev => [...prev, { author: 'sentinel', content: `## FORENSIC FIX\n\n${response}` }]);
        } catch { addLog('ERROR', 'Troubleshooter failed.'); } finally { setIsLoading(false); }
    }, [addLog]);

    const handleAddAllSuggestions = useCallback(() => {
        executeAllPrimeDirectives(suggestions);
        setMessages(prev => [...prev, { author: 'user', content: "SYSTEM: Manifest all 100 Sovereign Directives." }]);
        setActiveView('nexus');
    }, [suggestions, executeAllPrimeDirectives]);
    
    const handleCloseOverlay = () => { setShowOverlay(false); setIsHolographicEngaged(true); addLog('SYSTEM', 'Interface engaged.'); };
    
    const TabButton: React.FC<{view: ActiveView, label: string, icon: React.ReactNode, id: string}> = ({ view, label, icon, id }) => (
         <button id={id} onClick={() => setActiveView(view)} className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all duration-300 uppercase tracking-widest ${activeView === view ? 'border-amber-500 text-amber-400 bg-amber-900/20' : 'border-transparent text-slate-500 hover:text-amber-400 bg-black/30'}`}>
            {icon}<span>{label}</span>
        </button>
    );

    const renderMainContent = () => {
        if (!hasPaidKey) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/80 backdrop-blur-xl">
                    <div className="bg-slate-900/90 border border-amber-500/30 p-12 rounded-3xl shadow-2xl text-center max-w-md">
                        <ShieldIcon className="w-16 h-16 text-amber-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-4 font-mono uppercase tracking-widest">Sovereign Auth Required</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed text-sm font-sans">
                            ARK Ω synthesis requires a paid Google AI Studio API key for high-fidelity execution.
                        </p>
                        <button 
                            onClick={handleSelectKey}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)]"
                        >
                            Select Paid API Key
                        </button>
                    </div>
                </div>
            );
        }

        if (activeView === 'sonar') return <Sonar id="sonar-view" />;
        if (activeView === 'nexus') return <Nexus id="nexus-view" />;
        if (activeView === 'paper_terminal') return <PaperTerminal id="paper-terminal" />;

        const viewContent = () => {
            switch (activeView) {
                case 'sentinel': return <SentinelTerminal id="sentinel-terminal" messages={messages} input={input} setInput={setInput} isLoading={isLoading} error={error} handleSendMessage={handleSendMessage} handleTroubleshoot={handleTroubleshoot} suggestions={suggestions} onAddAllSuggestions={handleAddAllSuggestions} />;
                case 'orchestrator': return <AgentOrchestrator id="agent-orchestrator" mission={mission} handleMissionChange={(e)=>setMission(e.target.value)} />;
                case 'toolkit': return <AIToolkit id="ai-toolkit" />;
                case 'backtester': return <Backtester id="backtester-view" />;
                case 'analytics': return <Analytics id="analytics-dashboard" />;
                case 'intel': return <Intel id="intel-feed" />;
                default: return null;
            }
        };

        return (
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 flex-1">
                <div className="lg:col-span-2 flex flex-col h-full">{viewContent()}</div>
                <div className="flex flex-col gap-6 lg:gap-8 h-full">
                    <MarketWatch id="market-watch" />
                    <Portfolio id="portfolio-overview" />
                    <AlphaGauge id="alpha-gauge" />
                    <SwarmVisualizer id="swarm-visualizer" />
                </div>
                <div className="lg:col-span-3 h-full"><SystemLog id="system-log" /></div>
            </div>
        );
    };

    if (isLoading && messages.length === 0) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center">
                <Loader /><p className="mt-4 text-amber-500 font-mono animate-pulse uppercase tracking-[0.4em]">AODE LOADING...</p>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col font-sans relative overflow-hidden ${isGodMode ? 'god-mode-active' : ''}`}>
            <LiveWallpaper /><AvatarOrb />
            <HolographicOverlay isVisible={showOverlay} onClose={handleCloseOverlay} isFirstVisit={showOnboardingTour} onStartTour={startTour} onSkipTour={skipTour} />
            {isHolographicEngaged && showOnboardingTour && currentTourStepIndex !== -1 && (
                <OnboardingTour currentStepIndex={currentTourStepIndex} onNext={()=>setCurrentTourStepIndex(p=>p+1)} onPrevious={()=>setCurrentTourStepIndex(p=>p-1)} onComplete={completeTour} onSkip={skipTour} />
            )}
            
            {/* Global SICO Status Bar */}
            <div className={`h-8 flex items-center justify-between px-6 text-[10px] font-mono border-b transition-colors ${killSwitchActive ? 'bg-red-900 border-red-500 text-white animate-pulse' : 'bg-black/80 border-slate-800 text-slate-400'}`}>
                <div className="flex gap-6">
                   <span className="flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${killSwitchActive ? 'bg-white' : 'bg-green-500'}`}></span> SPINE: {killSwitchActive ? 'HALTED' : 'STABLE'}</span>
                   <span>COHERENCE: {(quantumMetrics?.qubitCoherence || 0).toFixed(2)}ns</span>
                   <span>TES: {(quantumMetrics?.tesScore || 0).toFixed(2)}</span>
                </div>
                <div className="flex gap-4">
                   <span className="text-amber-500">MLEM: {isGodMode ? 'GOD_MODE' : 'UPB-1_GATED'}</span>
                   <span>Ω: {(quantumMetrics?.gpGenerations || 0).toLocaleString()} GEN</span>
                </div>
            </div>

            <Header onAnalyzeSentiment={()=>{}} />
            
            <div className="flex-1 flex flex-col relative z-10">
                <div className="flex items-end border-b border-slate-800 px-4 flex-wrap bg-black/60 backdrop-blur-sm">
                    <TabButton view="nexus" label="Nexus" icon={<QuantumIcon className="w-4 h-4"/>} id="tab-nexus" />
                    <TabButton view="sentinel" label="Sentinel-A" icon={<TerminalIcon className="w-4 h-4"/>} id="tab-sentinel" />
                    <TabButton view="orchestrator" label="Orchestrator" icon={<NetworkIcon className="w-4 h-4"/>} id="tab-orchestrator" />
                    <TabButton view="paper_terminal" label="Paper" icon={<BeakerIcon className="w-4 h-4"/>} id="tab-paper" />
                    <TabButton view="sonar" label="Sonar" icon={<SonarIcon className="w-4 h-4"/>} id="tab-sonar" />
                    <TabButton view="analytics" label="Analytics" icon={<ChartPieIcon className="w-4 h-4"/>} id="tab-analytics" />
                    <TabButton view="toolkit" label="AI Toolkit" icon={<SparklesIcon className="w-4 h-4"/>} id="tab-toolkit" />
                    <TabButton view="backtester" label="Backtester" icon={<ChartBarIcon className="w-4 h-4"/>} id="tab-backtester" />
                    <TabButton view="intel" label="Intel" icon={<BookOpenIcon className="w-4 h-4"/>} id="tab-intel" />
                </div>
                {renderMainContent()}
            </div>
        </div>
    );
};

export default App;