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
import { Message } from './types';
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

type ActiveView = 'sentinel' | 'orchestrator' | 'toolkit' | 'backtester' | 'analytics' | 'intel' | 'sonar' | 'nexus' | 'paper_terminal';

const INITIAL_SUGGESTIONS = [
    "Quantum Entropy Trade Timer", "Entangled Correlation Fracture Detector", "Quantum Half-Life Alpha Estimator", "Quantum Mempool Entropy Shield",
    "Entangled Regime Classifier", "Quantum Inventory Skew Randomizer", "Quantum Slippage Forecaster", "Entangled Liquidity Cliff Detector",
    "Quantum Overcrowding Entropy Score", "Quantum Black Swan Pre-Stress Simulator", "Entangled Flash Loan Defense", "Quantum Sentiment Phase Estimator",
    "Entangled Position Sizing Optimizer", "Quantum Drawdown Topology Mapper", "Entangled Anomaly Hunter", "Quantum MEV Offensive Probe",
    "Entangled Exposure Convexity Limiter", "Quantum Volatility Shock Absorber", "Entangled Alpha Vault Encryptor", "Quantum Autonomy Hesitation Logic",
    "Neuromorphic Order Book Topology Fingerprinter", "Spiking Volume Sincerity Scorer", "Neuromorphic Correlation Spike Firewall", "Spiking Unknown Unknown Hunter",
    "Neuromorphic Strategy Cannibalization Simulator", "Spiking Alpha Overcrowding Alarm", "Neuromorphic Rare Event Vault", "Spiking Inventory Risk Controller",
    "Neuromorphic Latency Budget Allocator", "Spiking Partial Fill Reconciler", "Neuromorphic Exchange Halt Predictor", "Spiking Bias Correction Engine",
    "Neuromorphic Confidence Decay Model", "Spiking Autonomy Pause Trigger", "Neuromorphic Hesitation Tree", "Spiking Capital Fragility Scorer",
    "Neuromorphic Liquidity Illusion Index", "Spiking Structural Drift Alarm", "Neuromorphic Self-Retirement Logic", "Spiking Meta-Regime Classifier",
    "Hidden Manager Officer Network Miner", "Private Valuation Fusion Layer", "Active Management Bias Corrector", "Non-Financial Catalyst Integrator",
    "Market Illiquidity Premium Estimator", "Behavioral Finance Convexity Exploiter", "Operator Skill Decay Tracker", "Covenant Breach Forecaster",
    "Behavioral Overcrowding Sentiment Scraper", "Hidden Fund Flow Tracer", "Private Equity Exit Timing Predictor", "Behavioral Regime Entropy Booster",
    "Correlation Fracture Proxy", "Private Asset Tokenization Alpha", "Behavioral Inventory Dump Detector", "Supply Chain Disruption Mapper",
    "Private Credit Default Cascade Model", "Behavioral Alpha Half-Life Accelerator", "Undiscovered Venue Health Scorer", "Hedge Fund Positioning Recon",
    "Quantum Spiking Drawdown Airbag", "Volatility Surface Fractal Analyzer", "Quantum Spiking Ruin Estimator", "Exposure Convexity Quantum Limiter",
    "Neuromorphic Quantum Correlation Firewall", "Liquidity Cliff Quantum Forecaster", "Quantum Spiking Emergency Freeze", "Capital Freeze Smart Contract",
    "Neuromorphic Quantum Hesitation Logic", "Hybrid Autonomy Cooldown", "Quantum Spiking Performance Gate", "Hybrid Anomaly Pause",
    "Neuromorphic Quantum Confidence Updater", "Hybrid Survival First Sizer", "Quantum Spiking Tamper Detector", "Hybrid Offline Liquidation",
    "Neuromorphic Quantum Quorum Voter", "Hybrid Dead Man Entropy Timer", "Quantum Spiking Firmware Lock", "Hybrid Autonomy Audit Trail",
    "FPGA Accelerated Topology Offloader", "MEV Predictive Sandwich Forecaster", "Spatial Arb Randomizer", "Hybrid Flashbots V2 Bundler",
    "Offensive Liquidation Bot Shield", "Flash Loan Entropy Protector", "Microsecond Order Signing Rust Stub", "Venue Health Quantum Scorer",
    "Partial Fill Quantum Reconciler", "Slippage Impact Fractal Model", "Cancel Replace Race Mitigator", "Exchange Halt Spiking Predictor",
    "Latency Budget Quantum Allocator", "Fill Settlement Blockchain Verifier", "Tamper Quantum Fingerprint", "Hardware Spiking Consensus",
    "Dead Man Quantum Timer", "Firmware Mismatch Hybrid Lock", "Autonomy Revocation On-Chain", "Meta-Layer Self-Evolution Engine"
];

const App: React.FC = () => {
    const { 
        addLog, setIsGodMode, setIsGodModeUnlocked, isGodMode, isGodModeUnlocked, executeAllPrimeDirectives 
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
    const [mission, setMission] = useState<string>(() => localStorage.getItem('archangel_mission') || 'Formulate and execute a GLOBAL_MACRO_ARBITRAGE strategy...');
    const [suggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
    const hasInitialized = useRef(false);

    const [showOnboardingTour, setShowOnboardingTour] = useState(false);
    const [currentTourStepIndex, setCurrentTourStepIndex] = useState(-1);

    const [hasPaidKey, setHasPaidKey] = useState(false);

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const selected = await window.aistudio.hasSelectedApiKey();
                setHasPaidKey(selected);
            }
        };
        checkKey();
    }, []);

    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            setHasPaidKey(true);
        }
    };

    useEffect(() => {
        if (localStorage.getItem('archangel_onboarding_completed') !== 'true') setShowOnboardingTour(true);
    }, []);

    const startTour = useCallback(() => { setActiveView('sentinel'); setTimeout(() => setCurrentTourStepIndex(0), 100); }, []);
    const skipTour = useCallback(() => { setShowOnboardingTour(false); setCurrentTourStepIndex(-1); localStorage.setItem('archangel_onboarding_completed', 'true'); addLog('SYSTEM', 'Tour skipped.'); }, [addLog]);
    const completeTour = useCallback(() => { setShowOnboardingTour(false); setCurrentTourStepIndex(-1); localStorage.setItem('archangel_onboarding_completed', 'true'); addLog('SYSTEM', 'Tour completed.'); }, [addLog]);

    useEffect(() => {
        const body = document.body;
        if (isHolographicEngaged) body.classList.add('holographic-engaged');
        else body.classList.remove('holographic-engaged');
    }, [isHolographicEngaged]);
    
    useEffect(() => { localStorage.setItem('archangel_messages', JSON.stringify(messages)); }, [messages]);

    const initialize = useCallback(async () => {
        if (messages.length > 0) { setIsLoading(false); setShowOverlay(true); return; }
        try {
            addLog('SYSTEM', 'ARK Ω boot sequence initiated...');
            for (let i = 0; i < BOOT_SEQUENCE_LAYERS.length; i++) {
                await new Promise(r => setTimeout(r, 30));
                addLog('BOOT', BOOT_SEQUENCE_LAYERS[i]);
            }
            addLog('SYSTEM', '>> ADMIN ACCESS: GRANTED.');
            setMessages([{ author: 'sentinel', content: "// TURMOX Ω ONLINE.\n\n>> ADMIN ACCESS: GRANTED.\n>> ZERO ERROR PROTOCOL: ACTIVE.\n>> SCOPE: 100,000x BEYOND." }]);
        } catch { setError(`Initialization failed.`); } finally { setIsLoading(false); setShowOverlay(true); }
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
            addLog('SYSTEM', 'Ω PROTOCOL OVERRIDE: GOD MODE ACTIVATED via Terminal Secret.');
            setMessages(prev => [...prev, 
                { author: 'user', content: '***OMNI_CODE_REVEALED***' },
                { author: 'sentinel', content: "## Ω OVERRIDE DETECTED\n\n**God Mode: ENABLED**. All sovereign limits removed. Quantum manifold stabilized. 100,000x Scope active across all execution timelines." }
            ]);
            setInput('');
            return;
        }

        const userMessage: Message = { author: 'user', content: currentInput };
        setInput('');
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);
        try {
            const response = await sendMessageToSentinelA(currentInput);
            setMessages(prev => [...prev, { author: 'sentinel', content: response }]);
            addLog('SENTINEL', 'Response generated.');
        } catch { setError('Command failed.'); } finally { setIsLoading(false); }
    }, [input, isLoading, addLog, setIsGodMode, setIsGodModeUnlocked]);

    const handleTroubleshoot = useCallback(async (errorMessage: string) => {
        addLog('SYSTEM', `Forensic Troubleshooting: ${errorMessage}`);
        setIsLoading(true);
        try {
            const response = await sendMessageToSentinelA(`ERROR DETECTED: "${errorMessage}". Suggest remediation.`);
            setMessages(prev => [...prev, { author: 'sentinel', content: `## FORENSIC REPORT\n\n${response}` }]);
        } catch { addLog('ERROR', 'Troubleshooting engine failed.'); } finally { setIsLoading(false); }
    }, [addLog]);

    const handleAddAllSuggestions = useCallback(() => {
        executeAllPrimeDirectives(suggestions);
        setMessages(prev => [...prev, { author: 'user', content: "SYSTEM_OVERRIDE: Manifest all 100 Prime Directives." }]);
        setActiveView('nexus');
    }, [suggestions, executeAllPrimeDirectives]);
    
    const handleCloseOverlay = () => { setShowOverlay(false); setIsHolographicEngaged(true); addLog('SYSTEM', 'Holographic interface engaged.'); };
    
    const TabButton: React.FC<{view: ActiveView, label: string, icon: React.ReactNode, id: string}> = ({ view, label, icon, id }) => (
         <button id={id} onClick={() => setActiveView(view)} className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeView === view ? 'border-amber-500 text-amber-400 bg-amber-900/50' : 'border-transparent text-slate-400 hover:text-amber-400 bg-black/50'}`}>
            {icon}<span>{label}</span>
        </button>
    );

    const renderMainContent = () => {
        if (!hasPaidKey) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-lg">
                    <div className="bg-slate-900/90 border border-amber-500/30 p-12 rounded-3xl shadow-2xl text-center max-w-md">
                        <ShieldIcon className="w-16 h-16 text-amber-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-4 font-mono uppercase tracking-widest">Awaiting Sovereign Auth</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed font-sans text-sm">
                            Access to the ARK Ω engine, including Veo Video Synthesis and Gemini 3 Pro intelligence, requires a paid Google AI Studio API key.
                        </p>
                        <button 
                            onClick={handleSelectKey}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:scale-[1.02]"
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
            <div className={`p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 flex-1 bg-transparent`}>
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
            <div className="min-h-screen bg-black flex flex-col items-center justify-center font-sans">
                <Loader /><p className="mt-2 text-slate-400 font-mono">Initializing ARK Ω...</p>
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
            <Header onAnalyzeSentiment={()=>{}} />
            <div className="flex-1 flex flex-col relative z-10">
                <div className="flex items-end border-b border-slate-800 px-4 flex-wrap bg-black/40 backdrop-blur-sm">
                    <TabButton view="nexus" label="Nexus" icon={<QuantumIcon className="w-5 h-5"/>} id="tab-nexus" />
                    <TabButton view="sentinel" label="Sentinel-A" icon={<TerminalIcon className="w-5 h-5"/>} id="tab-sentinel" />
                    <TabButton view="orchestrator" label="Orchestrator" icon={<NetworkIcon className="w-5 h-5"/>} id="tab-orchestrator" />
                    <TabButton view="paper_terminal" label="Paper" icon={<BeakerIcon className="w-5 h-5"/>} id="tab-paper" />
                    <TabButton view="sonar" label="Sonar" icon={<SonarIcon className="w-5 h-5"/>} id="tab-sonar" />
                    <TabButton view="analytics" label="Analytics" icon={<ChartPieIcon className="w-5 h-5"/>} id="tab-analytics" />
                    <TabButton view="toolkit" label="AI Toolkit" icon={<SparklesIcon className="w-5 h-5"/>} id="tab-toolkit" />
                    <TabButton view="backtester" label="Backtester" icon={<ChartBarIcon className="w-5 h-5"/>} id="tab-backtester" />
                    <TabButton view="intel" label="Intel" icon={<BookOpenIcon className="w-5 h-5"/>} id="tab-intel" />
                </div>
                {renderMainContent()}
            </div>
        </div>
    );
};

export default App;
