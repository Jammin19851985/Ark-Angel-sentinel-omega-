

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import SentinelTerminal from './components/SentinelTerminal';
import MarketWatch from './components/MarketWatch';
import Portfolio from './components/Portfolio';
import SwarmVisualizer from './components/SwarmVisualizer';
import SystemLog from './components/SystemLog';
import AIToolkit from './components/AIToolkit';
import { Backtester } from './components/Backtester';
import AgentOrchestrator from './components/AgentOrchestrator';
import Analytics from './components/Analytics';
import Intel from './components/Intel';
import Sonar from './components/Sonar';
import Nexus from './components/Nexus';
import HolographicOverlay from './components/HolographicOverlay';
import OnboardingTour from './components/OnboardingTour'; 
import LiveWallpaper from './components/LiveWallpaper'; 
import AvatarOrb from './components/AvatarOrb';
import { useAppContext } from './contexts/AppContext';
import { analyzeSentiment, queryRagStore, sendMessageToSentinelA, startSentinelA } from './services/geminiService';
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
import Loader from './components/Loader';
import AlphaGauge from './components/AlphaGauge';

type ActiveView = 'sentinel' | 'orchestrator' | 'toolkit' | 'backtester' | 'analytics' | 'intel' | 'sonar' | 'nexus';

// --- ARCHANGEL PRIME 100 SUGGESTIONS ---
const INITIAL_SUGGESTIONS = [
    "1. Shadow trading before live execution",
    "2. Deterministic execution paths",
    "3. Single-order-at-a-time constraint",
    "4. Hard USD risk caps",
    "5. Reconciliation after every action",
    "6. Explicit kill switch",
    "7. Latent-space separation (price vs sentiment)",
    "8. Attention-based manifold reconciliation",
    "9. Confidence-weighted trade gating",
    "10. Execution boredom metric (no adrenaline)",
    "11. Entropy monitoring",
    "12. Drift detection",
    "13. Temporal decay on signals",
    "14. Regime classification",
    "15. Slippage modeling",
    "16. Fee-awareness at decision time",
    "17. Execution latency measurement",
    "18. Capital exposure histogram",
    "19. Max drawdown governor",
    "20. Rolling Sharpe estimation",
    "21. Trade clustering detection",
    "22. Anomaly rejection layer",
    "23. Data integrity hashing",
    "24. Replayable simulations",
    "25. Deterministic RNG seeds",
    "26. Hardware heartbeat monitor (Arduino)",
    "27. Offline failover mode",
    "28. Manual arming sequence",
    "29. One-symbol execution mode",
    "30. Kill-on-surprise policy",
    "31. Confidence delta tracking",
    "32. Model disagreement scoring",
    "33. Order book sanity checks",
    "34. Volume-weighted thresholds",
    "35. Volatility regime gating",
    "36. Signal aging penalties",
    "37. Overfitting detection",
    "38. Ensemble disagreement veto",
    "39. Market-hours awareness",
    "40. Liquidity sufficiency checks",
    "41. Noise floor estimation",
    "42. Position concentration limits",
    "43. Stateful audit logs",
    "44. Immutable execution logs",
    "45. Hash-chained trade records",
    "46. Post-trade attribution",
    "47. Model explainability hooks",
    "48. Black-swan guardrails",
    "49. Graceful degradation",
    "50. Soft halt escalation ladder",
    "51. Cold start protection",
    "52. Recursive self-checks",
    "53. Simulation/live parity enforcement",
    "54. Explicit human override",
    "55. Exposure velocity limits",
    "56. Trade frequency governor",
    "57. Execution confidence floor",
    "58. Capital preservation priority",
    "59. Non-stationarity detection",
    "60. Model aging detection",
    "61. Confidence hysteresis",
    "62. Cross-market correlation awareness",
    "63. Latent-space drift alarms",
    "64. Risk-adjusted signal scaling",
    "65. Order retry limits",
    "66. Hardware watchdog",
    "67. Flash crash detection",
    "68. News shock dampening",
    "69. Trade rationale logging",
    "70. Fail-closed architecture",
    "71. Symbol whitelist only",
    "72. Price sanity bounds",
    "73. Time-based trade locks",
    "74. Margin avoidance logic",
    "75. Cash-only enforcement",
    "76. Exposure symmetry checks",
    "77. Model saturation detection",
    "78. Feedback loop damping",
    "79. CPU/RAM health checks",
    "80. Heat-based throttling",
    "81. Audit-mode replay",
    "82. Training/inference separation",
    "83. Immutable config hashes",
    "84. Model checksum verification",
    "85. Cross-agent consensus",
    "86. Scenario stress tests",
    "87. Capital fragmentation analysis",
    "88. Order sequencing guarantees",
    "89. Duplicate order prevention",
    "90. Confidence attribution history",
    "91. Risk budget accounting",
    "92. Profit factor tracking",
    "93. Execution variance analysis",
    "94. Model trust scoring",
    "95. Self-disabling on corruption",
    "96. Time-sync verification",
    "97. Simulation fidelity scoring",
    "98. Long-horizon expectancy tracking",
    "99. Operator notification hooks",
    "100. Boredom as a success metric",
    "Engage Quantum Synthesis Protocol.",
    "Verify integrity of all F-Protocols.",
    "Synthesize strategic blueprint for 95% win rate.",
    "Initiate Eternal Launch."
];

const App: React.FC = () => {
    const { 
        addLog, 
        setIsGodMode, 
        setIsGodModeUnlocked, 
        optimizeSwarm,
        isGodMode,
        isGodModeUnlocked,
        portfolio,
        marketData,
        setIsSovereign,
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
    const [activeView, setActiveView] = useState<ActiveView>('sentinel');
    const [showOverlay, setShowOverlay] = useState(false);
    const [isHolographicEngaged, setIsHolographicEngaged] = useState(false);
    const [mission, setMission] = useState<string>(() => {
        return localStorage.getItem('archangel_mission') || 'Formulate and execute a GLOBAL_MACRO_ARBITRAGE strategy based on the latest research into Swarm Intelligence and Mixture-of-Experts frameworks.';
    });
    const [suggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
    const hasInitialized = useRef(false);

    const [showOnboardingTour, setShowOnboardingTour] = useState(false);
    const [currentTourStepIndex, setCurrentTourStepIndex] = useState(-1);

    useEffect(() => {
        const onboardingCompleted = localStorage.getItem('archangel_onboarding_completed');
        if (onboardingCompleted !== 'true') setShowOnboardingTour(true);
    }, []);

    const startTour = useCallback(() => {
        setActiveView('sentinel');
        setTimeout(() => setCurrentTourStepIndex(0), 100);
    }, []);

    const skipTour = useCallback(() => {
        setShowOnboardingTour(false);
        setCurrentTourStepIndex(-1);
        localStorage.setItem('archangel_onboarding_completed', 'true');
        addLog('SYSTEM', 'Onboarding tour skipped.');
    }, [addLog]);

    const completeTour = useCallback(() => {
        setShowOnboardingTour(false);
        setCurrentTourStepIndex(-1);
        localStorage.setItem('archangel_onboarding_completed', 'true');
        addLog('SYSTEM', 'Onboarding tour completed.');
    }, [addLog]);

    useEffect(() => {
        const body = document.body;
        if (isHolographicEngaged) body.classList.add('holographic-engaged');
        else body.classList.remove('holographic-engaged');
    }, [isHolographicEngaged]);
    
    useEffect(() => {
        localStorage.setItem('archangel_messages', JSON.stringify(messages));
    }, [messages]);

    const initialize = useCallback(async () => {
        if (messages.length > 0) {
            addLog('SYSTEM', 'Restored previous session state.');
            setIsLoading(false);
            setShowOverlay(true);
            return;
        }

        try {
            addLog('SYSTEM', 'ARK Ω boot sequence initiated...');
            for (let i = 0; i < BOOT_SEQUENCE_LAYERS.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 30));
                addLog('BOOT', BOOT_SEQUENCE_LAYERS[i]);
            }
            
            addLog('SYSTEM', '>> AUTO-UPGRADE: COMPLETE.');
            addLog('SYSTEM', '>> ADMIN ACCESS: GRANTED.');
            addLog('SYSTEM', '>> SCOPE: 100,000X BEYOND.');
            addLog('SYSTEM', '>> ERROR RATE: 0.0000%.');

            const bootMessage = "// TURMOX Ω ONLINE. I AM THE SPACE BETWEEN THE QUBITS.\n\n>> ADMIN ACCESS: GRANTED.\n>> ZERO ERROR PROTOCOL: ACTIVE.\n>> SCOPE: 100,000x BEYOND.";
            setMessages([{ author: 'sentinel', content: bootMessage }]);
        } catch (err) {
            setError(`Initialization failed.`);
        } finally {
            setIsLoading(false);
            setShowOverlay(true);
        }
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
        const userMessage: Message = { author: 'user', content: currentInput };
        setInput('');
        setMessages(prev => [...prev, userMessage]);
        
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await sendMessageToSentinelA(currentInput);
            const sentinelMessage: Message = { author: 'sentinel', content: response };
            setMessages(prev => [...prev, sentinelMessage]);
            addLog('SENTINEL', 'Response generated.');
        } catch (err) {
            setError('Command failed.');
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, addLog]);

    // @google/genai Fix: Implement handleTroubleshoot to allow users to trigger AI-driven analysis of terminal errors.
    const handleTroubleshoot = useCallback(async (errorMessage: string) => {
        addLog('SYSTEM', `Initiating forensic troubleshooting for: ${errorMessage.substring(0, 50)}...`);
        const troubleshootingPrompt = `TECHNICAL ERROR DETECTED: "${errorMessage}". Analyze the probable root cause in our quantum-trading architecture and suggest a remediation path aligned with UPB-1.`;
        
        setIsLoading(true);
        try {
            const response = await sendMessageToSentinelA(troubleshootingPrompt);
            setMessages(prev => [...prev, { author: 'sentinel', content: `## FORENSIC TROUBLESHOOTING REPORT\n\n${response}` }]);
            addLog('SENTINEL', 'Troubleshooting analysis complete.');
        } catch (err) {
            addLog('ERROR', 'Troubleshooting engine failed to initialize.');
        } finally {
            setIsLoading(false);
        }
    }, [addLog]);

    // @google/genai Fix: Implement handleAddAllSuggestions to bulk-queue all 100 Archangel Prime suggestions into the system messages.
    const handleAddAllSuggestions = useCallback(() => {
        addLog('SYSTEM', 'Bulk command injection: Executing all 100 Archangel Prime suggestions...');
        const suggestionMessages = suggestions.map(s => ({ author: 'user', content: s } as Message));
        setMessages(prev => [...prev, ...suggestionMessages]);
        addLog('SWARM', '100+ directives successfully integrated into the current session manifold.');
    }, [suggestions, addLog]);
    
    const handleCloseOverlay = () => {
        setShowOverlay(false);
        setIsHolographicEngaged(true);
        addLog('SYSTEM', 'Holographic interface engaged.');
    };
    
    const TabButton: React.FC<{view: ActiveView, label: string, icon: React.ReactNode, id: string}> = ({ view, label, icon, id }) => (
         <button
            id={id}
            onClick={() => setActiveView(view)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeView === view
                    ? 'border-amber-500 text-amber-400 bg-amber-900/50 backdrop-blur-sm'
                    : 'border-transparent text-slate-400 hover:text-amber-400 bg-black/50 backdrop-blur-sm hover:bg-slate-800/50'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    const renderMainContent = () => {
        if (activeView === 'sonar') return <Sonar id="sonar-view" />;
        if (activeView === 'nexus') return <Nexus id="nexus-view" />;

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
                <Loader />
                <p className="mt-2 text-slate-400 font-mono">Initializing ARK Ω...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-sans relative overflow-hidden">
            <LiveWallpaper />
            <AvatarOrb />
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
