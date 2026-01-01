
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { useArchangel } from '../hooks/useArchangel';
import { Trade, AnalyticsKPIs, MarketData, Portfolio, Bot, LogEntry, SonarSignal, AiToolkitState, QuantumMetrics, GammaSessionState, CycleLog, InversionEventLog, ArchangelCoreState, TradeMode, PrimeSuggestion, ProtocolNode, ProposedTrade, ExternalExchangeData, ArbOpportunity, ActiveOrder } from '../types';
import { runSwarmOptimization, sendMessageToSentinelA } from '../services/geminiService';
import { HardwareAuthority } from '../utils/hardwareAuthority';

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

// Daily Risk Guard Class (Strict)
class DailyRiskGuard {
    maxLoss: number;
    initialEquity: number;
    enabled: boolean;

    constructor(maxLossPct: number = 0.05, initialEquity: number = 100000) {
        this.maxLoss = initialEquity * maxLossPct;
        this.initialEquity = initialEquity;
        this.enabled = true;
    }

    check(currentEquity: number): { halted: boolean, loss: number } {
        const loss = this.initialEquity - currentEquity;
        if (this.enabled && loss >= this.maxLoss) {
            return { halted: true, loss };
        }
        return { halted: false, loss };
    }
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
    executeTrade: (symbol: string, action: 'BUY' | 'SELL', quantity: number, price: number, isPaper?: boolean, bracket?: { stopLoss?: number, takeProfit?: number }) => void;
    bots: Bot[];
    logs: LogEntry[];
    addLog: (source: LogEntry['source'], message: string) => void;
    historicalMarketData: Record<string, number[]>;
    marketFilter: string;
    setMarketFilter: (filter: string) => void;
    sonarSignals: SonarSignal[];
    setSonarSignals: React.Dispatch<React.SetStateAction<SonarSignal[]>>;
    isGodMode: boolean;
    setIsGodMode: (isGodMode: boolean) => void;
    isGodModeUnlocked: boolean;
    setIsGodModeUnlocked: (unlocked: boolean) => void;
    trades: Trade[];
    setTrades: React.Dispatch<React.SetStateAction<Trade[]>>;
    paperTrades: Trade[];
    activeOrders: ActiveOrder[];
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
    setQuantumMetrics: React.Dispatch<React.SetStateAction<QuantumMetrics>>;
    inversionLogs: InversionEventLog[];
    coreState: ArchangelCoreState;
    setCoreState: React.Dispatch<React.SetStateAction<ArchangelCoreState>>;
    wallpaperVideoSrc: string | null;
    setWallpaperVideoSrc: (src: string | null) => void;
    wallpaperOpacity: number;
    setWallpaperOpacity: (opacity: number) => void;
    wallpaperBlur: number;
    setWallpaperBlur: (blur: number) => void;
    heartbeat: () => void;
    triggerKillSwitch: () => void;
    signDevice: (deviceId: string) => void;
    killSwitchActive: boolean;
    tradeMode: TradeMode;
    setTradeMode: (mode: TradeMode) => void;
    primeSuggestions: PrimeSuggestion[];
    executeAllPrimeDirectives: (suggestions: string[]) => Promise<void>;
    protocolNodes: ProtocolNode[];
    pendingProposals: ProposedTrade[];
    setPendingProposals: React.Dispatch<React.SetStateAction<ProposedTrade[]>>;
    apiConnected: boolean;
    externalExchangeData: ExternalExchangeData;
    arbOpportunities: ArbOpportunity[];
    armLiveGate: () => Promise<void>;
    disarmLiveGate: () => void;
    attestHardware: (deviceId: string) => Promise<void>;
    executeOperation: () => Promise<void>;
    installProtocol: () => Promise<void>;
    runSystem: () => Promise<void>;
    systemStatus: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const archangel = useArchangel();
    
    const [isGodMode, setIsGodModeState] = useState(false);
    const [isGodModeUnlocked, setIsGodModeUnlocked] = useState(() => localStorage.getItem('archangel_godModeUnlocked') === 'true');
    const [isSovereign, setIsSovereign] = useState(() => localStorage.getItem('archangel_isSovereign') === 'true');
    const [wallpaperVideoSrc, setWallpaperVideoSrc] = useState<string | null>(null);
    const [wallpaperOpacity, setWallpaperOpacity] = useState(0.6);
    const [wallpaperBlur, setWallpaperBlur] = useState(0);
    const [isSwarmOptimized, setIsSwarmOptimized] = useState(false);
    const [swarmOptimizationReport, setSwarmOptimizationReport] = useState<string | null>(null);
    const [systemStatus, setSystemStatus] = useState<string>("STANDBY");

    const [aiToolkitState, setAiToolkitState] = useState<AiToolkitState>({
        activeTab: 'chat',
        chatSettings: { useSearch: false, useMaps: false, useThinking: false },
        learningParams: { learningRate: 0.01, batchSize: 32, activationFunction: 'ReLU', epochs: 100, optimizer: 'Adam' }
    });

    const [isNexusOnline, setNexusOnline] = useState(false);
    const [nexusLogs, setNexusLogs] = useState<string[]>([]);
    const [gammaState, setGammaState] = useState<GammaSessionState>({ isRunning: false, cycleCount: 0, logs: [], totalPnl: 0, iv: 0.45, spotPrice: 65000 });

    const gammaStateRef = useRef(gammaState);
    const marketDataRef = useRef(archangel.marketData);
    const riskGuardRef = useRef(new DailyRiskGuard(0.05, 100000));

    useEffect(() => { gammaStateRef.current = gammaState; }, [gammaState]);
    useEffect(() => { marketDataRef.current = archangel.marketData; }, [archangel.marketData]);

    // Initial Host Attestation
    useEffect(() => {
        HardwareAuthority.getHostFingerprint().then(fingerprint => {
            archangel.setCoreState(prev => ({
                ...prev,
                hardwareDevices: [
                    ...prev.hardwareDevices,
                    { 
                        id: "HOST_NODE_PRIMARY", 
                        type: "TPM_MODULE", 
                        status: "CONNECTED", 
                        firmwareVersion: fingerprint, 
                        lastAttestation: Date.now() 
                    }
                ]
            }));
            archangel.addLog('HARDWARE', `HOST BINDING ESTABLISHED: ${fingerprint}`);
        });
    }, []);

    const addNexusLog = useCallback((msg: string) => {
        setNexusLogs(prev => [...prev, msg]);
        if (msg.startsWith(">> SYSTEM STATUS") || msg.includes("ERROR")) archangel.addLog('NEXUS', msg);
    }, [archangel.addLog]);

    const toggleGammaScalper = useCallback(() => {
        setGammaState(prev => ({ ...prev, isRunning: !prev.isRunning }));
    }, []);

    // Risk Guard Check Interval
    useEffect(() => {
        const interval = setInterval(() => {
            const status = riskGuardRef.current.check(archangel.fiatBalance); 
            if (status.halted && !archangel.killSwitchActive) {
                archangel.triggerKillSwitch();
                addNexusLog(`>> DAILY MAX LOSS HIT ($${status.loss.toFixed(2)}). TRADING HALTED.`);
                archangel.addLog('SYSTEM', 'CRITICAL: DAILY LOSS LIMIT EXCEEDED. KILL SWITCH ENGAGED.');
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [archangel.fiatBalance, archangel.killSwitchActive, archangel.triggerKillSwitch, archangel.addLog, addNexusLog]);

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
        archangel.addLog('SYSTEM', 'Quantum Synthesis protocol engaged...');
        try {
            const report = await runSwarmOptimization(archangel.kpis);
            setIsSwarmOptimized(true);
            setSwarmOptimizationReport(report);
            return report;
        } catch (err) { throw err; }
    }, [archangel.kpis, archangel.addLog]);

    useEffect(() => {
        const root = document.documentElement;
        if (isGodMode) root.classList.add('god-mode'); else root.classList.remove('god-mode');
    }, [isGodMode]);
    
    useEffect(() => { localStorage.setItem('archangel_godModeUnlocked', String(isGodModeUnlocked)); }, [isGodModeUnlocked]);
    useEffect(() => { localStorage.setItem('archangel_isSovereign', String(isSovereign)); }, [isSovereign]);

    // Enhanced Sovereign Operations
    const executeOperation = useCallback(async () => {
        if (archangel.killSwitchActive) return;
        setSystemStatus("EXECUTING");
        archangel.addLog('DIRECTIVE', 'SOVEREIGN_EXECUTE: Initiating global SICO cascade...');
        addNexusLog('>> SYSTEM_OP: EXECUTE - ARMING PRIMARY MANIFOLD');
        await sendMessageToSentinelA("EXECUTE: Authorize all pending SICO orders across 7D topological substrate.");
        archangel.setCoreState(prev => ({...prev, lastSystemOp: 'EXECUTE'}));
        setSystemStatus("OPERATIONAL");
    }, [archangel.addLog, addNexusLog, archangel.killSwitchActive, archangel.setCoreState]);

    const installProtocol = useCallback(async () => {
        if (archangel.killSwitchActive) return;
        setSystemStatus("INSTALLING");
        archangel.addLog('DIRECTIVE', 'SOVEREIGN_INSTALL: Transmuting new operational axioms...');
        addNexusLog('>> SYSTEM_OP: INSTALL - UPDATING ARCHANGEL_CORE');
        await sendMessageToSentinelA("INSTALL: Inject next-gen alpha features into the UPB-1 compliance layer.");
        archangel.setCoreState(prev => ({...prev, lastSystemOp: 'INSTALL'}));
        setSystemStatus("INSTALLED");
    }, [archangel.addLog, addNexusLog, archangel.killSwitchActive, archangel.setCoreState]);

    const runSystem = useCallback(async () => {
        if (archangel.killSwitchActive) return;
        setSystemStatus("RUNNING");
        archangel.addLog('DIRECTIVE', 'SOVEREIGN_RUN: Engaging Living System v204.0...');
        addNexusLog('>> SYSTEM_OP: RUN - AWAKENING TURMOX Ω');
        await sendMessageToSentinelA("RUN: Initiate full-scale market hunting. Maximize Stochastic Alpha.");
        archangel.setCoreState(prev => ({...prev, lastSystemOp: 'RUN'}));
        setSystemStatus("LIVE");
    }, [archangel.addLog, addNexusLog, archangel.killSwitchActive, archangel.setCoreState]);
    
    const value: AppContextType = {
        marketData: archangel.marketData,
        portfolio: archangel.portfolio,
        setPortfolio: archangel.setPortfolio,
        paperPortfolio: archangel.paperPortfolio,
        setPaperPortfolio: archangel.setPaperPortfolio,
        fiatBalance: archangel.fiatBalance,
        paperBalance: archangel.paperBalance,
        depositFiat: archangel.depositFiat,
        withdrawFiat: archangel.withdrawFiat,
        executeTrade: archangel.executeTrade,
        bots: archangel.bots,
        logs: archangel.logs,
        addLog: archangel.addLog,
        historicalMarketData: archangel.historicalMarketData,
        marketFilter: archangel.marketFilter,
        setMarketFilter: archangel.setMarketFilter,
        sonarSignals: archangel.sonarSignals,
        setSonarSignals: archangel.setSonarSignals,
        isGodMode, 
        setIsGodMode: setIsGodModeState, 
        isGodModeUnlocked, 
        setIsGodModeUnlocked,
        trades: archangel.trades,
        setTrades: archangel.setTrades,
        paperTrades: archangel.paperTrades,
        activeOrders: archangel.activeOrders,
        kpis: archangel.kpis,
        setKpis: archangel.setKpis,
        optimizeSwarm, 
        isSwarmOptimized, 
        swarmOptimizationReport, 
        estimatedAlpha: archangel.estimatedAlpha,
        aiToolkitState, 
        setAiToolkitState, 
        isNexusOnline, 
        setNexusOnline, 
        nexusLogs, 
        addNexusLog, 
        clearNexusLogs,
        gammaState, 
        toggleGammaScalper, 
        sonarState, 
        setSonarState, 
        isSovereign, 
        setIsSovereign, 
        quantumMetrics: archangel.quantumMetrics,
        setQuantumMetrics: archangel.setQuantumMetrics,
        inversionLogs: archangel.inversionLogs,
        coreState: archangel.coreState,
        setCoreState: archangel.setCoreState,
        wallpaperVideoSrc, 
        setWallpaperVideoSrc,
        wallpaperOpacity,
        setWallpaperOpacity,
        wallpaperBlur,
        setWallpaperBlur,
        heartbeat: archangel.heartbeat,
        triggerKillSwitch: archangel.triggerKillSwitch,
        signDevice: archangel.signDevice,
        killSwitchActive: archangel.killSwitchActive,
        tradeMode: archangel.tradeMode,
        setTradeMode: archangel.setTradeMode,
        primeSuggestions: archangel.primeSuggestions,
        executeAllPrimeDirectives: archangel.executeAllPrimeDirectives,
        protocolNodes: archangel.protocolNodes,
        pendingProposals: archangel.pendingProposals,
        setPendingProposals: archangel.setPendingProposals,
        apiConnected: archangel.apiConnected,
        externalExchangeData: archangel.externalExchangeData,
        arbOpportunities: archangel.arbOpportunities,
        armLiveGate: archangel.armLiveGate,
        disarmLiveGate: archangel.disarmLiveGate,
        attestHardware: archangel.attestHardware,
        executeOperation,
        installProtocol,
        runSystem,
        systemStatus
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};
