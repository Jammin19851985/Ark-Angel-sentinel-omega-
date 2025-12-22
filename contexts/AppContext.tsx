import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { useArchangel } from '../hooks/useArchangel';
import { Trade, AnalyticsKPIs, MarketData, Portfolio, Bot, LogEntry, SonarSignal, AiToolkitState, QuantumMetrics, GammaSessionState, CycleLog, InversionEventLog, ArchangelCoreState, TradeMode, PrimeSuggestion, ProtocolNode } from '../types';
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

interface AppContextType {
    marketData: MarketData;
    portfolio: Portfolio;
    setPortfolio: React.Dispatch<React.SetStateAction<Portfolio>>;
    paperPortfolio: Portfolio;
    setPaperPortfolio: React.Dispatch<React.SetStateAction<Portfolio>>;
    fiatBalance: number;
    paperBalance: number;
    depositFiat: (amount: number, source: string) => void;
    withdrawFiat: (amount: number, destination: string) => boolean;
    executeTrade: (symbol: string, action: 'BUY' | 'SELL', quantity: number, price: number, isPaper?: boolean) => void;
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
    paperTrades: Trade[];
    kpis: AnalyticsKPIs;
    setKpis: React.Dispatch<React.SetStateAction<AnalyticsKPIs>>;
    optimizeSwarm: () => Promise<string>;
    isSwarmOptimized: boolean;
    swarmOptimizationReport: string | null;
    estimatedAlpha: number;
    aiToolkitState: AiToolkitState;
    setAiToolkitState: React.Dispatch<React.SetStateAction<AiToolkitState>>;
    isNexusOnline: boolean;
    setNexusOnline: React.Dispatch<React.SetStateAction<boolean>>;
    nexusLogs: string[];
    addNexusLog: (msg: string) => void;
    clearNexusLogs: () => void;
    gammaState: GammaSessionState;
    toggleGammaScalper: () => void;
    sonarState: { zoom: number; pan: { x: number; y: number }; activeFilters: Set<string>; };
    setSonarState: React.Dispatch<React.SetStateAction<{ zoom: number; pan: { x: number; y: number }; activeFilters: Set<string>; }>>;
    isSovereign: boolean;
    setIsSovereign: React.Dispatch<React.SetStateAction<boolean>>;
    quantumMetrics: QuantumMetrics;
    inversionLogs: InversionEventLog[];
    coreState: ArchangelCoreState;
    wallpaperVideoSrc: string | null;
    setWallpaperVideoSrc: (src: string | null) => void;
    heartbeat: () => void;
    triggerKillSwitch: () => void;
    signDevice: (deviceId: string) => void;
    killSwitchActive: boolean;
    tradeMode: TradeMode;
    setTradeMode: (mode: TradeMode) => void;
    primeSuggestions: PrimeSuggestion[];
    executeAllPrimeDirectives: (suggestions: string[]) => Promise<void>;
    protocolNodes: ProtocolNode[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { 
        addLog, kpis, setTrades, setKpis, quantumMetrics, marketData, inversionLogs, coreState,
        tradeMode, setTradeMode, primeSuggestions, executeAllPrimeDirectives, protocolNodes,
        triggerKillSwitch, heartbeat, signDevice, ...archangelState 
    } = useArchangel();
    
    const [isGodMode, setIsGodModeState] = useState(false);
    const [isGodModeUnlocked, setIsGodModeUnlocked] = useState(() => localStorage.getItem('archangel_godModeUnlocked') === 'true');
    const [isSovereign, setIsSovereign] = useState(() => localStorage.getItem('archangel_isSovereign') === 'true');
    const [wallpaperVideoSrc, setWallpaperVideoSrc] = useState<string | null>(null);
    const [isSwarmOptimized, setIsSwarmOptimized] = useState(false);
    const [swarmOptimizationReport, setSwarmOptimizationReport] = useState<string | null>(null);

    const [aiToolkitState, setAiToolkitState] = useState<AiToolkitState>({
        activeTab: 'chat',
        chatSettings: { useSearch: false, useMaps: false, useThinking: false },
        learningParams: { learningRate: 0.01, batchSize: 32, activationFunction: 'ReLU', epochs: 100, optimizer: 'Adam' }
    });

    const [isNexusOnline, setNexusOnline] = useState(false);
    const [nexusLogs, setNexusLogs] = useState<string[]>([]);
    const [gammaState, setGammaState] = useState<GammaSessionState>({ isRunning: false, cycleCount: 0, logs: [], totalPnl: 0, iv: 0.45, spotPrice: 65000 });

    const gammaStateRef = useRef(gammaState);
    const marketDataRef = useRef(marketData);

    useEffect(() => { gammaStateRef.current = gammaState; }, [gammaState]);
    useEffect(() => { marketDataRef.current = marketData; }, [marketData]);

    const addNexusLog = useCallback((msg: string) => {
        setNexusLogs(prev => [...prev, msg]);
        if (msg.startsWith(">> SYSTEM STATUS") || msg.includes("ERROR")) addLog('NEXUS', msg);
    }, [addLog]);

    const toggleGammaScalper = useCallback(() => {
        setGammaState(prev => ({ ...prev, isRunning: !prev.isRunning }));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const state = gammaStateRef.current;
            if (!state.isRunning) return;
            let currentSpot = marketDataRef.current['BTC']?.price || state.spotPrice;
            const { delta, gamma } = calculateGreeks(currentSpot, 65000, 30 / 365, 0.05, state.iv, 'call');
            const dS = (Math.random() - 0.5) * 10;
            const newSpot = currentSpot + dS;
            const cyclePnl = 0.5 * gamma * 10 * Math.pow(dS, 2);
            setGammaState(prev => ({
                ...prev,
                cycleCount: prev.cycleCount + 1,
                logs: [{ cycle: prev.cycleCount + 1, spot: newSpot, net_delta: delta * 10, net_gamma: gamma * 10, hedge_action: dS > 0 ? "SELL" : "BUY", hedge_size: Math.abs(delta * 10), net_pnl_today_usd: cyclePnl, total_pnl_usd: prev.totalPnl + cyclePnl }, ...prev.logs].slice(0, 50),
                totalPnl: prev.totalPnl + cyclePnl,
                spotPrice: newSpot,
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const [sonarState, setSonarState] = useState({ zoom: 1, pan: { x: 0, y: 0 }, activeFilters: new Set(['Financial', 'Geopolitical', 'Cyber', 'Quantum']) });

    const clearNexusLogs = useCallback(() => setNexusLogs([]), []);
    
    const optimizeSwarm = useCallback(async (): Promise<string> => {
        addLog('SYSTEM', 'Quantum Synthesis protocol engaged...');
        try {
            const report = await runSwarmOptimization(kpis);
            setIsSwarmOptimized(true);
            setSwarmOptimizationReport(report);
            return report;
        } catch (err) { throw err; }
    }, [kpis, addLog]);

    useEffect(() => {
        const root = document.documentElement;
        if (isGodMode) root.classList.add('god-mode'); else root.classList.remove('god-mode');
    }, [isGodMode]);
    
    useEffect(() => { localStorage.setItem('archangel_godModeUnlocked', String(isGodModeUnlocked)); }, [isGodModeUnlocked]);
    useEffect(() => { localStorage.setItem('archangel_isSovereign', String(isSovereign)); }, [isSovereign]);
    
    const value: AppContextType = {
        ...archangelState, addLog, kpis, setTrades, setKpis, isGodMode, setIsGodMode: setIsGodModeState, isGodModeUnlocked, setIsGodModeUnlocked,
        optimizeSwarm, isSwarmOptimized, swarmOptimizationReport, aiToolkitState, setAiToolkitState, isNexusOnline, setNexusOnline, nexusLogs, addNexusLog, clearNexusLogs,
        sonarState, setSonarState, isSovereign, setIsSovereign, quantumMetrics, inversionLogs, coreState, gammaState, toggleGammaScalper, marketData, wallpaperVideoSrc, setWallpaperVideoSrc,
        tradeMode, setTradeMode, primeSuggestions, executeAllPrimeDirectives, protocolNodes, triggerKillSwitch, heartbeat, signDevice
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};