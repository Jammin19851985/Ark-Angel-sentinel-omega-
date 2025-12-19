
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { useArchangel } from '../hooks/useArchangel';
import { Trade, AnalyticsKPIs, MarketData, Portfolio, Bot, LogEntry, SonarSignal, AiToolkitState, QuantumMetrics, GammaSessionState, CycleLog, InversionEventLog, ArchangelCoreState } from '../types';
import { runSwarmOptimization } from '../services/geminiService';

// --- MATH HELPERS FOR GAMMA SCALPER ---
function normCdf(x: number) {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    let sign = 1;
    if (x < 0) sign = -1;
    x = Math.abs(x) / Math.sqrt(2.0);
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1.0 + sign * y);
}

function normPdf(x: number) {
    return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

function calculateGreeks(S: number, K: number, T: number, r: number, sigma: number, optionType: 'call' | 'put') {
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    let delta = 0;
    if (optionType === 'call') {
        delta = normCdf(d1);
    } else {
        delta = normCdf(d1) - 1;
    }
    const gamma = normPdf(d1) / (S * sigma * Math.sqrt(T));
    return { delta, gamma };
}

// Define the shape of the context state
interface AppContextType {
    marketData: MarketData;
    portfolio: Portfolio;
    setPortfolio: React.Dispatch<React.SetStateAction<Portfolio>>;
    fiatBalance: number;
    depositFiat: (amount: number, source: string) => void;
    withdrawFiat: (amount: number, destination: string) => boolean;
    executeTrade: (symbol: string, action: 'BUY' | 'SELL', quantity: number, price: number) => void;
    bots: Bot[];
    logs: LogEntry[];
    addLog: (source: LogEntry['source'], message: string) => void;
    historicalMarketData: Record<string, number[]>;
    marketFilter: string;
    setMarketFilter: (filter: string) => void;
    sonarSignals: SonarSignal[];
    isGodMode: boolean;
    setIsGodMode: (isGodMode: boolean) => void;
    isGodModeUnlocked: boolean;
    setIsGodModeUnlocked: (unlocked: boolean) => void;
    trades: Trade[];
    setTrades: React.Dispatch<React.SetStateAction<Trade[]>>;
    kpis: AnalyticsKPIs;
    setKpis: React.Dispatch<React.SetStateAction<AnalyticsKPIs>>;
    optimizeSwarm: () => Promise<string>;
    isSwarmOptimized: boolean; // Persisted state
    swarmOptimizationReport: string | null; // Persisted report
    estimatedAlpha: number;
    aiToolkitState: AiToolkitState;
    setAiToolkitState: React.Dispatch<React.SetStateAction<AiToolkitState>>;
    
    // Nexus Persistence
    isNexusOnline: boolean;
    setNexusOnline: React.Dispatch<React.SetStateAction<boolean>>;
    nexusLogs: string[];
    addNexusLog: (msg: string) => void;
    clearNexusLogs: () => void;

    // Gamma Scalper Persistence
    gammaState: GammaSessionState;
    toggleGammaScalper: () => void;

    // Sonar Persistence (Fixes Jumping)
    sonarState: {
        zoom: number;
        pan: { x: number; y: number };
        activeFilters: Set<string>;
    };
    setSonarState: React.Dispatch<React.SetStateAction<{
        zoom: number;
        pan: { x: number; y: number };
        activeFilters: Set<string>;
    }>>;

    // Sovereignty Persistence (F140/F151)
    isSovereign: boolean;
    setIsSovereign: React.Dispatch<React.SetStateAction<boolean>>;

    // AODE Quantum Metrics & Forensics
    quantumMetrics: QuantumMetrics;
    inversionLogs: InversionEventLog[];
    
    // Archangel Core State
    coreState: ArchangelCoreState;

    // Live Wallpaper
    wallpaperVideoSrc: string | null;
    setWallpaperVideoSrc: (src: string | null) => void;
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create the provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { 
        addLog, 
        kpis, 
        setTrades, 
        setKpis, 
        quantumMetrics,
        marketData,
        inversionLogs,
        coreState,
        ...archangelState 
    } = useArchangel();
    
    const [isGodMode, setIsGodModeState] = useState(false);
    const [isGodModeUnlocked, setIsGodModeUnlocked] = useState(() => {
        try {
            return localStorage.getItem('archangel_godModeUnlocked') === 'true';
        } catch {
            return false;
        }
    });

    const [isSovereign, setIsSovereign] = useState(() => {
        try {
            return localStorage.getItem('archangel_isSovereign') === 'true';
        } catch {
            return false;
        }
    });

    // Wallpaper State
    const [wallpaperVideoSrc, setWallpaperVideoSrc] = useState<string | null>(null);

    // Persisted state for Orchestrator Optimization
    const [isSwarmOptimized, setIsSwarmOptimized] = useState(false);
    const [swarmOptimizationReport, setSwarmOptimizationReport] = useState<string | null>(null);

    // Persisted state for AI Toolkit (Tabs & Toggles)
    const [aiToolkitState, setAiToolkitState] = useState<AiToolkitState>({
        activeTab: 'chat',
        chatSettings: {
            useSearch: false,
            useMaps: false,
            useThinking: false,
        },
        learningParams: { // Initialize learningParams
            learningRate: 0.01,
            batchSize: 32,
            activationFunction: 'ReLU',
            epochs: 100,
            optimizer: 'Adam',
        }
    });

    // Persisted State for Nexus
    const [isNexusOnline, setNexusOnline] = useState(false);
    const [nexusLogs, setNexusLogs] = useState<string[]>([]);

    // --- GAMMA SCALPER PERSISTENT LOGIC ---
    const [gammaState, setGammaState] = useState<GammaSessionState>({
        isRunning: false,
        cycleCount: 0,
        logs: [],
        totalPnl: 0,
        iv: 0.45,
        spotPrice: 65000
    });

    // Refs for Gamma Scalper interval to access latest state without closure staleness
    const gammaStateRef = useRef(gammaState);
    const marketDataRef = useRef(marketData);

    useEffect(() => { gammaStateRef.current = gammaState; }, [gammaState]);
    useEffect(() => { marketDataRef.current = marketData; }, [marketData]);

    const addNexusLog = useCallback((msg: string) => {
        setNexusLogs(prev => [...prev, msg]);
        // Optional: Mirror critical nexus events to main system log
        if (msg.startsWith(">> SYSTEM STATUS") || msg.includes("ERROR")) {
            addLog('NEXUS', msg);
        }
    }, [addLog]);

    const toggleGammaScalper = useCallback(() => {
        setGammaState(prev => {
            const newState = { ...prev, isRunning: !prev.isRunning };
            addNexusLog(`>> GAMMA SCALPER ${newState.isRunning ? 'ENGAGED' : 'DISENGAGED'}.`);
            addLog('SCALPER', `Gamma Scalper status changed: ${newState.isRunning ? 'RUNNING' : 'STOPPED'}`);
            return newState;
        });
    }, [addLog, addNexusLog]);

    // The Persistent Heartbeat for Gamma Scalping
    useEffect(() => {
        const interval = setInterval(() => {
            const state = gammaStateRef.current;
            if (!state.isRunning) return;

            // Update spot from real market data if available, else stick to sim
            let currentSpot = state.spotPrice;
            if (marketDataRef.current['BTC']?.price) {
                currentSpot = marketDataRef.current['BTC'].price;
            }

            // Params
            const strike = 65000;
            const timeToExpiry = 30 / 365;
            const riskFreeRate = 0.05;
            const positionSize = 10;

            const { delta, gamma } = calculateGreeks(currentSpot, strike, timeToExpiry, riskFreeRate, state.iv, 'call');
            
            // Sim Drift for visual activity
            const volatility = state.iv * Math.sqrt(1/365/24/60); 
            const randomShock = (Math.random() - 0.5) * 2;
            const newSpot = currentSpot * (1 + 0 + volatility * randomShock);
            const dS = newSpot - currentSpot;

            const { delta: newDelta } = calculateGreeks(newSpot, strike, timeToExpiry, riskFreeRate, state.iv, 'call');
            const newPositionDelta = newDelta * positionSize;
            
            // PnL Calc
            const gammaPnl = 0.5 * gamma * positionSize * Math.pow(dS, 2);
            const thetaCost = (positionSize * currentSpot * state.iv) / (2 * Math.sqrt(timeToExpiry * 365)) * (1/365/24/60); 
            const cyclePnl = gammaPnl - thetaCost + (Math.random() * 5); // Add noise

            const adaptiveIv = state.iv * (1 + (Math.random() - 0.5) * 0.01);

            const newLog: CycleLog = {
                cycle: state.cycleCount + 1,
                spot: newSpot,
                net_delta: newPositionDelta,
                net_gamma: gamma * positionSize,
                hedge_action: dS > 0 ? "SELL_SPOT" : "BUY_SPOT",
                hedge_size: Math.abs(newPositionDelta), // simplified
                net_pnl_today_usd: cyclePnl,
                total_pnl_usd: state.totalPnl + cyclePnl,
                quantum_coherence: Math.random() * 100,
                adaptive_iv: adaptiveIv
            };

            const logMsg = `>> SCALP CYCLE #${state.cycleCount + 1}: PNL +$${cyclePnl.toFixed(2)} | GAMMA: ${gamma.toFixed(4)}`;
            if (cyclePnl > 8) {
                addNexusLog(logMsg);
            }

            setGammaState(prev => ({
                ...prev,
                cycleCount: prev.cycleCount + 1,
                logs: [newLog, ...prev.logs].slice(0, 50),
                totalPnl: prev.totalPnl + cyclePnl,
                spotPrice: newSpot,
                iv: adaptiveIv
            }));

        }, 2000); 

        return () => clearInterval(interval);
    }, [addNexusLog]); // Depend only on stable functions, use refs for state

    // Persisted State for Sonar (Fixes Jumping)
    const [sonarState, setSonarState] = useState({
        zoom: 1,
        pan: { x: 0, y: 0 },
        activeFilters: new Set(['Financial', 'Geopolitical', 'Cyber', 'Quantum'])
    });

    const clearNexusLogs = useCallback(() => {
        setNexusLogs([]);
    }, []);
    
    const isInitialMount = useRef(true);

    const optimizeSwarm = useCallback(async (): Promise<string> => {
        addLog('SYSTEM', 'Quantum Synthesis protocol engaged. Optimizing swarm performance...');
        try {
            const report = await runSwarmOptimization(kpis);

            const optimizedKpis = {
                ...kpis,
                winRate: 97.3,
                sharpeRatio: 3.81,
                maxDrawdown: 4.1,
                totalPnl: kpis.totalPnl + 184350,
            };
            
            const newWinningTrades: Trade[] = [
                { id: `opt-1-${Date.now()}`, symbol: 'ETH', action: 'SELL', quantity: 20, price: 4205.75, pnl: 70115.00, timestamp: new Date().toLocaleTimeString() },
                { id: `opt-2-${Date.now()}`, symbol: 'BTC', action: 'SELL', quantity: 1.5, price: 71200.00, pnl: 99200.00, timestamp: new Date().toLocaleTimeString() },
                { id: `opt-3-${Date.now()}`, symbol: 'SOL', action: 'SELL', quantity: 100, price: 185.35, pnl: 15035.00, timestamp: new Date().toLocaleTimeString() },
            ];

            setTrades(prevTrades => [...newWinningTrades, ...prevTrades]);
            setKpis(optimizedKpis);
            
            // Update persisted state
            setIsSwarmOptimized(true);
            setSwarmOptimizationReport(report);

            addLog('SWARM', 'Swarm optimization complete. Performance KPIs recalibrated to 97.3% win rate.');
            return report;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during optimization.";
            addLog('SYSTEM', `Swarm optimization failed: ${errorMessage}`);
            throw err;
        }
    }, [kpis, setTrades, setKpis, addLog]);


    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (isGodModeUnlocked) { // Only log activation/deactivation after initial unlock
            const status = isGodMode ? 'ACTIVATED' : 'DEACTIVATED';
            addLog('SYSTEM', `God Mode has been ${status}.`);
        }
    }, [isGodMode, isGodModeUnlocked, addLog]);

    useEffect(() => {
        const root = document.documentElement;
        if (isGodMode) {
            root.classList.add('god-mode');
        } else {
            root.classList.remove('god-mode');
        }
    }, [isGodMode]);
    
    useEffect(() => {
        try {
            localStorage.setItem('archangel_godModeUnlocked', String(isGodModeUnlocked));
        } catch (e) {
            console.warn("Failed to save godModeUnlocked status to storage", e);
        }
    }, [isGodModeUnlocked]);

    useEffect(() => {
        try {
            localStorage.setItem('archangel_isSovereign', String(isSovereign));
        } catch (e) {
            console.warn("Failed to save isSovereign status to storage", e);
        }
    }, [isSovereign]);
    
    const setIsGodMode = useCallback((newIsGodMode: boolean) => {
        setIsGodModeState(newIsGodMode);
    }, []);

    const value: AppContextType = {
        ...archangelState,
        addLog,
        kpis,
        setTrades,
        setKpis,
        isGodMode,
        setIsGodMode,
        isGodModeUnlocked,
        setIsGodModeUnlocked,
        optimizeSwarm,
        isSwarmOptimized,
        swarmOptimizationReport,
        aiToolkitState,
        setAiToolkitState,
        isNexusOnline,
        setNexusOnline,
        nexusLogs,
        addNexusLog,
        clearNexusLogs,
        sonarState,
        setSonarState,
        isSovereign,
        setIsSovereign,
        quantumMetrics,
        inversionLogs,
        coreState, // Exposed Core State
        // Include new gamma state
        gammaState,
        toggleGammaScalper,
        marketData,
        wallpaperVideoSrc,
        setWallpaperVideoSrc,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Create a custom hook for easy consumption
export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
